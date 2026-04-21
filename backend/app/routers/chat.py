import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas import ChatRequest, ChatResponse, ConversationResponse, ConversationDetail
from app.services.david_ai import chat_with_david, generate_conversation_title

router = APIRouter(prefix="/api/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get or create conversation
    conversation = None

    if request.conversation_id:
        result = await db.execute(
            select(Conversation)
            .where(
                Conversation.id == request.conversation_id,
                Conversation.user_id == current_user.id,
            )
            .options(selectinload(Conversation.messages))
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversación no encontrada")

    if not conversation:
        # Generate title from first message
        title = await generate_conversation_title(request.message)
        conversation = Conversation(user_id=current_user.id, title=title)
        db.add(conversation)
        await db.flush()
        await db.refresh(conversation, ["messages"])

    # Build message history for David
    existing_messages = [
        {"role": msg.role, "content": msg.content}
        for msg in (conversation.messages if conversation.messages else [])
    ]
    existing_messages.append({"role": "user", "content": request.message})

    # Call David
    david_response, tokens_used = await chat_with_david(existing_messages)

    # Save user message
    user_msg = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_msg)

    # Save David's response
    assistant_msg = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=david_response,
        tokens_used=tokens_used,
    )
    db.add(assistant_msg)

    return ChatResponse(
        conversation_id=conversation.id,
        message=david_response,
        role="assistant",
    )


@router.get("/conversations", response_model=list[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    )
    return result.scalars().all()


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation)
        .where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .options(selectinload(Conversation.messages))
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    return conversation


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversación no encontrada")
    await db.delete(conversation)
