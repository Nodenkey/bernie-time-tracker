from __future__ import annotations

from datetime import date, datetime
from typing import Dict, List, Optional
import uuid

from .models import TimeEntry, TimeEntryCreate, TimeEntryUpdate


_time_entries: Dict[str, TimeEntry] = {}


def _seed_data() -> None:
    global _time_entries
    if _time_entries:
        return

    now = datetime.utcnow()
    entries = [
        TimeEntry(
            id=str(uuid.uuid4()),
            date=date(2026, 4, 14),
            personName="Alice Johnson",
            teamName="Engineering",
            activityDescription="Implement authentication module",
            durationHours=6.5,
            notes="Focused on OAuth2 integration",
            createdAt=now,
            updatedAt=now,
        ),
        TimeEntry(
            id=str(uuid.uuid4()),
            date=date(2026, 4, 15),
            personName="Bob Smith",
            teamName="Design",
            activityDescription="Create dashboard wireframes",
            durationHours=4.0,
            notes="Initial concepts for reporting views",
            createdAt=now,
            updatedAt=now,
        ),
        TimeEntry(
            id=str(uuid.uuid4()),
            date=date(2026, 4, 15),
            personName="Charlie Lee",
            teamName="Engineering",
            activityDescription="Refactor API error handling",
            durationHours=3.0,
            notes="Improved consistency of error responses",
            createdAt=now,
            updatedAt=now,
        ),
    ]

    _time_entries = {entry.id: entry for entry in entries}


_seed_data()


def list_entries(
    *,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    team: Optional[str] = None,
    person: Optional[str] = None,
) -> List[TimeEntry]:
    results = list(_time_entries.values())

    if date_from is not None:
        results = [e for e in results if e.date >= date_from]
    if date_to is not None:
        results = [e for e in results if e.date <= date_to]
    if team is not None:
        team_lower = team.lower()
        results = [e for e in results if e.teamName.lower() == team_lower]
    if person is not None:
        person_lower = person.lower()
        results = [e for e in results if e.personName.lower() == person_lower]

    return results


def get_entry(entry_id: str) -> Optional[TimeEntry]:
    return _time_entries.get(entry_id)


def create_entry(data: TimeEntryCreate) -> TimeEntry:
    entry_id = str(uuid.uuid4())
    now = datetime.utcnow()
    entry = TimeEntry(
        id=entry_id,
        createdAt=now,
        updatedAt=now,
        **data.model_dump(),
    )
    _time_entries[entry_id] = entry
    return entry


def update_entry(entry_id: str, data: TimeEntryUpdate) -> Optional[TimeEntry]:
    existing = _time_entries.get(entry_id)
    if existing is None:
        return None

    update_data = data.model_dump(exclude_unset=True)
    updated = existing.model_copy(update=update_data)
    updated.updatedAt = datetime.utcnow()
    _time_entries[entry_id] = updated
    return updated


def delete_entry(entry_id: str) -> bool:
    if entry_id not in _time_entries:
        return False
    del _time_entries[entry_id]
    return True
