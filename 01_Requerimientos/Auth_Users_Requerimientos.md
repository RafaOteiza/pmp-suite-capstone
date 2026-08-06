# Módulo: Autenticación y Gestión de Usuarios

Este documento detalla los requisitos y especificaciones para el módulo de Autenticación y Gestión de Usuarios del sistema PMP Suite.

## 1. Requisitos Funcionales (RF)

*   **RF.AU.1:** El sistema debe permitir a los usuarios autenticarse utilizando sus credenciales de Firebase (correo electrónico y contraseña).
*   **RF.AU.2:** El sistema debe validar el rol del usuario autenticado en la base de datos de PostgreSQL para determinar sus permisos de acceso.
*   **RF.AU.3:** El sistema debe permitir a los usuarios recuperar su contraseña a través de un enlace de reseteo enviado a su correo electrónico (self-service).
*   **RF.AU.4:** El sistema debe permitir a los usuarios cambiar su contraseña una vez autenticados (self-service).
*   **RF.AU.5:** El sistema debe permitir a los administradores (rol 'admin') listar todos los usuarios del sistema.
*   **RF.AU.6:** El sistema debe permitir a los administradores filtrar la lista de usuarios por nombre, apellido, correo, rol y estado de actividad.
*   **RF.AU.7:** El sistema debe permitir a los administradores crear nuevos usuarios, asignándoles un rol y una contraseña inicial.
*   **RF.AU.8:** El sistema debe permitir a los administradores editar la información de un usuario existente (nombre, apellido, correo, rol, estado activo).
*   **RF.AU.9:** El sistema debe permitir a los administradores activar o desactivar usuarios.
*   **RF.AU.10:** El sistema debe permitir a los administradores resetear la contraseña de cualquier usuario.
*   **RF.AU.11:** El sistema debe garantizar que un usuario solo pueda acceder a su propia información de perfil, a menos que tenga el rol de administrador.
*   **RF.AU.12:** El sistema debe redirigir al usuario a una página de inicio de sesión si no está autenticado al intentar acceder a una ruta protegida.
*   **RF.AU.13:** El sistema debe redirigir a los usuarios autenticados a un dashboard específico según su rol (ej. técnico de laboratorio a /lab/dashboard, técnico de terreno a /operacion/ingreso, QA a /qa, Logística a /bodega, Admin a /dashboard general).
*   **RF.AU.14:** El sistema debe proporcionar mensajes de error claros al usuario en caso de fallos de autenticación o autorización.

## 2. Requisitos No Funcionales (RNF)

*   **RNF.AU.1 (Seguridad):** El sistema debe utilizar Firebase Authentication como proveedor principal de identidad.
*   **RNF.AU.2 (Seguridad):** La comunicación entre el frontend (web y móvil) y el backend debe ser a través de tokens JWT firmados y validados.
*   **RNF.AU.3 (Seguridad):** El backend debe validar estrictamente los tokens JWT con Firebase Admin SDK y verificar la existencia y el estado activo del usuario en la base de datos para todas las solicitudes protegidas.
*   **RNF.AU.4 (Seguridad):** El sistema debe implementar autorización basada en roles (RBAC) para restringir el acceso a funcionalidades y datos específicos.
*   **RNF.AU.5 (Seguridad):** Las contraseñas no deben almacenarse en texto plano y deben gestionarse a través de Firebase Authentication.
*   **RNF.AU.6 (Seguridad):** El almacenamiento de credenciales sensibles (ej. tokens JWT) en el frontend web debe mitigar ataques XSS (ej. usando HttpOnly cookies o sessionStorage).
*   **RNF.AU.7 (Seguridad):** El almacenamiento de credenciales sensibles en la aplicación móvil debe utilizar mecanismos seguros del sistema operativo (Keychains/Keystore).
*   **RNF.AU.8 (Rendimiento):** Las consultas de autenticación y autorización deben tener un tiempo de respuesta inferior a 500ms.
*   **RNF.AU.9 (Mantenibilidad):** El código relacionado con la autenticación y autorización debe ser modular y fácil de mantener.
*   **RNF.AU.10 (Usabilidad):** La interfaz de usuario debe proporcionar una experiencia clara e intuitiva para el inicio de sesión, registro y gestión de perfil.
*   **RNF.AU.11 (Escalabilidad):** El sistema de autenticación debe ser capaz de soportar un número creciente de usuarios sin degradación significativa del rendimiento.

## 3. Historias de Usuario (HU)

*   **HU.AU.1 (Inicio de Sesión):** Como usuario, quiero iniciar sesión con mi correo y contraseña para acceder al sistema.
    *   **Criterios de Aceptación:**
        *   Dado que ingreso credenciales válidas, cuando hago clic en "Iniciar Sesión", entonces se me redirige a mi dashboard correspondiente.
        *   Dado que ingreso credenciales inválidas, cuando hago clic en "Iniciar Sesión", entonces veo un mensaje de error.
        *   Dado que mi cuenta está inactiva en la base de datos, cuando intento iniciar sesión, entonces veo un mensaje indicando que mi cuenta está deshabilitada.
*   **HU.AU.2 (Recuperación de Contraseña):** Como usuario, quiero solicitar un enlace para restablecer mi contraseña si la he olvidado.
    *   **Criterios de Aceptación:**
        *   Dado que ingreso mi correo electrónico registrado, cuando hago clic en "Olvidé mi contraseña", entonces recibo un enlace de reseteo en mi bandeja de entrada.
*   **HU.AU.3 (Cambio de Contraseña):** Como usuario autenticado, quiero cambiar mi contraseña para mejorar la seguridad de mi cuenta.
    *   **Criterios de Aceptación:**
        *   Dado que estoy autenticado y proporciono mi nueva contraseña (que cumple los requisitos de seguridad), cuando confirmo el cambio, entonces mi contraseña se actualiza.
*   **HU.AU.4 (Visualización de Perfil):** Como usuario, quiero ver mi información de perfil (nombre, apellido, correo, rol) una vez autenticado.
    *   **Criterios de Aceptación:**
        *   Dado que estoy autenticado, cuando accedo a la sección de mi perfil, entonces veo mis datos personales y mi rol actual.
*   **HU.AU.5 (Gestión de Usuarios - Admin):** Como administrador, quiero listar, crear, editar, activar/desactivar y restablecer contraseñas de usuarios para gestionar el acceso al sistema.
    *   **Criterios de Aceptación:**
        *   Dado que tengo el rol de 'admin', cuando accedo a la sección de gestión de usuarios, entonces puedo ver la lista de todos los usuarios.
        *   Cuando creo un nuevo usuario con datos válidos y un rol, entonces el usuario es creado en Firebase y PostgreSQL.
        *   Cuando edito un usuario, entonces los cambios se reflejan en Firebase y PostgreSQL.
        *   Cuando activo/desactivo un usuario, entonces su estado se sincroniza en Firebase y PostgreSQL.
        *   Cuando reseteo la contraseña de un usuario, entonces Firebase envía un enlace de reseteo.
*   **HU.AU.6 (Control de Acceso por Rol):** Como usuario, quiero que el sistema me guíe a las secciones relevantes para mi rol y me impida acceder a aquellas para las que no tengo permisos.
    *   **Criterios de Aceptación:**
        *   Dado que mi rol es 'tecnico_laboratorio', cuando inicio sesión, entonces soy redirigido al dashboard de laboratorio.
        *   Dado que intento acceder a una ruta de administrador sin tener el rol 'admin', entonces se me deniega el acceso con un mensaje apropiado.

## 4. Casos de Uso (CU)

*   **CU.AU.1: Iniciar Sesión**
    *   **Actor:** Usuario
    *   **Precondiciones:** El usuario tiene una cuenta activa en Firebase y en PostgreSQL.
    *   **Flujo Normal:**
        1.  El usuario accede a la página de inicio de sesión.
        2.  El usuario introduce su correo electrónico y contraseña.
        3.  El sistema valida las credenciales con Firebase.
        4.  El sistema verifica el estado y rol del usuario en PostgreSQL.
        5.  El sistema redirige al usuario a su dashboard principal según su rol.
    *   **Flujos Alternativos:**
        *   **FA.1.1: Credenciales inválidas:** El sistema muestra un mensaje de error y permite reintentar.
        *   **FA.1.2: Usuario inactivo en DB:** El sistema deniega el acceso y muestra un mensaje de cuenta deshabilitada.
*   **CU.AU.2: Crear Usuario (Administrador)**
    *   **Actor:** Administrador
    *   **Precondiciones:** El administrador ha iniciado sesión y tiene los permisos necesarios.
    *   **Flujo Normal:**
        1.  El administrador accede a la sección de gestión de usuarios.
        2.  El administrador selecciona "Crear Nuevo Usuario".
        3.  El administrador introduce correo, nombre, apellido, rol y una contraseña opcional.
        4.  El sistema crea el usuario en Firebase Authentication (o lo actualiza si ya existe por email).
        5.  El sistema guarda/actualiza la información del usuario y su `firebase_uid` en PostgreSQL.
        6.  El sistema confirma la creación del usuario.
    *   **Flujos Alternativos:**
        *   **FA.2.1: Correo ya registrado:** El sistema informa que el correo ya está en uso.
        *   **FA.2.2: Rol inválido:** El sistema rechaza la operación e informa que el rol no es válido.
*   **CU.AU.3: Actualizar Perfil de Usuario (Administrador)**
    *   **Actor:** Administrador
    *   **Precondiciones:** El administrador ha iniciado sesión y tiene los permisos necesarios.
    *   **Flujo Normal:**
        1.  El administrador busca y selecciona un usuario en la lista.
        2.  El administrador edita los campos deseados (nombre, apellido, correo, rol, activo).
        3.  El sistema actualiza la información del usuario en PostgreSQL.
        4.  El sistema sincroniza los cambios relevantes (correo, nombre, estado activo) en Firebase Authentication.
        5.  El sistema confirma la actualización.
    *   **Flujos Alternativos:**
        *   **FA.3.1: Correo duplicado:** El sistema rechaza la actualización y notifica que el correo ya está en uso por otro usuario.
        *   **FA.3.2: Usuario no encontrado:** El sistema notifica que el usuario no existe.
*   **CU.AU.4: Cambiar Contraseña (Self-Service)**
    *   **Actor:** Usuario autenticado
    *   **Precondiciones:** El usuario ha iniciado sesión.
    *   **Flujo Normal:**
        1.  El usuario accede a la sección de cambio de contraseña.
        2.  El usuario introduce y confirma la nueva contraseña.
        3.  El sistema envía la nueva contraseña a Firebase Authentication para su actualización.
        4.  El sistema confirma el cambio de contraseña.
    *   **Flujos Alternativos:**
        *   **FA.4.1: Contraseña no cumple requisitos:** El sistema informa sobre la longitud o complejidad mínima.

## 5. Especificaciones Técnicas Clave

*   **Tecnología de Autenticación:** Firebase Authentication (SDK de cliente en frontend/móvil, Admin SDK en backend).
*   **Base de Datos de Usuarios:** Tabla `pmp.usuarios` en PostgreSQL, con columnas `id (uuid)`, `correo (UNIQUE)`, `nombre`, `apellido`, `rol`, `activo (DEFAULT TRUE)`, `firebase_uid (UNIQUE, INDEXADO)`.
*   **Autorización:** Implementación de middlewares en el backend (`firebaseAuth`, `ensureUser`, `requireRole`, `requireSelfOrAdmin`) que validan JWT y el rol del usuario contra `pmp.usuarios`.
*   **Gestión de Roles:** Roles definidos como cadenas de texto (ej. "admin", "tecnico_laboratorio"). Se recomienda la migración a `ENUM` en PostgreSQL.
*   **Almacenamiento de Tokens (Frontend Web):** Actualmente en `localStorage`. **Requiere migración a HttpOnly/Secure Cookies o `sessionStorage` para mitigar XSS.**
*   **Almacenamiento de Tokens (Mobile):** Actualmente en `AsyncStorage`. **Requiere migración a Keychains (iOS) / Keystore (Android) para seguridad.**
*   **Variables de Entorno:** URLs de API y credenciales de Firebase Admin SDK deben gestionarse mediante variables de entorno (Backend: `.env`; Frontend Web: `.env.local` / `VITE_XXX`; Mobile: `app.config.js` / `expo-constants`).
*   **Sincronización:** Lógica de "self-healing" entre Firebase Auth y `pmp.usuarios` para crear/vincular usuarios si hay inconsistencias.
*   **API Endpoints Clave:**
    *   `GET /api/auth/me`: Obtener perfil del usuario autenticado.
    *   `POST /api/auth/reset-password-link`: Solicitar link de reseteo (self-service).
    *   `POST /api/auth/password`: Cambiar contraseña (self-service).
    *   `GET /api/users`: Listar usuarios (solo admin).
    *   `POST /api/admin/users`: Crear usuario (solo admin).
    *   `PUT /api/admin/users/:id`: Editar usuario (solo admin).
    *   `PATCH /api/admin/users/:id/activar|desactivar`: Activar/desactivar usuario (solo admin).
    *   `POST /api/admin/users/:id/reset-password-link`: Solicitar link de reseteo para usuario específico (solo admin).
    *   `POST /api/users/:id/password`: Establecer contraseña para usuario específico (solo admin).
*   **Manejo de Errores:** Respuestas HTTP estándar (`401 Unauthorized`, `403 Forbidden`, `400 Bad Request`, `404 Not Found`). Los mensajes de error del backend deben ser genéricos en producción.
