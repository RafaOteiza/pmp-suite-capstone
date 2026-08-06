
import pandas as pd
import psycopg2
import os
from dotenv import load_dotenv
from sklearn.ensemble import RandomForestClassifier
import datetime

# Cargar variables de entorno usando ruta absoluta relativa al script
script_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(script_dir, '../../03_Backend/pmp-api/.env')
load_dotenv(env_path)

DB_URL = os.getenv('DATABASE_URL')

def get_connection():
    if not DB_URL:
        raise ValueError("DATABASE_URL no encontrada en el archivo .env")
    return psycopg2.connect(DB_URL)

def analyze_failures():
    conn = get_connection()
    query = """
    SELECT
        COALESCE(validador_serie, consola_serie) as serie_equipo,
        tipo_equipo,
        falla,
        fecha as fecha_falla,
        (SELECT count(*) FROM pmp.ordenes_servicio o2
         WHERE COALESCE(o2.validador_serie, o2.consola_serie) = COALESCE(o.validador_serie, o.consola_serie)
         AND o2.fecha < o.fecha) as fallas_previas
    FROM pmp.ordenes_servicio o
    """
    df = pd.read_sql(query, conn)
    conn.close()

    if df.empty:
        print("No hay datos suficientes para el análisis de IA.")
        return

    # Feature Engineering Simple
    df['fecha_falla'] = pd.to_datetime(df['fecha_falla'])

    # Identificar fallas críticas
    df['es_emv'] = df['falla'].str.contains('EMV', case=False).astype(int)
    df['es_barcode'] = df['falla'].str.contains('BARCODE|QR|LECTOR', case=False).astype(int)

    # Análisis de Reincidencia
    reincidentes = df[df['fallas_previas'] > 1]['serie_equipo'].unique()

    print(f"--- REPORTE DE INTELIGENCIA OPERATIVA ---")
    print(f"Total de Órdenes Analizadas: {len(df)}")
    print(f"Equipos con Reincidencia Detectada: {len(reincidentes)}")
    print(f"Predominancia EMV: {df['es_emv'].sum()} casos")
    print(f"Predominancia Lectores: {df['es_barcode'].sum()} casos")

    # Simulación de Predicción de Próxima Falla
    df['riesgo_score'] = (df['fallas_previas'] * 0.3 + df['es_emv'] * 0.5).clip(0, 1)

    return df

if __name__ == "__main__":
    import sys
    import json

    results = analyze_failures()
    if results is not None:
        if "--json" in sys.argv:
            # Solo devolver el top 10 de riesgo para el dashboard
            top_risk = results.sort_values(by='riesgo_score', ascending=False).head(10)
            print(top_risk.to_json(orient='records'))
        else:
            print("--- ANÁLISIS COMPLETADO ---")
