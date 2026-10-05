from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class UserLoginRequest(BaseModel):
    email: str
    password: Optional[str] = None


class UserRegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, description="Citizen full name")
    email: str = Field(..., min_length=5, description="Valid email address")
    password: str = Field(..., min_length=3, description="Account password")
    age: Optional[int] = Field(None, ge=1, le=120, description="Citizen age")
    area: Optional[str] = Field("Anna Nagar", description="Residential area or locality")
    phone: Optional[str] = None
    role: Optional[str] = "citizen"
    ward: Optional[str] = "Ward 104"


class UserBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    age: Optional[int] = None
    area: Optional[str] = None
    role: str = "citizen"
    ward: Optional[str] = "Ward 104"


class UserCreate(UserBase):
    password: Optional[str] = None


class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
