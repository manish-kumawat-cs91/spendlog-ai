from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class ExpenseCreate(BaseModel):
    amount: Decimal
    item_name: str
    expense_date: date