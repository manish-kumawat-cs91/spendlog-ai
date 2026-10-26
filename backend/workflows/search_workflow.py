from datetime import date
from typing import TypedDict, Any

from langgraph.graph import StateGraph, START, END

from services.search_service import (
    search_expenses_by_day,
    search_expenses_by_month,
    search_expenses_by_year,
    search_expenses_by_item,
    calculate_total
)


# WORKFLOW STATE
class SearchState(TypedDict, total=False):
    search_type: str
    search_value: Any
    records: list
    total_amount: Any
    progress: str
    status: str
    result: dict


# NODE 1: DETECT SEARCH TYPE
def detect_search_type(state: SearchState):
    search_type = state.get("search_type")

    if search_type:
        search_type = search_type.lower()

    return {
        "search_type": search_type,
        "progress": "Search type detected",
        "status": "processing"
    }


# NODE 2: VALIDATE SEARCH
def validate_search(state: SearchState):
    search_type = state.get("search_type")
    search_value = state.get("search_value")

    valid_types = ["day", "month", "year", "item"]

    if search_type not in valid_types:
        return {
            "progress": "Invalid search type",
            "status": "error"
        }

    if search_value is None:
        return {
            "progress": "Search value is missing",
            "status": "error"
        }

    return {
        "progress": "Search validated successfully",
        "status": "processing"
    }


# NODE 3: FETCH RECORDS
def fetch_records(state: SearchState):
    search_type = state.get("search_type")
    search_value = state.get("search_value")

    if search_type == "day":
        records = search_expenses_by_day(search_value)

    elif search_type == "month":
        records = search_expenses_by_month(
            search_value["year"],
            search_value["month"]
        )

    elif search_type == "year":
        records = search_expenses_by_year(search_value)

    elif search_type == "item":
        records = search_expenses_by_item(search_value)

    else:
        records = []

    return {
        "records": records,
        "progress": "Records fetched successfully",
        "status": "processing"
    }


# NODE 4: PROCESS RECORDS
def process_records(state: SearchState):
    records = state.get("records", [])

    return {
        "records": records,
        "progress": f"{len(records)} record(s) processed",
        "status": "processing"
    }


# NODE 5: CALCULATE TOTAL
def calculate_total_node(state: SearchState):
    records = state.get("records", [])

    total_amount = calculate_total(records)

    return {
        "total_amount": total_amount,
        "progress": "Total amount calculated",
        "status": "processing"
    }


# NODE 6: PREPARE RESULT
def prepare_result(state: SearchState):
    result = {
        "search_type": state.get("search_type"),
        "search_value": state.get("search_value"),
        "records": state.get("records", []),
        "total_amount": state.get("total_amount", 0)
    }

    return {
        "result": result,
        "progress": "Result prepared",
        "status": "processing"
    }


# NODE 7: COMPLETE
def complete(state: SearchState):
    return {
        "progress": "Search workflow completed",
        "status": "completed"
    }


# CREATE GRAPH
workflow = StateGraph(SearchState)


# ADD NODES
workflow.add_node("detect_search_type", detect_search_type)
workflow.add_node("validate_search", validate_search)
workflow.add_node("fetch_records", fetch_records)
workflow.add_node("process_records", process_records)
workflow.add_node("calculate_total", calculate_total_node)
workflow.add_node("prepare_result", prepare_result)
workflow.add_node("complete", complete)


# ADD EDGES
workflow.add_edge(START, "detect_search_type")
workflow.add_edge("detect_search_type", "validate_search")
workflow.add_edge("validate_search", "fetch_records")
workflow.add_edge("fetch_records", "process_records")
workflow.add_edge("process_records", "calculate_total")
workflow.add_edge("calculate_total", "prepare_result")
workflow.add_edge("prepare_result", "complete")
workflow.add_edge("complete", END)


# COMPILE WORKFLOW
search_workflow = workflow.compile()