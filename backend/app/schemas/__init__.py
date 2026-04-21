import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


# ─────────────────── Auth Schemas ───────────────────

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")
    full_name: str | None = Field(None, max_length=200)
    password: str = Field(..., min_length=8)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


# ─────────────────── User Schemas ───────────────────

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    full_name: str | None
    is_active: bool
    is_admin: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─────────────────── Chat Schemas ───────────────────

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    conversation_id: uuid.UUID | None = None


class ChatResponse(BaseModel):
    conversation_id: uuid.UUID
    message: str
    role: str = "assistant"


# ─────────────────── Conversation Schemas ───────────────────

class ConversationResponse(BaseModel):
    id: uuid.UUID
    title: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MessageResponse(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ConversationDetail(ConversationResponse):
    messages: list[MessageResponse] = []


# ─────────────────── Project Schemas ───────────────────

class ProjectCreate(BaseModel):
    name: str = Field(..., max_length=200)
    description: str | None = None
    tech_stack: dict | None = None
    structure: dict | None = None


class ProjectUpdate(BaseModel):
    name: str | None = Field(None, max_length=200)
    description: str | None = None
    tech_stack: dict | None = None
    structure: dict | None = None
    status: str | None = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    tech_stack: dict | None
    structure: dict | None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
