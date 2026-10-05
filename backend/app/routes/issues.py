from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.user import User
from ..schemas.user import UserResponse
from ..schemas.issue import (
    IssueCreate,
    IssueStatusUpdate,
    IssueResponse,
)
from ..services.issue_service import (
    create_issue,
    get_issues,
    get_issue_by_id,
    update_issue_status,
    get_user_issues,
    format_issue_for_frontend,
)

router = APIRouter(tags=["Issues"])


@router.post("/api/issues", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def submit_issue(issue_in: IssueCreate, db: Session = Depends(get_db)):
    """Create a new citizen report with auto-generated CivicConnect ID (e.g. CC-1054)."""
    issue = create_issue(db, issue_in)
    return format_issue_for_frontend(issue)


@router.get("/api/issues", response_model=List[IssueResponse])
def list_issues(
    status: Optional[str] = Query(None, description="Filter by status (e.g. In Progress, Reported, Resolved, PENDING)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Low, Medium, High)"),
    category: Optional[str] = Query(None, description="Filter by issue type/category"),
    ward: Optional[str] = Query(None, description="Filter by municipal ward"),
    search: Optional[str] = Query(None, description="Search query matching title, location, category, ID, etc."),
    db: Session = Depends(get_db),
):
    """Retrieve all civic issues with optional filtering and search."""
    issues = get_issues(
        db,
        status=status,
        priority=priority,
        category=category,
        ward=ward,
        search=search,
    )
    return [format_issue_for_frontend(i) for i in issues]


@router.get("/api/issues/{issue_id}", response_model=IssueResponse)
def get_issue(issue_id: str, db: Session = Depends(get_db)):
    """Retrieve details, timeline, and updates for a single issue."""
    issue = get_issue_by_id(db, issue_id)
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID '{issue_id}' not found",
        )
    return format_issue_for_frontend(issue)


@router.put("/api/issues/{issue_id}/status", response_model=IssueResponse)
@router.patch("/api/issues/{issue_id}/status", response_model=IssueResponse)
def update_status(
    issue_id: str,
    update_data: IssueStatusUpdate,
    db: Session = Depends(get_db),
):
    """Authority updates the workflow status of an issue with remarks."""
    updated = update_issue_status(
        db,
        issue_id=issue_id,
        new_status=update_data.status,
        remarks=update_data.remarks,
        updated_by=update_data.updated_by,
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with ID '{issue_id}' not found",
        )
    return format_issue_for_frontend(updated)


@router.get("/api/users/{user_id}/issues", response_model=List[IssueResponse])
def get_citizen_issues(user_id: int, db: Session = Depends(get_db)):
    """Retrieve all reports submitted by a specific citizen."""
    issues = get_user_issues(db, user_id)
    return [format_issue_for_frontend(i) for i in issues]


@router.get("/api/users/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Retrieve public user profile by user ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID {user_id} not found",
        )
    return user

