import pandas as pd
import numpy as np
from datetime import timedelta

# 1. Leer el archivo limpio que copiaste
df = pd.read_csv("reparaciones_limpio_para_ia.csv")

# 2. Asegurarnos de que las fechas sean tipo datetime
df["Ingreso"] = pd.to_datetime(df["Ingreso"], errors="coerce")
df["Salida"] = pd.to_datetime(df["Salida"], errors="coerce")

# 3. Ordenar por Serie y fecha de ingreso
df = df.sort_values(["Serie", "Ingreso"]).reset_index(drop=True)

rows = []

for serie, grp in df.groupby("Serie"):
    grp = grp.sort_values("Ingreso").reset_index(drop=True)

    # primera fecha de ingreso de ese equipo (proxy de "edad")
    first_ingreso = grp["Ingreso"].iloc[0]

    for idx, row in grp.iterrows():
        t = row["Ingreso"]
        if pd.isna(t):
            continue  # si no tiene fecha de ingreso, no sirve para IA

        # eventos anteriores de este mismo equipo (antes de t)
        prev = grp[grp["Ingreso"] < t]

        # eventos futuros (después de t)
        next_events = grp[grp["Ingreso"] > t]

        # ---- FEATURES (lo que el modelo ve) ----
        # 1) Número de reparaciones en los últimos 6 meses
        num_rep_6m = prev[prev["Ingreso"] >= t - timedelta(days=180)].shape[0]

        # 2) Número de reparaciones en los últimos 12 meses
        num_rep_12m = prev[prev["Ingreso"] >= t - timedelta(days=365)].shape[0]

        # 3) Días desde la última reparación
        if not prev.empty:
            dias_desde_ultima = (t - prev["Ingreso"].max()).days
        else:
            dias_desde_ultima = np.nan

        # 4) Edad del equipo (días desde la primera vez que ingresó)
        edad_dias = (t - first_ingreso).days if pd.notna(first_ingreso) else np.nan

        # ---- LABEL (lo que queremos predecir) ----
        # ¿Este equipo volverá a fallar dentro de los próximos 30 días?
        futura = next_events[next_events["Ingreso"] <= t + timedelta(days=30)]
        fallo_30d = 1 if not futura.empty else 0

        rows.append({
            "Serie": serie,
            "Modelo": row["Modelo"],
            "Ingreso": t,
            "Estado_normalizado": row["Estado_normalizado"],
            "num_reparaciones_6m": num_rep_6m,
            "num_reparaciones_12m": num_rep_12m,
            "dias_desde_ultima_reparacion": dias_desde_ultima,
            "edad_dias": edad_dias,
            "fallo_30d": fallo_30d,
        })

df_ia = pd.DataFrame(rows)

# 4. Limpieza final de features (sin NaN en numéricos)
df_ia["edad_dias"] = df_ia["edad_dias"].fillna(0)
df_ia["dias_desde_ultima_reparacion"] = df_ia["dias_desde_ultima_reparacion"].fillna(
    df_ia["edad_dias"]
)

# 5. Guardar dataset final para entrenamiento de IA
df_ia.to_csv("equipos_historial.csv", index=False, encoding="utf-8-sig")

print("Dataset para IA generado como 'equipos_historial.csv'")
print("Filas:", df_ia.shape[0])
print("Columnas:", df_ia.shape[1])
print("Distribución de la etiqueta fallo_30d:")
print(df_ia["fallo_30d"].value_counts())
