# CODAI Platform - Asistente de Desarrollo Fullstack

¡Bienvenido a **CODAI**! Este proyecto es una plataforma fullstack diseñada para ser un asistente de desarrollo inteligente, impulsado por inteligencia artificial. Utiliza **David AI** (potenciado por Groq y Llama 3.1) para ayudar a los desarrolladores con dudas de programación, sugerencia de código y gestión de pequeños proyectos.

## 🚀 Características Principales

- **Chatbot Inteligente (David AI):** Resuelve dudas técnicas, sugiere fragmentos de código y proporciona mentoría en tiempo real impulsado mediante los veloces modelos de lenguaje alojados en Groq.
- **Rendimiento Ultrarrápido:** El backend construido con FastAPI provee respuestas de baja latencia y alta concurrencia.
- **Interfaz Moderna:** Frontend construido con las últimas características de Angular (v21), soportando renderizado de sintaxis de código con Markdown y `highlight.js`.
- **Integración con Base de Datos:** Backend conectado a Supabase (PostgreSQL) para gestionar perfiles de usuarios, historiales de chat y proyectos.
- **Utilidades de Código:** Vista de código fuente en la interfaz de chat con funcionalidad de copiado rápido al portapapeles.

## 🏗️ Arquitectura de la Aplicación

El repositorio está dividido en tres directorios principales:

1. **/backend**
   - API RESTful de alto rendimiento desarrollada en **Python** con **FastAPI**.
   - Se encarga de la comunicación directa con Supabase para almacenamiento de datos.
   - Interactúa con la API de **Groq** para generar las respuestas de la IA.
   - Funcionalidades y módulos estructurados para seguridad nativa (Autenticación JWT, Endpoints asíncronos).

2. **/frontend**
   - Una aplicación cliente robusta de estilo Single Page Application (SPA), creada con **Angular 21**.
   - Integra `marked.js` e `highlight.js` para renderizar el contenido markdown generado por la inteligencia artificial.

3. **/dataset-tools**
   - Contiene scripts y herramientas experimentales para la gestión y refinamientos de datasets para la IA.

## ⚙️ Configuración y Montaje (Desarrollo)

Para levantar el entorno completo se requiere correr tanto el frontend como el backend.

### 1. Backend (FastAPI)
```bash
cd backend

# Instalar las dependencias
pip install -r requirements.txt

# Configurar variables de entorno (copiar e incorporar tus API keys/claves)
copy .env.example .env

# Ejecutar el servidor de desarrollo
uvicorn app.main:app --reload --port 8000
```
> **Nota:** Para mayor detalle, dirigirse a [backend/README.md](./backend/README.md).

### 2. Frontend (Angular)
```bash
cd frontend

# Instalar los paquetes Node.js
npm install

# Correr en desarrollo
npm start
```
> **Nota:** La aplicación se servirá por defecto en `http://localhost:4200/`.

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Angular 21, TypeScript, Marked, Highlight.js, CSS
- **Backend:** Python 3.10+, FastAPI, Uvicorn, Pydantic
- **Base de Datos:** PostgreSQL (mediante Supabase)
- **Inteligencia Artificial:** Groq API (Llama 3.1)

---
*Desarrollado con pasión para mejorar las experiencias de programación y aprendizaje.*
