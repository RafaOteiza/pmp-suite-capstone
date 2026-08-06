import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container" style={{ maxWidth: 700, marginTop: 60 }}>
      <div className="card">
        <h2 className="title">404</h2>
        <p className="muted">Página no encontrada.</p>
        <Link className="btn" to="/">Volver</Link>
      </div>
    </div>
  );
}
