// src/middleware/ensureUser.js
import { pool } from "../db.js";

export function createEnsureUser(dbPool = pool) {
  return async function ensureUserMiddleware(req, res, next) {
    try {
      const fb = req.firebase;
      if (!fb?.uid) return res.status(401).json({ error: "Missing Firebase context" });

      const email = fb.email ? String(fb.email).trim() : null;
      if (!email) return res.status(401).json({ error: "Missing email in Firebase token" });

      const userRes = await dbPool.query(
        `
        SELECT id, nombre, apellido, correo, rol, activo
        FROM pmp.usuarios
        WHERE lower(correo) = lower($1)
        LIMIT 1;
        `,
        [email]
      );

      if (userRes.rowCount === 0) {
        return res.status(403).json({
          error: "Usuario no habilitado",
          detail: "El usuario no existe en la base de datos o no tiene acceso asignado."
        });
      }

      const user = userRes.rows[0];

      if (user.activo === false) {
        return res.status(403).json({
          error: "Usuario inactivo",
          detail: "El usuario existe, pero esta deshabilitado en la base de datos."
        });
      }

      const rol = user.rol ? String(user.rol).trim() : null;

      req.user = {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo,
        rol,
        activo: user.activo,
        roles: rol ? [rol] : []
      };

      return next();
    } catch (err) {
      return next(err);
    }
  };
}

export const ensureUser = createEnsureUser();
