
import { Router } from "express";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { firebaseAuth } from "../middleware/firebaseAuth.js";
import { ensureUser } from "../middleware/ensureUser.js";
import { enforceReadOnlyRole } from "../middleware/readOnlyRole.js";
import { requireAnyRole } from "../middleware/requireAnyRole.js";
import { VALID_ROLES } from "../constants/roles.js";

const router = Router();
router.use(firebaseAuth, ensureUser, enforceReadOnlyRole);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * GET /api/ai/predictive-report
 * Ejecuta el script de Python y retorna el top de equipos en riesgo.
 */
router.get("/predictive-report", requireAnyRole(...VALID_ROLES), (req, res) => {
    console.log("--- IA ROUTE HIT ---");
    // Ruta al script de Python (Subimos 4 niveles: routes -> src -> pmp-api -> 03_Backend -> Tesis)
    const scriptPath = path.join(__dirname, "../../../../06_ModelosIA/src/analyzer.py");
    
    // Comando para ejecutar (usando el python del sistema)
    // Se recomienda usar el path absoluto al ejecutable si hay múltiples instalaciones
    const command = `python "${scriptPath}" --json`;

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing AI script: ${error.message}`);
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ 
                error: "Falla al ejecutar servicio de IA", 
                details: stderr || error.message 
            });
        }
        
        try {
            const data = JSON.parse(stdout);
            res.json(data);
        } catch (e) {
            console.error("Error parsing AI output:", stdout);
            console.error("Parse Error:", e.message);
            res.status(500).json({ 
                error: "Error en formato de datos de IA",
                output: stdout 
            });
        }
    });
});

export default router;
