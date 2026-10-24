"""The "journal" collection in db.json is a singleton object (app title, categories, admin
details, ...), not an array, so unlike articles/contacts/qna it only supports get/replace.
"""

from fastapi import APIRouter, Request

from app.auth import is_public_view, public_journal
from app.store import data_store

router = APIRouter(
    prefix="/journal",
    tags=["Journal"],
)


@router.get("", summary="Get the journal settings object")
async def get_journal(request: Request):
    journal = data_store.get_journal()
    return public_journal(journal) if is_public_view(request) else journal


@router.put("", summary="Replace the journal settings object")
async def replace_journal(request: Request):
    body = await request.json()
    return data_store.set_journal(body)
