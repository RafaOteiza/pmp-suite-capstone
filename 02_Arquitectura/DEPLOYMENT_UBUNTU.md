# Guía de Pase a Pre-Producción (Ubuntu Server) - v5.0 (Edición Gold)
**Proyecto:** PMP Suite
**Sistema Operativo Destino:** Ubuntu 22.04 / 24.04 LTS

¡Lanzar la plataforma a un servidor real le dará muchísimo peso a la Tesis y a la presentación! Para lograr esto de forma robusta e industrial, la mejor manera de montar todo (Base de Datos, Backend y Frontend) en el mismo servidor de Ubuntu es utilizando la triada de **Nginx** (para servir la web), **PM2** (para mantener el backend vivo) y **PostgreSQL nativo**.

Sigue este paso a paso en tu servidor Ubuntu:

---

## 🛑 PASO 1: Preparar el Entorno (Ubuntu)

Ingresa a tu servidor Ubuntu y actualiza todo el sistema:
```bash
sudo apt update && sudo apt upgrade -y
```

Instala Node.js (versión 20, requerida por el backend) y NPM:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Instala las herramientas globales necesarias:
```bash
# PM2 mantiene vivo el backend indefinidamente y lo reinicia si se cae
sudo npm install -g pm2
```

Instala Python 3 y dependencias del Módulo de IA:
```bash
sudo apt install -y python3 python3-pip python3-venv
# Instalar librerías de IA globalmente o en venv (recomendado global para scripts simples)
pip3 install pandas scikit-learn psycopg2-binary python-dotenv
```

---

## 🗄️ PASO 2: Instalar y Configurar PostgreSQL

1. Instala el motor de base de datos de PostgreSQL:
```bash
sudo apt install -y postgresql postgresql-contrib
```

2. Ingresa a la consola de Postgres para crear la BD y las credenciales:
```bash
sudo -u postgres psql
```

3. Dentro del prompt `postgres=#`, corre estos comandos:
```sql
CREATE DATABASE pmp_suite;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'admin';
ALTER DATABASE pmp_suite OWNER TO postgres;
GRANT ALL PRIVILEGES ON DATABASE pmp_suite TO postgres;
\q
```

4. **Inicialización de Datos de Producción (Importante):**
Para que el sistema tenga vida desde el primer minuto en producción, una vez clonado el repo en el servidor, ejecuta:
```bash
cd /var/www/pmp-suite/03_Backend/pmp-api
# Crea las tablas (vía dump o scripts iniciales)
# Luego, limpia equipos de test y carga la flota operativa:
node clean_test_inventory.js
node seed_from_real_inventory.js
node seed_installed_equipment.js
```

---

## ⚙️ PASO 3: Levantar el Backend (API Node.js)

1. Sube o clona tu código desde Git al servidor.
2. Ingresa a la carpeta del backend y descarga las dependencias:
```bash
cd /var/www/pmp-suite/03_Backend/pmp-api
npm install
```

3. Asegúrate de configurar tu `.env` con la `DATABASE_URL` correcta apuntando a `localhost`.

4. Enciende el backend bajo **PM2**:
```bash
pm2 start server.js --name "pmp-api"
pm2 save
pm2 startup
```

---

## 🖥️ PASO 4: Construir el Frontend (React/Vite)

1. Ingresa la carpeta del frontend en tu servidor:
```bash
cd /var/www/pmp-suite/04_Frontend
```

2. Instala dependencias y compila (Build):
```bash
npm install
npm run build
```
Esto generará la carpeta `/dist/` con la aplicación optimizada.

---

## 🌐 PASO 5: Nginx (Servidor Web y Proxy Inverso)

1. Instala Nginx:
```bash
sudo apt install -y nginx
```

2. Configura el bloque de servidor para redirigir el tráfico:
```nginx
server {
    listen 80;
    server_name tu-ip-de-ubuntu;

    location / {
        root /var/www/pmp-suite/04_Frontend/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

3. Reinicia Nginx para aplicar cambios:
```bash
sudo systemctl restart nginx
```

---

## 🎉 PASO 6: Fase de Pruebas Final
Una vez en línea, puedes ejecutar la suite de validación final para certificar el despliegue:
```bash
cd /var/www/pmp-suite/03_Backend/pmp-api
node e2e_full_v2.js
```
