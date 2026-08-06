import { Router } from "express";
import admin from "../firebase.js";
import { pool } from "../db.js";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { requireRole } from "../middleware/requireRole.js";
import { enforceReadOnlyRole } from "../middleware/readOnlyRole.js";
import { ROLES, VALID_ROLES } from "../constants/roles.js";

const router = Router();
router.use(firebaseAuth, ensureUser, enforceReadOnlyRole);

// --- Funciones Auxiliares ---
function normalizeCorreo(value) {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length ? trimmed : null;
}

function cleanOptional(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

/**
 * POST /api/admin/users
 * Crear usuario nuevo con contraseña personalizada
 */
router.post("/", requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const correo = normalizeCorreo(req.body?.correo);
    const nombre = cleanOptional(req.body?.nombre);
    const apellido = cleanOptional(req.body?.apellido);
    const rol = cleanOptional(req.body?.rol)?.toLowerCase();
    // Recibimos la contraseña opcional, si no viene usamos una por defecto
    const password = req.body?.password && req.body.password.length >= 6 
                     ? req.body.password 
                     : "PmpDefaultPassword123!";

    if (!correo || !nombre || !apellido || !rol) {
      return res.status(400).json({ error: "Faltan datos obligatorios (correo, nombre, apellido, rol)" });
    }
    if (!VALID_ROLES.includes(rol)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    let fbUser;
    let firebaseUid = null;

    try {
      try {
        fbUser = await admin.auth().getUserByEmail(correo);
        
        // Si existe, actualizamos datos
        const fullName = `${nombre} ${apellido}`.trim();
        if (fbUser.displayName !== fullName || fbUser.disabled) {
           fbUser = await admin.auth().updateUser(fbUser.uid, {
             displayName: fullName,
             disabled: false
           });
        }
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          // CREAR con la contraseña recibida
          fbUser = await admin.auth().createUser({
            email: correo,
            displayName: `${nombre} ${apellido}`.trim(),
            disabled: false,
            password: password 
          });
        } else {
          throw err;
        }
      }
      
      firebaseUid = fbUser.uid;
      await admin.auth().setCustomUserClaims(firebaseUid, { rol });

    } catch (fbErr) {
      console.error("Error Firebase POST:", fbErr);
      return res.status(400).json({ error: "Error gestionando usuario en Firebase", detail: fbErr.message });
    }

    // Guardar en PostgreSQL
    const upsert = `
      INSERT INTO pmp.usuarios (correo, nombre, apellido, rol, activo, firebase_uid)
      VALUES ($1, $2, $3, $4, TRUE, $5)
      ON CONFLICT (correo)
      DO UPDATE SET
        nombre = EXCLUDED.nombre,
        apellido = EXCLUDED.apellido,
        rol = EXCLUDED.rol,
        activo = TRUE,
        firebase_uid = EXCLUDED.firebase_uid
      RETURNING id, correo, nombre, apellido, rol, activo;
    `;

    const result = await pool.query(upsert, [correo, nombre, apellido, rol, firebaseUid]);

    return res.status(201).json({
      user: result.rows[0],
      firebase: { uid: firebaseUid, email: fbUser.email }
    });

  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/admin/users/:id
 * Edición con Vinculación Proactiva
 */
router.put("/:id", requireRole(ROLES.ADMIN), async (req, res, next) => {
  const { id } = req.params;
  const nombre = cleanOptional(req.body?.nombre);
  const apellido = cleanOptional(req.body?.apellido);
  const correo = normalizeCorreo(req.body?.correo);
  const rol = cleanOptional(req.body?.rol)?.toLowerCase();
  
  let activo = null;
  if (req.body.activo !== undefined) {
      activo = req.body.activo === true || req.body.activo === "true";
  }

  if (!nombre && !apellido && !correo && !rol && activo === null) {
    return res.status(400).json({ error: "No hay campos para actualizar" });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // 1. Validar unicidad correo
    if (correo) {
        const check = await client.query(
            "SELECT id FROM pmp.usuarios WHERE correo = $1 AND id != $2::uuid", 
            [correo, id]
        );
        if (check.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({ error: "El correo ya está en uso por otro usuario." });
        }
    }

    // 2. Update Postgres
    const sets = [];
    const params = [id];
    let paramIdx = 2;

    if (nombre) { sets.push(`nombre = $${paramIdx++}`); params.push(nombre); }
    if (apellido) { sets.push(`apellido = $${paramIdx++}`); params.push(apellido); }
    if (correo) { sets.push(`correo = $${paramIdx++}`); params.push(correo); }
    if (rol) { sets.push(`rol = $${paramIdx++}`); params.push(rol); }
    if (activo !== null) { sets.push(`activo = $${paramIdx++}`); params.push(activo); }

    const sql = `
        UPDATE pmp.usuarios 
        SET ${sets.join(", ")} 
        WHERE id = $1::uuid 
        RETURNING *, firebase_uid
    `;

    const pgResult = await client.query(sql, params);

    if (pgResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Usuario no encontrado en base de datos." });
    }

    const updatedUser = pgResult.rows[0];

    // 3. Sincronizar Firebase
    try {
        const fbUpdates = {};
        if (correo) fbUpdates.email = correo;
        if (nombre || apellido) fbUpdates.displayName = `${nombre || updatedUser.nombre} ${apellido || updatedUser.apellido}`.trim();
        if (activo !== null) fbUpdates.disabled = !activo;

        let targetUid = updatedUser.firebase_uid || id;

        try {
            await admin.auth().updateUser(targetUid, fbUpdates);
            
            // --- NUEVO: Vinculación Proactiva ---
            // Si la actualización funcionó y no teníamos el ID guardado en BD, lo guardamos ahora.
            if (!updatedUser.firebase_uid) {
                console.log(`[Fix] Vinculando usuario ${updatedUser.correo} con UID ${targetUid}`);
                await client.query("UPDATE pmp.usuarios SET firebase_uid = $1 WHERE id = $2::uuid", [targetUid, id]);
            }

        } catch (updateErr) {
            if (updateErr.code === 'auth/user-not-found') {
                 // Recuperación por correo
                 try {
                     const recoveredUser = await admin.auth().getUserByEmail(updatedUser.correo);
                     targetUid = recoveredUser.uid;
                     
                     await admin.auth().updateUser(targetUid, fbUpdates);
                     
                     // Guardamos el UID recuperado
                     await client.query("UPDATE pmp.usuarios SET firebase_uid = $1 WHERE id = $2::uuid", [targetUid, id]);

                 } catch (subErr) {
                     throw updateErr; // Activar Self-Healing de Creación
                 }
            } else {
                throw updateErr;
            }
        }
        
        if (rol) await admin.auth().setCustomUserClaims(targetUid, { rol });

    } catch (fbErr) {
        // Self-Healing (Creación)
        if (fbErr.code === 'auth/user-not-found') {
            try {
                const newUser = await admin.auth().createUser({
                    uid: id,
                    email: updatedUser.correo,
                    displayName: `${updatedUser.nombre} ${updatedUser.apellido}`,
                    disabled: !updatedUser.activo,
                    password: "PmpDefaultPassword123!"
                });
                
                if (rol) await admin.auth().setCustomUserClaims(newUser.uid, { rol });
                await client.query("UPDATE pmp.usuarios SET firebase_uid = $1 WHERE id = $2::uuid", [newUser.uid, id]);

            } catch (createErr) {
                await client.query("ROLLBACK");
                if (createErr.code === 'auth/email-already-exists') {
                     return res.status(409).json({ error: "Conflicto crítico: El correo ya existe en otra cuenta." });
                }
                throw createErr;
            }
        } else if (fbErr.code === 'auth/email-already-exists') {
             await client.query("ROLLBACK");
             return res.status(409).json({ error: "El correo ya está registrado en Firebase." });
        } else {
            throw fbErr; 
        }
    }

    await client.query("COMMIT");
    res.json({ user: updatedUser });

  } catch (err) {
    if (client) { try { await client.query("ROLLBACK"); } catch (e) {} }
    console.error("Error PUT:", err);
    res.status(500).json({ error: "Error interno del servidor", detail: err.message });
  } finally {
    if (client) client.release();
  }
});

// ... Mantener resto de endpoints (activar/desactivar/passwords) ...
async function toggleActivo(req, res, estado) {
    const { id } = req.params;
    let client;
    try {
        client = await pool.connect();
        await client.query("BEGIN");
        const result = await client.query("UPDATE pmp.usuarios SET activo = $1 WHERE id = $2::uuid RETURNING *, firebase_uid", [estado, id]);
        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ error: "Usuario no encontrado" });
        }
        try {
            const targetUid = result.rows[0].firebase_uid || id;
            await admin.auth().updateUser(targetUid, { disabled: !estado });
        } catch (e) { }
        await client.query("COMMIT");
        res.json({ user: result.rows[0] });
    } catch (err) {
        if (client) await client.query("ROLLBACK");
        res.status(500).json({ error: err.message });
    } finally {
        if (client) client.release();
    }
}
router.patch("/:id/activar", requireRole(ROLES.ADMIN), (req, res) => toggleActivo(req, res, true));
router.patch("/:id/desactivar", requireRole(ROLES.ADMIN), (req, res) => toggleActivo(req, res, false));

router.post("/:id/reset-password-link", requireRole(ROLES.ADMIN), async (req, res, next) => {
  try {
    const { id } = req.params;
    const r = await pool.query("SELECT correo FROM pmp.usuarios WHERE id = $1::uuid", [id]);
    if (r.rowCount === 0) return res.status(404).json({ error: "User not found" });
    const link = await admin.auth().generatePasswordResetLink(r.rows[0].correo);
    res.json({ correo: r.rows[0].correo, link });
  } catch (err) { next(err); }
});

router.post("/:id/set-password", requireRole(ROLES.ADMIN), async (req, res) => {
    const { id } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: "Password muy corto" });
    try {
        const r = await pool.query("SELECT firebase_uid FROM pmp.usuarios WHERE id = $1::uuid", [id]);
        let targetUid = id;
        if (r.rows.length > 0 && r.rows[0].firebase_uid) targetUid = r.rows[0].firebase_uid;
        await admin.auth().updateUser(targetUid, { password });
        res.json({ ok: true });
    } catch (e) {
        res.status(400).json({ error: "Error actualizando password", detail: e.message });
    }
});

export default router;
