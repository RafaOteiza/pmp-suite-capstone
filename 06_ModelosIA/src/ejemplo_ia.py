import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report

# 1. Dataset de ejemplo (luego será tu CSV real)
data = {
    "num_reparaciones_6m": [0, 1, 2, 3, 4, 5, 1, 0, 3, 2],
    "edad_dias":           [100, 200, 400, 800, 1200, 1500, 300, 150, 900, 600],
    "horas_uso_diarias":   [2, 4, 8, 10, 12, 14, 6, 3, 9, 7],
    # 0 = no falló en 30 días, 1 = falló en 30 días
    "fallo_30d":           [0, 0, 1, 1, 1, 1, 0, 0, 1, 0],
}

df = pd.DataFrame(data)

# 2. Features (X) y etiqueta (y)
X = df[["num_reparaciones_6m", "edad_dias", "horas_uso_diarias"]]
y = df["fallo_30d"]

# 3. Train / Test
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42
)

# 4. Modelo
modelo = RandomForestClassifier(random_state=42)
modelo.fit(X_train, y_train)

# 5. Evaluación
y_pred = modelo.predict(X_test)
print("Reporte de clasificación:")
print(classification_report(y_test, y_pred))

# 6. Predicción nueva SIN warning
nuevo_equipo = pd.DataFrame([{
    "num_reparaciones_6m": 2,
    "edad_dias": 500,
    "horas_uso_diarias": 8,
}])

prediccion = modelo.predict(nuevo_equipo)
probabilidades = modelo.predict_proba(nuevo_equipo)

print("Predicción (0 = no falla, 1 = falla):", prediccion[0])
print("Probabilidades [no falla, falla]:", probabilidades[0])
