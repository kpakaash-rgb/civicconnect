from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from ..database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    age = Column(Integer, nullable=True)
    area = Column(String(120), nullable=True)
    password = Column(String(255), nullable=True)
    role = Column(String(30), default="citizen", nullable=False)
    ward = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    issues = relationship("Issue", back_populates="reporter", cascade="all, delete-orphan")
