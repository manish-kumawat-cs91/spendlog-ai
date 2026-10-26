from fastapi import APIRouter

from database import SessionLocal
from models.expense import ExpenseRecord
from models.money_received import MoneyReceived


router = APIRouter(
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


@router.get("/")
def get_dashboard():

    db = SessionLocal()

    try:

        expense_count = db.query(
            ExpenseRecord
        ).count()

        money_received_count = db.query(
            MoneyReceived
        ).count()

        return {
            "expense_records": expense_count,
            "money_received_records": money_received_count
        }

    finally:

        db.close()