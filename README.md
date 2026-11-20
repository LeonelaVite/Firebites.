# FireBites

FireBites es una aplicación web para mostrar gomitas y dulces picantes. El proyecto usa React y Vite para la página, y Express y MongoDB para guardar productos, solicitudes de contacto y cuentas administradoras.

## Requisitos

- Node.js 20.19 o posterior.
- npm.
- Una base de datos MongoDB para guardar información.
- Una clave de Gemini para activar las recomendaciones del asistente.

## Iniciar la página

Desde la carpeta principal:

```bash
npm install
npm run dev
```

Vite inicia la página de desarrollo. Por defecto, el navegador consulta la API en `http://localhost:3000/api`.

## Iniciar el backend

Instala las dependencias del servidor:

```bash
cd backend
npm install
```

Copia `backend/.env.example` como `backend/.env` y completa los valores localmente. No publiques `backend/.env` ni compartas sus claves. `MONGODB_URI` y `SESSION_SECRET` habilitan las funciones que guardan datos y las sesiones administrativas. `GEMINI_API_KEY` activa el chatbot.

Inicia el servidor desde la carpeta `backend`:

```bash
npm start
```

Para crear la cuenta administradora inicial, completa `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `backend/.env` y ejecuta desde `backend`:

```bash
npm run create-admin
```

La contraseña debe tener al menos 12 caracteres. En la base de datos se guarda un hash, no la contraseña legible.

## Funciones

- Catálogo público con productos activos de MongoDB.
- Formulario que guarda solicitudes de contacto en MongoDB.
- Inicio de sesión con contraseña protegida y sesión persistida en MongoDB.
- Panel para crear, editar y eliminar productos, y revisar o eliminar solicitudes.
- Chatbot Gemini que consulta el catálogo desde el backend y solo recomienda productos existentes.
- Diseño responsive para computadoras y celulares.

Sin una URI de MongoDB, el backend puede iniciar para comprobar su estado, pero las funciones que requieren datos indican que MongoDB no está conectado. El chatbot también requiere una clave de Gemini.

## Comprobaciones locales

Desde la carpeta principal:

```bash
npm run lint
npm run build
```

## Configuración para publicar

1. Crea un repositorio de GitHub y conecta este proyecto con ese repositorio.
2. Copia `.env.example` a `.env` para desarrollo local. Para la publicación, crea `.env.production` en la carpeta principal. Ambos archivos quedan fuera de Git.
3. En `.env.production`, configura `VITE_API_URL` con la URL pública del backend seguida de `/api`, y `VITE_BASE_PATH` como `/<nombre-exacto-del-repositorio>/`.
4. Configura MongoDB Atlas y el servicio de backend con `MONGODB_URI`, `SESSION_SECRET`, `FRONTEND_URL` y `NODE_ENV=production`. `SESSION_SECRET` debe ser una clave aleatoria de al menos 32 caracteres.
5. Configura `GEMINI_API_KEY` únicamente en el backend. La clave nunca debe empezar con `VITE_` ni guardarse en la carpeta del frontend.
6. Cuando el repositorio remoto esté configurado, ejecuta `npm run deploy`. El comando construye la página y publica `dist` en la rama `gh-pages`.

No ejecutes el paso 6 hasta revisar que `VITE_API_URL` y `VITE_BASE_PATH` apunten a los servicios reales. GitHub Pages publica la página; MongoDB y Gemini requieren sus cuentas y claves por separado. No incluyas archivos `.env` en GitHub.
