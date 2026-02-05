import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr


class TenantRegister(BaseModel):
    email: EmailStr
    password: str
    store_name: str
    country: str = "CO"


class TenantLogin(BaseModel):
    email: EmailStr
    password: str


class TokenRefresh(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TenantResponse(BaseModel):
    id: uuid.UUID
    email: str
    store_name: str
    slug: str
    phone: str | None
    country: str
    plan: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
