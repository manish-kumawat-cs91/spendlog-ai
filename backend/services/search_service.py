from datetime import date

from database import SessionLocal
from models.expense import ExpenseRecord


# SEARCH EXPENSES BY DAY
def search_expenses_by_day(search_date: date):
    db = SessionLocal()

    try:
        records = db.query(ExpenseRecord).filter(
            ExpenseRecord.expense_date == search_date
        ).all()

        return records

    finally:
        db.close()


# SEARCH EXPENSES BY MONTH
def search_expenses_by_month(year: int, month: int):
    db = SessionLocal()

    try:
        records = db.query(ExpenseRecord).filter(
            ExpenseRecord.expense_date >= date(year, month, 1),
            ExpenseRecord.expense_date < (
                date(year + 1, 1, 1)
                if month == 12
                else date(year, month + 1, 1)
            )
        ).all()

        return records

    finally:
        db.close()


# SEARCH EXPENSES BY YEAR
def search_expenses_by_year(year: int):
    db = SessionLocal()

    try:
        records = db.query(ExpenseRecord).filter(
            ExpenseRecord.expense_date >= date(year, 1, 1),
            ExpenseRecord.expense_date < date(year + 1, 1, 1)
        ).all()

        return records

    finally:
        db.close()


# SEARCH EXPENSES BY ITEM
def search_expenses_by_item(item_name: str):
    db = SessionLocal()

    try:
        records = db.query(ExpenseRecord).filter(
            ExpenseRecord.item_name.ilike(f"%{item_name}%")
        ).all()

        return records

    finally:
        db.close()


# CALCULATE TOTAL AMOUNT
def calculate_total(records):
    total = sum(record.amount for record in records)

    return total
    