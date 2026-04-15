from __future__ import annotations

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Query, status

from . import store
from .models import TimeEntry, TimeEntryCreate, TimeEntryUpdate

router = APIRouter(prefix="/api/time-entries", tags=["time-entries"])


@router.get("", response_model=List[TimeEntry])
async def list_time_entries(
    date_from: Optional[date] = Query(default=None, alias="date_from"),
    date_to: Optional[date] = Query(default=None, alias="date_to"),
    team: Optional[str] = Query(default=None, alias="team"),
    person: Optional[str] = Query(default=None, alias="person"),
) -> List[TimeEntry]:
    return store.list_entries(
        date_from=date_from,
        date_to=date_to,
        team=team,
        person=person,
    )


@router.post("", response_model=TimeEntry, status_code=status.HTTP_201_CREATED)
async def create_time_entry(payload: TimeEntryCreate) -> TimeEntry:
    return store.create_entry(payload)


@router.put("/{entry_id}", response_model=TimeEntry)
async def update_time_entry(entry_id: str, payload: TimeEntryUpdate) -> TimeEntry:
    updated = store.update_entry(entry_id, payload)
    if updated is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "not_found",
                "message": f"Time entry with id {entry_id} does not exist",
                "detail": None,
            },
        )
    return updated


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_time_entry(entry_id: str) -> None:
    deleted = store.delete_entry(entry_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "not_found",
                "message": f"Time entry with id {entry_id} does not exist",
                "detail": None,
            },
        )


@router.get("/{entry_id}", response_model=TimeEntry)
async def get_time_entry(entry_id: str) -> TimeEntry:
    entry = store.get_entry(entry_id)
    if entry is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": "not_found",
                "message": f"Time entry with id {entry_id} does not exist",
                "detail": None,
            },
        )
    return entry
