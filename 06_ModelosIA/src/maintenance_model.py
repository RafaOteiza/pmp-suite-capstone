
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

def generate_synthetic_data(samples=500):
    """
    Genera datos sintéticos basados en patrones reales para entrenar el modelo demo.
    """
    np.random.seed(42)
    data = {
        'dias_desde_ultima_falla': np.random.randint(1, 180, samples),
        'fallas_acumuladas': np.random.randint(0, 10, samples),
        'es_validador': np.random.randint(0, 2, samples),
        'temperatura_operacion': np.random.randint(20, 50, samples),
        'uso_intensivo': np.random.randint(0, 2, samples)
    }

    df = pd.DataFrame(data)

    # Lógica de falla (Target): falla si tiene muchas fallas previas y poco tiempo desde la última
    df['reincidencia_proxima'] = (
        (df['fallas_acumuladas'] > 5) & (df['dias_desde_ultima_falla'] < 30) |
        (df['uso_intensivo'] == 1) & (df['temperatura_operacion'] > 45)
    ).astype(int)

    return df

def train_model():
    print("-> Iniciando entrenamiento del Modelo de Mantenimiento Predictivo...")

    # 1. Obtener datos
    df = generate_synthetic_data()

    X = df.drop('reincidencia_proxima', axis=1)
    y = df['reincidencia_proxima']

    # 2. Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

    # 3. Fit (Random Forest)
    model = RandomForestClassifier(n_estimators=100)
    model.fit(X_train, y_train)

    # 4. Evaluar
    y_pred = model.predict(X_test)
    print("\nReporte de Clasificación:")
    print(classification_report(y_test, y_pred))

    # 5. Guardar modelo
    os.makedirs('../modelos', exist_ok=True)
    joblib.dump(model, '../modelos/predictor_reincidencia.pkl')
    print("\n✅ Modelo guardado en: 06_ModelosIA/modelos/predictor_reincidencia.pkl")

if __name__ == "__main__":
    train_model()
