# CODAI Backend

FastAPI backend para el asistente de desarrollo CODAI, potenciado por **David AI** (Groq + Llama 3.1).

## Setup

```bash
# 1. Instalar dependencias
pip install -r requirements.txt

# 2. Copiar el archivo de entorno
copy .env.example .env
# Edita .env con tus credenciales reales

# 3. Ejecutar en desarrollo
uvicorn app.main:app --reload --port 8000
```

## Variables de Entorno Requeridas

| Variable | Descripción |
|---|---|
| `SECRET_KEY` | Clave JWT (mínimo 32 caracteres) |
| `DATABASE_URL` | PostgreSQL async URL de Supabase |
| `GROQ_API_KEY` | API Key de Groq para David AI |
| `FRONTEND_URL` | URL del frontend Angular |

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login (retorna JWT) |
| POST | `/api/auth/refresh` | Renovar tokens |
| GET | `/api/auth/me` | Usuario actual |
| POST | `/api/chat/` | Enviar mensaje a David |
| GET | `/api/chat/conversations` | Listar conversaciones |
| GET | `/api/chat/conversations/{id}` | Conversación con mensajes |
| DELETE | `/api/chat/conversations/{id}` | Eliminar conversación |
| POST | `/api/projects/` | Crear proyecto |
| GET | `/api/projects/` | Listar proyectos |
| GET | `/api/projects/{id}` | Ver proyecto |
| PATCH | `/api/projects/{id}` | Actualizar proyecto |
| DELETE | `/api/projects/{id}` | Eliminar proyecto |

Docs interactivos: `http://localhost:8000/docs`
