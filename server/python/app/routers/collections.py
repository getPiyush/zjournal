"""Shared CRUD surface for the array-backed collections (articles, contacts, qna) that
json-server auto-generated on the Node side, setters.php/getters.php hand-implemented on the PHP
side, and com.zjournal.web.AbstractCollectionController implements on the Java side: list with
filter/sort query support, get-by-id, create, update, delete.
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app import query_engine, search
from app.auth import is_public_article, is_public_view
from app.store import data_store

_NOT_FOUND_BODY = {"error": {"code": "NOT_FOUND", "message": "No item with that id"}}


def build_collection_router(name: str, tag: str) -> APIRouter:
    router = APIRouter(prefix=f"/{name}", tags=[tag])

    @router.get(
        "",
        summary="List items",
        description="Supports `_sort`/`_order`, exact `field=value` filters, substring "
        "`field_like=value` filters, and repeated keys (`?id=a&id=b`) OR'd together while "
        "distinct keys AND.",
    )
    async def list_items(request: Request):
        params = list(request.query_params.multi_items())
        items = query_engine.apply(data_store.get_collection(name), params)
        if name == "articles" and is_public_view(request):
            items = [item for item in items if is_public_article(item)]
        return items

    if name == "articles":
        # Registered before /{item_id}, so "search" isn't taken for an article id.
        @router.get(
            "/search",
            summary="Search articles",
            description="Text search (`q`, `in`), `from`/`to` dates, `status`, `categryId`, `author`, "
            "`sort`, and `page`/`limit` paging. Returns `{items, total, page, limit}`. See server/SEARCH.md.",
        )
        async def search_items(request: Request):
            return search.search(data_store.get_collection(name), request.query_params, is_public_view(request))

    @router.get("/{item_id}", summary="Get item by id", responses={404: {"description": "No item with that id"}})
    async def get_item(item_id: str, request: Request):
        item = data_store.find_by_id(name, item_id)
        if item is None or (name == "articles" and is_public_view(request) and not is_public_article(item)):
            return JSONResponse(status_code=404, content=_NOT_FOUND_BODY)
        return item

    @router.post("", summary="Create an item", status_code=201)
    async def create_item(request: Request):
        body = await request.json()
        return data_store.add_to_collection(name, body)

    @router.put("/{item_id}", summary="Replace an item by id", responses={404: {"description": "No item with that id"}})
    async def update_item(item_id: str, request: Request):
        body = await request.json()
        item = data_store.update_in_collection(name, item_id, body)
        if item is None:
            return JSONResponse(status_code=404, content=_NOT_FOUND_BODY)
        return item

    @router.delete("/{item_id}", summary="Delete an item by id", responses={404: {"description": "No item with that id"}})
    async def delete_item(item_id: str):
        item = data_store.delete_from_collection(name, item_id)
        if item is None:
            return JSONResponse(status_code=404, content=_NOT_FOUND_BODY)
        return item

    return router
