import admin from "../firebase.js";

export async function firebaseAuth(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Missing Bearer token" });

    const decoded = await admin.auth().verifyIdToken(token);

    req.firebase = {
      uid: decoded.uid,
      email: decoded.email || null,
      name: decoded.name || null
    };

    next();
  } catch {
    return res.status(401).json({ error: "Invalid Firebase token" });
  }
}