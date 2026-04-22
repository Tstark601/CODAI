# 🚀 Guía: Cambiar entre Groq (Nube) y Modelo Local (GGUF)

He modificado el backend para que puedas alternar fácilmente entre la API de Groq en la nube (la conexión actual) y tu modelo recién entrenado de forma local, **sin perder ninguna funcionalidad.**

Sigue estos pasos cuando estés listo para probar tu modelo GGUF localmente:

## Paso 1: Levantar el Modelo Localmente

Puedes usar **Ollama** o **LM Studio** para correr tu modelo `.gguf`. Ambas opciones exponen un servidor local en tu equipo.

### Opción A: Usando Ollama (Recomendado)
1. Descarga e instala [Ollama](https://ollama.com/).
2. Descarga tu archivo `llama-3-8b-instruct.Q4_K_M.gguf` desde Google Drive a tu equipo.
3. Crea un archivo de texto llamado `Modelfile` en la misma carpeta del `.gguf` con este contenido:
   ```dockerfile
   FROM ./llama-3-8b-instruct.Q4_K_M.gguf
   ```
4. Abre una terminal en esa carpeta y ejecuta:
   ```bash
   ollama create david_model_gguf -f Modelfile
   ```
5. Ollama ya estará corriendo en segundo plano en `http://localhost:11434/v1`.

### Opción B: Usando LM Studio
1. Descarga e instala [LM Studio](https://lmstudio.ai/).
2. Descarga tu archivo `.gguf` y arrástralo dentro de la aplicación LM Studio para cargarlo.
3. Ve a la pestaña **Local Server** (Servidor Local) a la izquierda.
4. Selecciona tu modelo y haz clic en **Start Server**.
5. Fíjate en qué puerto se levanta (por defecto suele ser `http://localhost:1234/v1`).

---

## Paso 2: Cambiar la configuración en tu Backend (`.env`)

En la raíz de tu carpeta `backend/`, abre el archivo `.env`. Verás que he añadido una nueva sección.

Para usar el modelo **LOCAL**, cambia `USE_LOCAL_AI` a `True`:

```env
# =============================================
# AI Connection (Cloud vs Local)
# =============================================

# Groq API (David AI Cloud - Default)
GROQ_API_KEY=gsk_wHZ4juBr3D8f...
GROQ_MODEL=llama-3.3-70b-versatile

# Local AI (Ollama / LM Studio)
USE_LOCAL_AI=True                                # <--- CAMBIA ESTO A True
LOCAL_AI_URL=http://localhost:11434/v1           # <--- Cambia el puerto si usas LM Studio (ej: 1234)
LOCAL_AI_MODEL=david_model_gguf                  # <--- El nombre de tu modelo en Ollama o LM Studio
LOCAL_AI_API_KEY=ollama
```

---

## Paso 3: Reiniciar el Backend

Dado que las variables de entorno se cargan al iniciar el servidor, debes reiniciar FastAPI.
Ve a la terminal donde corre tu backend (`python -m uvicorn app.main:app --reload...`) y reinícialo deteniéndolo (`Ctrl+C`) y volviéndolo a arrancar:

```bash
python -m uvicorn app.main:app --reload --port 5620
```

> [!TIP]
> **Para volver a usar Groq (La Nube):**
> Simplemente abre tu archivo `.env`, cambia `USE_LOCAL_AI=False` y guarda el archivo. El backend volverá a usar la conexión rápida a internet automáticamente sin tocar código.
