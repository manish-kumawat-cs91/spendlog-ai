from datetime import date, datetime
from decimal import Decimal
import json
import time

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from workflows.search_workflow import search_workflow
from auth import require_auth


router = APIRouter(
    prefix="/api/search",
    tags=["Search"]
)


# =========================================================
# JSON SAFE VALUE
# =========================================================

def json_safe(value):
    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, (date, datetime)):
        return value.isoformat()

    return value


# =========================================================
# SSE EVENT
# =========================================================

def sse_event(data):
    return "data: " + json.dumps(data, default=json_safe) + "\n\n"


# =========================================================
# FORMAT RECORDS
# =========================================================

def format_records(records):
    formatted = []

    for record in records:
        formatted.append({
            "id": json_safe(record.id),
            "amount": json_safe(record.amount),
            "item_name": json_safe(record.item_name),
            "expense_date": json_safe(record.expense_date),
            "created_at": json_safe(record.created_at),
            "updated_at": json_safe(record.updated_at)
        })

    return formatted


# =========================================================
# SEARCH BY DAY
# =========================================================

@router.get("/day")
def search_by_day(
    search_date: date,
    authenticated: bool = Depends(require_auth)
):
    result = search_workflow.invoke({
        "search_type": "day",
        "search_value": search_date
    })

    return {
        "search_type": result["search_type"],
        "search_value": json_safe(result["search_value"]),
        "records": format_records(result["records"]),
        "total_amount": json_safe(result["total_amount"])
    }


# =========================================================
# SEARCH BY MONTH
# =========================================================

@router.get("/month")
def search_by_month(
    year: int,
    month: int,
    authenticated: bool = Depends(require_auth)
):
    result = search_workflow.invoke({
        "search_type": "month",
        "search_value": {
            "year": year,
            "month": month
        }
    })

    return {
        "search_type": result["search_type"],
        "year": year,
        "month": month,
        "records": format_records(result["records"]),
        "total_amount": json_safe(result["total_amount"])
    }


# =========================================================
# SEARCH BY YEAR
# =========================================================

@router.get("/year")
def search_by_year(
    year: int,
    authenticated: bool = Depends(require_auth)
):
    result = search_workflow.invoke({
        "search_type": "year",
        "search_value": year
    })

    return {
        "search_type": result["search_type"],
        "year": year,
        "records": format_records(result["records"]),
        "total_amount": json_safe(result["total_amount"])
    }


# =========================================================
# SEARCH BY ITEM
# =========================================================

@router.get("/item")
def search_by_item(
    item_name: str,
    authenticated: bool = Depends(require_auth)
):
    result = search_workflow.invoke({
        "search_type": "item",
        "search_value": item_name
    })

    return {
        "search_type": result["search_type"],
        "search_value": json_safe(result["search_value"]),
        "records": format_records(result["records"]),
        "total_amount": json_safe(result["total_amount"])
    }


# =========================================================
# SEARCH STREAM / SSE
# =========================================================

@router.get("/stream")
def search_stream(
    search_type: str,
    search_value: str,
    authenticated: bool = Depends(require_auth)
):

    def event_generator():

        # Search started
        yield sse_event({
            "progress": "Search started",
            "status": "processing"
        })

        time.sleep(0.5)

        # Search type detected
        yield sse_event({
            "progress": "Search type detected",
            "status": "processing"
        })

        time.sleep(0.5)

        # Search validated
        yield sse_event({
            "progress": "Search validated successfully",
            "status": "processing"
        })

        time.sleep(0.5)

        # Convert search value
        if search_type == "day":

            converted_value = date.fromisoformat(search_value)

        elif search_type == "month":

            parts = search_value.split("-")

            converted_value = {
                "year": int(parts[0]),
                "month": int(parts[1])
            }

        elif search_type == "year":

            converted_value = int(search_value)

        elif search_type == "item":

            converted_value = search_value

        else:

            yield sse_event({
                "progress": "Invalid search type",
                "status": "error"
            })

            return

        # Run LangGraph workflow
        result = search_workflow.invoke({
            "search_type": search_type,
            "search_value": converted_value
        })

        # Records fetched
        yield sse_event({
            "progress": "Records fetched successfully",
            "status": "processing"
        })

        time.sleep(0.5)

        # Total calculated
        yield sse_event({
            "progress": "Total amount calculated",
            "status": "processing"
        })

        time.sleep(0.5)

        # Final result
        final_result = {
            "search_type": result["search_type"],
            "search_value": json_safe(result["search_value"]),
            "records": format_records(result["records"]),
            "total_amount": json_safe(result["total_amount"])
        }

        # Completed
        yield sse_event({
            "progress": "Search workflow completed",
            "status": "completed",
            "result": final_result
        })

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )