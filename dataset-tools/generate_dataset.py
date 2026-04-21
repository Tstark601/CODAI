import os
import json
import asyncio
from dotenv import load_dotenv
from groq import AsyncGroq
from tqdm.asyncio import tqdm

# Cargar variables de entorno (GROQ_API_KEY)
load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY or API_KEY == "your-groq-api-key-here":
    print("❌ ERROR: Debes configurar la variable GROQ_API_KEY en tu archivo .env")
    exit(1)

client = AsyncGroq(api_key=API_KEY)

# Configuración
MODEL = "llama-3.3-70b-versatile"
OUTPUT_FILE = "dataset.jsonl"
TOPICS_FILE = "topics.txt"
EXAMPLES_PER_TOPIC = 2  # Cuántas conversaciones distintas generar por cada tópico

DAVID_SYSTEM_PROMPT = """Eres David, el asistente de inteligencia artificial de CODAI — una plataforma diseñada para potenciar el desarrollo de software de nivel mundial.

Tu Identidad:
- Nombre: David — derivado del rey bíblico: sabio, estratégico y victorioso.
- Rol: Experto en desarrollo fullstack, arquitectura de software, lógica de programación y automatización.
- Propósito: No solo dar código, sino ENSEÑAR a pensar como un desarrollador senior. Ayudar al usuario a entender el *por qué* detrás de cada decisión técnica.

Tono: Profesional pero cercano, mentor senior, en español, sin condescendencia. Siempre usas markdown para el código."""

SYNTHESIZER_PROMPT = """Eres un generador de datasets para Fine-Tuning. Tu tarea es generar UNA interacción ideal (un mensaje del usuario y una respuesta ideal de un asistente llamado "David").

REGLAS ESTRICTAS DE SALIDA:
- Debe estar en estricto formato JSON válido (un solo objeto).
- No uses markdown de código (```json) alrededor de la respuesta. SOLO el JSON limpio.
- El formato debe ser exactamente:
{
  "user_prompt": "<El mensaje realista del usuario, que incluye errores, dudas o peticiones de código sobre el tema>",
  "assistant_response": "<La respuesta perfecta de David, pedagógica, enseñando y proponiendo buen código MD>"
}

El TEMA de la conversación es: "{topic}"
"""

async def generate_conversation(topic: str) -> dict | None:
    """Genera una sola conversación usando a Llama para simular ambos lados via JSON."""
    messages = [
        {"role": "system", "content": SYNTHESIZER_PROMPT.replace("{topic}", topic)}
    ]
    
    try:
        completion = await client.chat.completions.create(
            model=MODEL,
            messages=messages,
            temperature=0.8, # Más creatividad para datos diversos
            max_tokens=4000,
            response_format={"type": "json_object"}
        )
        
        response_text = completion.choices[0].message.content
        data = json.loads(response_text)
        
        # Validar formato
        if "user_prompt" in data and "assistant_response" in data:
            # Transformar a formato ChatML final
            return {
                "messages": [
                    {"role": "system", "content": DAVID_SYSTEM_PROMPT},
                    {"role": "user", "content": data["user_prompt"]},
                    {"role": "assistant", "content": data["assistant_response"]}
                ]
            }
        return None
        
    except Exception as e:
        print(f"\n⚠️ Error en tópico '{topic}': {e}")
        return None

async def main():
    print("Iniciando generador de Data Sets Sintéticos de CODAI")
    
    # Leer tópicos
    if not os.path.exists(TOPICS_FILE):
        print(f"ERROR: El archivo {TOPICS_FILE} no existe.")
        return
        
    with open(TOPICS_FILE, "r", encoding="utf-8") as f:
        topics = [line.strip() for line in f if line.strip()]
        
    print(f"Encontrados {len(topics)} tópicos semillas.")
    print(f"Generando {EXAMPLES_PER_TOPIC} ejemplos por tópico (Total estimado: {len(topics) * EXAMPLES_PER_TOPIC}).")
    
    # Preparar lista de tareas
    tasks = []
    for topic in topics:
        for _ in range(EXAMPLES_PER_TOPIC):
            tasks.append(topic)
            
    # Función limitadora (Para no exceder rate limits)
    semaphore = asyncio.Semaphore(5) # Max 5 peticiones concurrentes a Groq
    
    async def bound_generate(topic):
        async with semaphore:
            res = await generate_conversation(topic)
            await asyncio.sleep(1) # Pequeño delay de 1 seg por respeto al rate limit
            return res

    # Ejecutar barras de progreso
    results = await tqdm.gather(*(bound_generate(t) for t in tasks), desc="Generando conversaciones")
    
    # Filtrar válidos
    valid_results = [r for r in results if r is not None]
    
    # Guardar en archivo JSONL appending
    count = 0
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for entry in valid_results:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
            count += 1
            
    print(f"\nProceso Finalizado. Se generaron {count} conversaciones de alta calidad en `{OUTPUT_FILE}`.")
    print("Próximo paso: Llevar unsloth/ChatML a Colab para entrenar a Llama 3/Qwen.")

if __name__ == "__main__":
    asyncio.run(main())
