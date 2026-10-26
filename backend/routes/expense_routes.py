from datetime import date, datetime
from decimal import Decimal
import json
import time

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse

from schemas.expense_schema import ExpenseCreate
from database import SessionLocal
from models.expense import ExpenseRecord
from auth import require_auth


router = APIRouter(
    prefix="/api/expenses",
    tags=["Expenses"]
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

    return (
        "data: "
        + json.dumps(data, default=json_safe)
        + "\n\n"
    )


# =========================================================
# FORMAT EXPENSE
# =========================================================

def format_expense(expense):

    return {
        "id": json_safe(expense.id),
        "amount": json_safe(expense.amount),
        "item_name": json_safe(expense.item_name),
        "expense_date": json_safe(expense.expense_date),
        "created_at": json_safe(expense.created_at),
        "updated_at": json_safe(expense.updated_at)
    }


# =========================================================
# ADD EXPENSE
# Password NOT required
# =========================================================

@router.post("/")
def create_expense(expense: ExpenseCreate):

    db = SessionLocal()

    try:

        new_expense = ExpenseRecord(
            amount=expense.amount,
            item_name=expense.item_name,
            expense_date=expense.expense_date
        )

        db.add(new_expense)
        db.commit()
        db.refresh(new_expense)

        return {
            "message": "Expense added successfully!",
            "id": new_expense.id
        }

    finally:

        db.close()


# =========================================================
# GET ALL EXPENSES
# Password REQUIRED
# =========================================================

@router.get("/")
def get_expenses(
    authenticated: bool = Depends(require_auth)
):

    db = SessionLocal()

    try:

        expenses = db.query(ExpenseRecord).all()

        return [
            format_expense(expense)
            for expense in expenses
        ]

    finally:

        db.close()


# =========================================================
# GET ALL EXPENSES - SSE STREAM
# Password REQUIRED
# =========================================================

@router.get("/stream")
def expense_stream(
    authenticated: bool = Depends(require_auth)
):

    def event_generator():

        # -------------------------------------------------
        # START
        # -------------------------------------------------

        yield sse_event({
            "progress": "Expense records loading...",
            "status": "processing"
        })

        time.sleep(0.5)


        # -------------------------------------------------
        # DATABASE CONNECTION
        # -------------------------------------------------

        yield sse_event({
            "progress": "Connecting to expense records...",
            "status": "processing"
        })

        time.sleep(0.5)


        db = SessionLocal()

        try:

            # ---------------------------------------------
            # FETCH RECORDS
            # ---------------------------------------------

            expenses = db.query(
                ExpenseRecord
            ).all()


            yield sse_event({
                "progress": "Expense records fetched successfully.",
                "status": "processing"
            })

            time.sleep(0.5)


            # ---------------------------------------------
            # FORMAT RECORDS
            # ---------------------------------------------

            records = [
                format_expense(expense)
                for expense in expenses
            ]


            yield sse_event({
                "progress": "Preparing expense records...",
                "status": "processing"
            })

            time.sleep(0.5)


            # ---------------------------------------------
            # FINAL RESULT
            # ---------------------------------------------

            yield sse_event({
                "progress": "Expense records loaded successfully.",
                "status": "completed",
                "records": records
            })


        finally:

            db.close()


    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )


# =========================================================
# GET EXPENSE BY ID
# Password REQUIRED
# =========================================================

@router.get("/{expense_id}")
def get_expense(
    expense_id: int,
    authenticated: bool = Depends(require_auth)
):

    db = SessionLocal()

    try:

        expense = db.query(
            ExpenseRecord
        ).filter(
            ExpenseRecord.id == expense_id
        ).first()


        if not expense:

            return {
                "message": "Expense not found"
            }


        return format_expense(expense)

    finally:

        db.close()


# =========================================================
# UPDATE EXPENSE
# Password REQUIRED
# =========================================================

@router.put("/{expense_id}")
def update_expense(
    expense_id: int,
    expense: ExpenseCreate,
    authenticated: bool = Depends(require_auth)
):

    db = SessionLocal()

    try:

        existing_expense = db.query(
            ExpenseRecord
        ).filter(
            ExpenseRecord.id == expense_id
        ).first()


        if not existing_expense:

            return {
                "message": "Expense not found"
            }


        existing_expense.amount = expense.amount

        existing_expense.item_name = (
            expense.item_name
        )

        existing_expense.expense_date = (
            expense.expense_date
        )


        db.commit()

        db.refresh(
            existing_expense
        )


        return {
            "message": "Expense updated successfully!",
            "id": existing_expense.id
        }

    finally:

        db.close()


# =========================================================
# DELETE EXPENSE
# Password REQUIRED
# =========================================================

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: int,
    authenticated: bool = Depends(require_auth)
):

    db = SessionLocal()

    try:

        existing_expense = db.query(
            ExpenseRecord
        ).filter(
            ExpenseRecord.id == expense_id
        ).first()


        if not existing_expense:

            return {
                "message": "Expense not found"
            }


        db.delete(
            existing_expense
        )

        db.commit()


        return {
            "message": "Expense deleted successfully!",
            "id": expense_id
        }

    finally:

        db.close()