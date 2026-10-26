from datetime import date
from decimal import Decimal

from pydantic import BaseModel


class MoneyReceivedCreate(BaseModel):
    amount: Decimal
    received_from: str
    received_date: date