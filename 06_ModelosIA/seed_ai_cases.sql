
-- SCRIPT DE CREACIÓN DE CASOS DE PRUEBA PARA IA - PMP SUITE v5.0 (CORREGIDO)
-- Este script genera datos históricos específicos para que el modelo de IA detecte patrones.

-- 0. Limpiar equipos y órdenes previas
DELETE FROM pmp.ordenes_servicio WHERE validador_serie IN ('VAL-LEMON-001', 'VAL-QR-FAULTY') OR consola_serie IN ('CON-SLA-002', 'CON-STABLE-001');
DELETE FROM pmp.validadores WHERE serie IN ('VAL-LEMON-001', 'VAL-QR-FAULTY');
DELETE FROM pmp.consolas WHERE serie IN ('CON-SLA-002', 'CON-STABLE-001');

INSERT INTO pmp.buses (ppu) VALUES ('ZZ-99-99') ON CONFLICT DO NOTHING;

-- 1. CASO 1: EL EQUIPO "LIMÓN" (ALTO RIESGO)
-- Serie: VAL-LEMON-001. Ha fallado 5 veces en los últimos 3 meses por lo mismo.
INSERT INTO pmp.validadores (serie, modelo, marca) VALUES ('VAL-LEMON-001', 'V3', 'Mikroe');

INSERT INTO pmp.ordenes_servicio (tipo_equipo, ticket_aranda, validador_serie, falla, estado_id, fecha, tecnico_terreno_id, terminal_id, pst_codigo, bus_ppu) VALUES
('VALIDADOR', 'AR-IA-001', 'VAL-LEMON-001', 'Falla EMV Lectura', 13, '2026-01-10', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99'),
('VALIDADOR', 'AR-IA-015', 'VAL-LEMON-001', 'Falla EMV - No detecta tarjeta', 13, '2026-01-25', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99'),
('VALIDADOR', 'AR-IA-045', 'VAL-LEMON-001', 'Falla EMV Reincidente', 13, '2026-02-15', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99'),
('VALIDADOR', 'AR-IA-080', 'VAL-LEMON-001', 'Falla Lector QR Sucio', 13, '2026-03-10', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99'),
('VALIDADOR', 'AR-IA-102', 'VAL-LEMON-001', 'Falla EMV Crítica', 13, '2026-04-05', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99');

-- 2. CASO 2: BAJO MTBF (RIESGO MEDIO-ALTO)
-- Serie: CON-SLA-002. Falla cada 15 días sistemáticamente.
INSERT INTO pmp.consolas (serie, modelo, marca) VALUES ('CON-SLA-002', 'C-Pro', 'Generic');

INSERT INTO pmp.ordenes_servicio (tipo_equipo, ticket_aranda, consola_serie, falla, estado_id, fecha, tecnico_terreno_id, terminal_id, pst_codigo, bus_ppu) VALUES
('CONSOLA', 'AR-IA-201', 'CON-SLA-002', 'Falla Alimentación Intermitente', 13, '2026-03-01', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99'),
('CONSOLA', 'AR-IA-215', 'CON-SLA-002', 'Falla Alimentación', 13, '2026-03-15', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99'),
('CONSOLA', 'AR-IA-230', 'CON-SLA-002', 'Falla Alimentación', 13, '2026-03-31', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99'),
('CONSOLA', 'AR-IA-245', 'CON-SLA-002', 'Falla Pantalla Táctil', 13, '2026-04-15', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99');

-- 3. CASO 3: FALLA DE LOTE / CAUSALIDAD (RIESGO ÁMBAR)
INSERT INTO pmp.validadores (serie, modelo, marca) VALUES ('VAL-QR-FAULTY', 'V3', 'Mikroe');

INSERT INTO pmp.ordenes_servicio (tipo_equipo, ticket_aranda, validador_serie, falla, estado_id, fecha, tecnico_terreno_id, terminal_id, pst_codigo, bus_ppu) VALUES
('VALIDADOR', 'AR-IA-301', 'VAL-QR-FAULTY', 'Falla Lector QR', 13, '2026-01-20', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99'),
('VALIDADOR', 'AR-IA-320', 'VAL-QR-FAULTY', 'Falla Lector QR', 13, '2026-04-10', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99');

-- 4. CASO 4: EQUIPO MUY ESTABLE (RIESGO VERDE)
INSERT INTO pmp.consolas (serie, modelo, marca) VALUES ('CON-STABLE-001', 'C-Pro', 'Generic');

INSERT INTO pmp.ordenes_servicio (tipo_equipo, ticket_aranda, consola_serie, falla, estado_id, fecha, tecnico_terreno_id, terminal_id, pst_codigo, bus_ppu) VALUES
('CONSOLA', 'AR-IA-505', 'CON-STABLE-001', 'Falla Menor Configuración', 13, '2025-10-10', (SELECT id FROM pmp.usuarios LIMIT 1), 1, 'U7', 'ZZ-99-99');
