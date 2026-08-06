import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

import authRoutes from "./routes/auth.routes.js";
import osRoutes from "./routes/os.routes.js";
import usersRoutes from "./routes/users.routes.js";
import adminUsersRoutes from "./routes/admin.users.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js"; // <--- 1. IMPORTAR
import labRoutes from "./routes/lab.routes.js";
import qaRoutes from "./routes/qa.routes.js";
import bodegaRoutes from "./routes/bodega.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import masterRoutes from "./routes/master.routes.js";
import badgeRoutes from "./routes/badges.routes.js";
import aiRoutes from "./routes/ai.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes); // Movido arriba
app.use("/api/os", osRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/lab", labRoutes);
app.use("/api/qa", qaRoutes);
app.use("/api/bodega", bodegaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/dashboard", badgeRoutes);
// app.use("/api/ai", aiRoutes); // Ya movido arriba

app.get("/api/health", (req, res) => res.json({ status: "ok", service: "PMP AI Engine" }));

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Internal Server Error" });
});

export default app;