# 🦉 Ollie — English Tutor

Una app de aprendizaje de inglés con IA, pensada para práctica diaria. Construida con React + TypeScript + Vite + Tailwind CSS, y un backend serverless en Vercel que protege tu API key de Anthropic.

## Estructura del proyecto

```
ollie-english-tutor/
├── api/
│   └── chat.ts              # Función serverless de Vercel (llama a Anthropic con la key oculta)
├── public/                  # Assets estáticos (vacío por ahora)
├── src/
│   ├── components/          # Componentes de UI (Dashboard, LessonView, Sidebar, etc.)
│   ├── hooks/
│   │   └── useProfile.ts    # Hook de perfil del estudiante (persiste en localStorage)
│   ├── lib/
│   │   ├── api.ts           # Cliente que llama a /api/chat
│   │   ├── date.ts          # Utilidades de fecha
│   │   ├── errors.ts        # Mensajes amigables de error / rate-limit
│   │   ├── level.ts         # Cálculo de nivel a partir de XP
│   │   ├── profile.ts       # Perfil por defecto, racha, XP
│   │   └── prompt.ts        # Construcción del system prompt de Ollie
│   ├── App.tsx               # Componente raíz (orquesta estado y vistas)
│   ├── constants.ts          # Currículo, logros, partes de la lección
│   ├── index.css             # Tailwind + estilos globales
│   ├── main.tsx               # Punto de entrada de React
│   └── types.ts               # Tipos TypeScript compartidos
├── index.html                 # HTML raíz que carga main.tsx
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vercel.json
├── vite.config.ts
├── .env.example
└── .gitignore
```

## 1. Instalación

```bash
npm install
```

## 2. Configura tu API key de Anthropic

La app llama a la API de Claude **a través de tu propio backend** (`api/chat.ts`), nunca directamente desde el navegador. Esto significa que tu API key vive solo en el servidor y nunca se expone al público.

1. Copia el archivo de ejemplo:
   ```bash
   cp .env.example .env
   ```
2. Abre `.env` y pega tu key real de [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys):
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-tu-key-real-aqui
   ```
3. **Nunca subas `.env` a GitHub** — ya está en `.gitignore` por defecto.

## 3. Desarrollo local

Hay dos formas de correr el proyecto en local, según si quieres probar también la función serverless (`/api/chat`):

### Opción A — Solo frontend (más simple, pero sin IA funcionando)
```bash
npm run dev
```
Esto levanta Vite en `http://localhost:5173`. La UI funciona, pero las llamadas a `/api/chat` fallarán porque Vite no ejecuta funciones serverless por sí solo.

### Opción B — Frontend + backend juntos (recomendado, usa la CLI de Vercel)
```bash
npm install -g vercel   # solo la primera vez
vercel dev
```
Esto simula el entorno real de Vercel en tu máquina: sirve el frontend de Vite **y** ejecuta `api/chat.ts` como función serverless en el mismo puerto, leyendo `ANTHROPIC_API_KEY` desde tu `.env`. Así puedes probar la app completa, con IA incluida, antes de publicarla.

## 4. Build de producción (verificación local)

```bash
npm run build
npm run preview
```

## 5. Subir a GitHub

```bash
git init
git add .
git commit -m "Ollie English Tutor — proyecto inicial"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git push -u origin main
```

`.env` no se subirá porque está en `.gitignore` — eso es intencional y correcto.

## 6. Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub.
2. "Add New Project" → selecciona el repo que acabas de subir.
3. Vercel detectará automáticamente que es un proyecto Vite (gracias a `vercel.json`).
4. **Antes de hacer deploy**, ve a **Settings → Environment Variables** y agrega:
   - Key: `ANTHROPIC_API_KEY`
   - Value: tu key real (la misma que pusiste en `.env`)
   - Aplica a: Production, Preview y Development
5. Haz clic en **Deploy**.

Listo — tu API key queda guardada de forma segura en los servidores de Vercel, nunca en el código ni en el navegador del visitante.

## ¿Por qué un backend y no solo el frontend?

Un sitio estático no puede llamar directamente a `api.anthropic.com` sin exponer la API key en el código JavaScript que cualquier visitante puede leer (vista de código fuente, DevTools, pestaña de Network). Por eso este proyecto incluye `api/chat.ts`: una función serverless que corre en los servidores de Vercel, donde la key vive como variable de entorno y nunca llega al navegador.

## Notas sobre el almacenamiento del progreso

El progreso del estudiante (XP, racha, logros, historial) se guarda con `localStorage`, es decir, **en el navegador de cada visitante**, no en una base de datos compartida. Esto significa:
- El progreso persiste entre sesiones en el mismo navegador/dispositivo.
- Si el estudiante usa otro navegador o dispositivo, no verá su progreso anterior.
- Si limpia los datos del navegador, el progreso se pierde.

Si más adelante quieres progreso compartido entre dispositivos, lo siguiente sería agregar una base de datos (por ejemplo Vercel Postgres o Supabase) y un sistema de login simple.
