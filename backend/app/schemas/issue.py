from datetime import datetime
from typing import Optional, List, Any, Union
from pydantic import BaseModel, ConfigDict


class IssueCreate(BaseModel):
    title: str
    category: str
    description: Optional[str] = None
    location: str
    zone: Optional[str] = "Zone 4 • Anna Nagar"
    ward: Optional[str] = "Ward 104"
    priority: Optional[str] = "Medium"
    image: Optional[str] = None
    reporter_id: Optional[Union[int, str]] = None


class IssueStatusUpdate(BaseModel):
    status: str
    remarks: Optional[str] = None
    updated_by: Optional[str] = "Municipal Authority"


class IssueUpdateItem(BaseModel):
    id: int
    issue_id: str
    status: str
    remarks: Optional[str] = None
    updated_by: str
    created_at: datetime
    date: Optional[str] = None
    text: Optional[str] = None
    author: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TimelineStep(BaseModel):
    step: str
    done: bool
    date: Optional[str] = None
    note: Optional[str] = None


class IssueResponse(BaseModel):
    id: str
    title: str
    category: str
    description: Optional[str] = None
    status: str
    priority: str
    location: str
    zone: Optional[str] = None
    ward: Optional[str] = None
    image: Optional[str] = None
    assigned_to: Optional[str] = None
    reporter_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    # Frontend convenience fields
    dateReported: Optional[str] = None
    reportedAgo: Optional[str] = None
    timeline: List[TimelineStep] = []
    updates: List[Any] = []

    model_config = ConfigDict(from_attributes=True)
