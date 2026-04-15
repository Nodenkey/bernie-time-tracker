from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class TimeEntryBase(BaseModel):
    date: date
    personName: str = Field(min_length=1)
    teamName: str = Field(min_length=1)
    activityDescription: str = Field(min_length=1)
    durationHours: float
    notes: Optional[str] = None

    @field_validator("durationHours")
    @classmethod
    def validate_duration(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("durationHours must be greater than 0")
        return v


class TimeEntryCreate(TimeEntryBase):
    pass


class TimeEntryUpdate(BaseModel):
    date: Optional[date] = None
    personName: Optional[str] = Field(default=None, min_length=1)
    teamName: Optional[str] = Field(default=None, min_length=1)
    activityDescription: Optional[str] = Field(default=None, min_length=1)
    durationHours: Optional[float] = None
    notes: Optional[str] = None

    @field_validator("durationHours")
    @classmethod
    def validate_duration(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("durationHours must be greater than 0")
        return v


class TimeEntry(TimeEntryBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True
