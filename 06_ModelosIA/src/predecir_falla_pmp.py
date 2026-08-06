import pandas as pd
import joblib

# 1. Cargar modelo y columnas
modelo = joblib.load("modelo_falla_pmp.joblib")
features = joblib.load("columnas_modelo.joblib")

# 2. Definir los datos de un equipo (ejemplo)
#    Estos valores podrían venir después desde tu backend PMP Suite
datos_equipo = {
    "num_reparaciones_6m": 2,
    "num_reparaciones_12m": 4,
    "edad_dias": 800,
    "dias_desde_ultima_reparacion": 45,
}

# 3. Construir DataFrame con las columnas en el orden correcto
df_nuevo = pd.DataFrame([datos_equipo])[features]

# 4. Predicción
pred = modelo.predict(df_nuevo)
proba = modelo.predict_proba(df_nuevo)

print("Predicción (0 = no falla, 1 = falla):", pred[0])
print("Probabilidades [no falla, falla]:", proba[0])
