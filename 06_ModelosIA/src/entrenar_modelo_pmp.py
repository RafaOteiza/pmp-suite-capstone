import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix
import joblib

# 1. Leer dataset para IA
df = pd.read_csv("equipos_historial.csv")

# 2. Features y label
features = [
    "num_reparaciones_6m",
    "num_reparaciones_12m",
    "edad_dias",
    "dias_desde_ultima_reparacion",
]

X = df[features]
y = df["fallo_30d"]

# 3. Train / Test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# 4. Modelo con peso balanceado
modelo = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    class_weight="balanced"  # << CLAVE
)

modelo.fit(X_train, y_train)

# 5. Evaluación con umbral estándar (0.5)
y_pred = modelo.predict(X_test)

print("== REPORTE DE CLASIFICACIÓN (umbral 0.5) ==")
print(classification_report(y_test, y_pred))

print("== MATRIZ DE CONFUSIÓN ==")
print(confusion_matrix(y_test, y_pred))

# 6. Opcional: evaluar con umbral más agresivo (ej. 0.4)
y_proba = modelo.predict_proba(X_test)[:, 1]
y_pred_04 = (y_proba >= 0.4).astype(int)

print("\n== REPORTE DE CLASIFICACIÓN (umbral 0.4) ==")
print(classification_report(y_test, y_pred_04))
print("== MATRIZ DE CONFUSIÓN (umbral 0.4) ==")
print(confusion_matrix(y_test, y_pred_04))

# 7. Guardar modelo y features (dejamos el modelo tal cual, con umbral 0.5;
#    el umbral se puede ajustar en el backend cuando se interpretan las probabilidades)
joblib.dump(modelo, "modelo_falla_pmp.joblib")
joblib.dump(features, "columnas_modelo.joblib")

print("\nModelo guardado como 'modelo_falla_pmp.joblib'")
print("Features usadas:", features)
