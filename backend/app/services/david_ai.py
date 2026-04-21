from groq import AsyncGroq
from app.core.config import settings
from app.services.david_prompt import get_system_prompt, DAVID_FALLBACK_RESPONSE
import logging

logger = logging.getLogger(__name__)

client = AsyncGroq(api_key=settings.GROQ_API_KEY)


async def chat_with_david(
    messages: list[dict],
    stream: bool = False,
) -> str:
    """
    Send a conversation to David (Groq Llama) and get a response.
    messages: list of {"role": "user"|"assistant", "content": str}
    """
    try:
        system_prompt = get_system_prompt()

        full_messages = [{"role": "system", "content": system_prompt}] + messages

        completion = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=full_messages,
            temperature=0.7,
            max_tokens=4096,
            top_p=0.95,
        )

        response_content = completion.choices[0].message.content
        tokens_used = completion.usage.total_tokens if completion.usage else None

        logger.info(f"David responded. Tokens used: {tokens_used}")
        return response_content, tokens_used

    except Exception as e:
        logger.error(f"Error calling Groq API: {e}")
        return DAVID_FALLBACK_RESPONSE, None


async def generate_conversation_title(first_message: str) -> str:
    """Generate a short title for a conversation based on the first user message."""
    try:
        completion = await client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "Genera un título corto y descriptivo (máximo 8 palabras) para una conversación de programación que comienza con el siguiente mensaje del usuario. Responde SOLO con el título, sin comillas ni puntuación extra.",
                },
                {"role": "user", "content": first_message[:500]},
            ],
            temperature=0.5,
            max_tokens=50,
        )
        return completion.choices[0].message.content.strip()
    except Exception:
        return "Nueva conversación"
