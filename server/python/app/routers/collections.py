"""Shared CRUD surface for the array-backed collections (articles, contacts, qna) that
json-server auto-generated on the Node side, setters.php/getters.php hand-implemented on the PHP
side, and com.zjournal.web.AbstractCollectionController implements on the Java side: list with
filter/sort query support, get-by-id, create, update, delete.
"""

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app import query_engine
from app.store import data_store


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
        return query_engine.apply(data_store.get_collection(name), params)

    @router.get("/{item_id}", summary="Get item by id", responses={404: {"description": "No item with that id"}})
    async def get_item(item_id: str):
        item = data_store.find_by_id(name, item_id)
        if item is None:
            return JSONResponse(status_code=404, content=None)
        return item

    @router.post("", summary="Create an item")
    async def create_item(request: Request):
        body = await request.json()
        return data_store.add_to_collection(name, body)

    @router.put("/{item_id}", summary="Replace an item by id", responses={404: {"description": "No item with that id"}})
    async def update_item(item_id: str, request: Request):
        body = await request.json()
        item = data_store.update_in_collection(name, item_id, body)
        if item is None:
            return JSONResponse(status_code=404, content=None)
        return item

    @router.delete("/{item_id}", summary="Delete an item by id", responses={404: {"description": "No item with that id"}})
    async def delete_item(item_id: str):
        item = data_store.delete_from_collection(name, item_id)
        if item is None:
            return JSONResponse(status_code=404, content=None)
        return item

    return router
