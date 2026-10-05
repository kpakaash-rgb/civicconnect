import re
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from ..models.user import User
from ..models.issue import Issue, IssueUpdate
from ..schemas.issue import IssueCreate

TIMELINE_STEPS = [
    "Reported",
    "Under Review",
    "Assigned",
    "In Progress",
    "Resolved",
    "Citizen Verified",
]


def generate_next_issue_id(db: Session) -> str:
    """Generate a sequential CivicConnect report ID like CC-1046, CC-1054."""
    issues = db.query(Issue.id).all()
    max_num = 1040

    for (issue_id,) in issues:
        match = re.search(r"CC-(\d+)", str(issue_id))
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num

    return f"CC-{max_num + 1}"


def format_timeline(issue: Issue) -> List[dict]:
    """Build the standard 6-step CivicConnect timeline with status-driven done flags."""
    step_indices = {step: idx for idx, step in enumerate(TIMELINE_STEPS)}
    current_idx = step_indices.get(issue.status, 0)

    # Map existing updates to steps
    step_updates = {}
    for upd in (issue.updates or []):
        if upd.status not in step_updates:
            step_updates[upd.status] = upd

    timeline = []
    created_str = (
        issue.created_at.strftime("%d %b %Y, %H:%M")
        if issue.created_at
        else datetime.now().strftime("%d %b %Y, %H:%M")
    )
    updated_str = (
        issue.updated_at.strftime("%d %b %Y, %H:%M")
        if issue.updated_at
        else created_str
    )

    for idx, step_name in enumerate(TIMELINE_STEPS):
        is_done = idx <= current_idx and issue.status != "Citizen Verified"
        if issue.status == "Citizen Verified":
            is_done = True

        date_val = None
        note_val = None

        if step_name in step_updates:
            upd = step_updates[step_name]
            date_val = upd.created_at.strftime("%d %b %Y, %H:%M") if upd.created_at else updated_str
            note_val = upd.remarks
        elif step_name == "Reported":
            date_val = created_str
            note_val = "Report submitted by citizen via CivicConnect."
        elif is_done and step_name == issue.status:
            date_val = updated_str
            note_val = f"Status advanced to {step_name}."
        elif is_done:
            date_val = created_str
            note_val = f"Step completed: {step_name}"

        timeline.append({
            "step": step_name,
            "done": is_done,
            "date": date_val if is_done else None,
            "note": note_val if is_done else None,
        })

    return timeline


def format_issue_for_frontend(issue: Issue) -> dict:
    """Format an Issue model into the shape expected by the CivicConnect React frontend."""
    timeline = format_timeline(issue)

    # Format updates array for IssueDetails & AuthorityDashboard
    updates = []
    for upd in (issue.updates or []):
        date_str = upd.created_at.strftime("%d %b %Y, %H:%M") if upd.created_at else "Recently"
        updates.append({
            "date": date_str,
            "text": upd.remarks or f"Status updated to {upd.status}",
            "author": upd.updated_by or "Municipal Authority",
        })

    # Relative time string
    now = datetime.now(timezone.utc)
    created_at = issue.created_at
    if created_at and created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)

    diff = (now - created_at).total_seconds() if created_at else 0
    if diff < 120:
        reported_ago = "Just now"
    elif diff < 3600:
        reported_ago = f"{int(diff // 60)}m ago"
    elif diff < 86400:
        reported_ago = f"{int(diff // 3600)}h ago"
    else:
        reported_ago = f"{int(diff // 86400)}d ago"

    date_reported = (
        issue.created_at.strftime("%Y-%m-%d")
        if issue.created_at
        else datetime.now().strftime("%Y-%m-%d")
    )

    return {
        "id": issue.id,
        "title": issue.title,
        "category": issue.category,
        "description": issue.description,
        "status": issue.status,
        "priority": issue.priority,
        "location": issue.location,
        "zone": issue.zone or "Zone 4 • Anna Nagar",
        "ward": issue.ward or "Ward 104",
        "image": issue.image,
        "assigned_to": issue.assigned_to,
        "reporter_id": issue.reporter_id,
        "created_at": issue.created_at,
        "updated_at": issue.updated_at,
        # Frontend-specific enriched fields
        "dateReported": date_reported,
        "reportedAgo": reported_ago,
        "timeline": timeline,
        "updates": updates,
    }


def create_issue(db: Session, issue_in: IssueCreate) -> Issue:
    new_id = generate_next_issue_id(db)

    # Ensure valid reporter_id or fallback to demo user
    raw_reporter_id = issue_in.reporter_id
    reporter_id = None
    if isinstance(raw_reporter_id, int):
        reporter_id = raw_reporter_id
    elif isinstance(raw_reporter_id, str):
        match = re.search(r"\d+", raw_reporter_id)
        if match:
            reporter_id = int(match.group(0))

    if not reporter_id:
        default_user = db.query(User).filter(User.role == "citizen").first()
        if default_user:
            reporter_id = default_user.id
        else:
            reporter_id = 1

    now = datetime.now(timezone.utc)
    new_issue = Issue(
        id=new_id,
        title=issue_in.title,
        category=issue_in.category,
        description=issue_in.description,
        status="Reported",
        priority=issue_in.priority or "Medium",
        location=issue_in.location,
        zone=issue_in.zone or "Zone 4 • Anna Nagar",
        ward=issue_in.ward or "Ward 104",
        image=issue_in.image,
        assigned_to=None,
        reporter_id=reporter_id,
        created_at=now,
        updated_at=now,
    )

    db.add(new_issue)
    db.flush()

    # Create initial update entry
    initial_update = IssueUpdate(
        issue_id=new_id,
        status="Reported",
        remarks="Report submitted by citizen via CivicConnect.",
        updated_by="Citizen",
        created_at=now,
    )
    db.add(initial_update)
    db.commit()
    db.refresh(new_issue)

    return new_issue


def get_issues(
    db: Session,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    ward: Optional[str] = None,
    search: Optional[str] = None,
) -> List[Issue]:
    query = db.query(Issue)

    if status and status != "ALL":
        if status == "PENDING":
            query = query.filter(Issue.status.in_(["Reported", "Under Review"]))
        else:
            query = query.filter(Issue.status == status)

    if priority and priority != "ALL":
        query = query.filter(Issue.priority == priority)

    if category and category != "all" and category != "ALL":
        query = query.filter(Issue.category == category)

    if ward and ward != "ALL":
        query = query.filter(Issue.ward.ilike(f"%{ward}%"))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Issue.id.ilike(term),
                Issue.title.ilike(term),
                Issue.category.ilike(term),
                Issue.location.ilike(term),
                Issue.description.ilike(term),
                Issue.ward.ilike(term),
            )
        )

    return query.order_by(desc(Issue.created_at)).all()


def get_issue_by_id(db: Session, issue_id: str) -> Optional[Issue]:
    return db.query(Issue).filter(Issue.id == issue_id).first()


def update_issue_status(
    db: Session,
    issue_id: str,
    new_status: str,
    remarks: Optional[str] = None,
    updated_by: Optional[str] = "Municipal Authority",
) -> Optional[Issue]:
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    if not issue:
        return None

    now = datetime.now(timezone.utc)
    issue.status = new_status
    issue.updated_at = now

    if new_status == "Assigned" and not issue.assigned_to:
        issue.assigned_to = "Zone 4 Road Maintenance Unit"

    # Create issue_updates audit entry
    new_update = IssueUpdate(
        issue_id=issue.id,
        status=new_status,
        remarks=remarks or f"Status changed to {new_status} by {updated_by}.",
        updated_by=updated_by or "Municipal Authority",
        created_at=now,
    )
    db.add(new_update)

    db.commit()
    db.refresh(issue)
    return issue


def get_user_issues(db: Session, user_id: int) -> List[Issue]:
    return (
        db.query(Issue)
        .filter(Issue.reporter_id == user_id)
        .order_by(desc(Issue.created_at))
        .all()
    )


def seed_demo_data(db: Session):
    """Seed initial demo users and realistic CivicConnect issues if database is empty."""
    from .auth_service import hash_password

    # Seed default users
    citizen = db.query(User).filter(
        or_(User.email == "citizen@civicconnect.in", User.email == "citizen@example.com")
    ).first()
    if not citizen:
        citizen = User(
            name="Citizen Demo",
            email="citizen@civicconnect.in",
            phone="+91 98401 23456",
            age=20,
            area="Anna Nagar",
            password=hash_password("citizen123"),
            role="citizen",
            ward="Ward 104",
        )
        db.add(citizen)
    else:
        if not citizen.age:
            citizen.age = 20
        if not citizen.area:
            citizen.area = "Anna Nagar"
        if not citizen.password:
            citizen.password = hash_password("citizen123")

    authority = db.query(User).filter(
        or_(User.email == "authority@civicconnect.in", User.email == "authority@example.com")
    ).first()
    if not authority:
        authority = User(
            name="Zone 4 Municipal Officer",
            email="authority@civicconnect.in",
            phone="+91 44 2626 5000",
            age=38,
            area="Zone 4 Headquarters",
            password=hash_password("authority123"),
            role="authority",
            ward="Ward 104",
        )
        db.add(authority)
    else:
        if not authority.password:
            authority.password = hash_password("authority123")

    db.commit()
    db.refresh(citizen)

    # Check if issues already exist
    existing_count = db.query(Issue).count()
    if existing_count > 0:
        return

    # Seed issues: CC-1042, CC-1043, CC-1044, CC-1045
    demo_issues = [
        {
            "id": "CC-1042",
            "title": "Deep Pothole Cluster on 2nd Avenue",
            "category": "Potholes",
            "description": "Multiple large potholes near Blue Star Signal causing severe vehicle damage and traffic bottleneck.",
            "status": "In Progress",
            "priority": "High",
            "location": "Anna Nagar 2nd Avenue, near Blue Star Signal",
            "zone": "Zone 4 • Anna Nagar",
            "ward": "Ward 104",
            "assigned_to": "Zone 4 Road Maintenance Unit",
            "remarks": "Crew dispatched. Cold-mix asphalt repair scheduled.",
        },
        {
            "id": "CC-1043",
            "title": "Commercial Waste & Garbage Bin Overflow",
            "category": "Sanitation",
            "description": "Bin overflowing since morning. Stray cattle gathering on pedestrian sidewalk.",
            "status": "Reported",
            "priority": "Medium",
            "location": "Market 4th Cross Road, Behind Fish Mart, Anna Nagar",
            "zone": "Zone 4 • Anna Nagar",
            "ward": "Ward 104",
            "assigned_to": None,
            "remarks": "Report submitted by citizen.",
        },
        {
            "id": "CC-1044",
            "title": "Stormwater Drain Inlet Blockage",
            "category": "Drainage",
            "description": "Heavy silt and plastic waste blocking drain inlet. Road waterlogging during rains.",
            "status": "Under Review",
            "priority": "Medium",
            "location": "12th Main Road, Ward 104, Anna Nagar West",
            "zone": "Zone 4 • Anna Nagar",
            "ward": "Ward 104",
            "assigned_to": None,
            "remarks": "Municipal team reviewing priority and silt equipment availability.",
        },
        {
            "id": "CC-1045",
            "title": "Faulty Streetlights on 6th Avenue Walkway",
            "category": "Streetlights",
            "description": "Consecutive streetlights non-functional creating dark dangerous stretch for evening pedestrians.",
            "status": "Resolved",
            "priority": "Low",
            "location": "6th Avenue Walkway, near Roundana, Anna Nagar",
            "zone": "Zone 4 • Anna Nagar",
            "ward": "Ward 104",
            "assigned_to": "Ward Electrical Maintenance Unit",
            "remarks": "LED fixtures and faulty wiring replaced. Verified operational.",
        },
    ]

    for item in demo_issues:
        now = datetime.now(timezone.utc)
        issue_obj = Issue(
            id=item["id"],
            title=item["title"],
            category=item["category"],
            description=item["description"],
            status=item["status"],
            priority=item["priority"],
            location=item["location"],
            zone=item["zone"],
            ward=item["ward"],
            assigned_to=item["assigned_to"],
            reporter_id=citizen.id,
            created_at=now,
            updated_at=now,
        )
        db.add(issue_obj)
        db.flush()

        update_obj = IssueUpdate(
            issue_id=item["id"],
            status=item["status"],
            remarks=item["remarks"],
            updated_by="Municipal Authority",
            created_at=now,
        )
        db.add(update_obj)

    db.commit()
