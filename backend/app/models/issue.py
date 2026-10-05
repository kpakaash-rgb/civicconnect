from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class Issue(Base):
    __tablename__ = "issues"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Reported", nullable=False)
    priority = Column(String(30), default="Medium", nullable=False)
    location = Column(String(255), nullable=False)
    zone = Column(String(100), default="Zone 4", nullable=True)
    ward = Column(String(50), default="Ward 104", nullable=True)
    image = Column(Text, nullable=True)
    assigned_to = Column(String(150), nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    updated_at = Column(DateTime, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    reporter = relationship("User", back_populates="issues")
    updates = relationship(
        "IssueUpdate",
        back_populates="issue",
        order_by="desc(IssueUpdate.created_at)",
        cascade="all, delete-orphan",
    )


class IssueUpdate(Base):
    __tablename__ = "issue_updates"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    issue_id = Column(String(50), ForeignKey("issues.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(50), nullable=False)
    remarks = Column(Text, nullable=True)
    updated_by = Column(String(100), default="Municipal Authority", nullable=False)
    created_at = Column(DateTime, default=get_utc_now)

    # Relationships
    issue = relationship("Issue", back_populates="updates")
