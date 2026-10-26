from sqlalchemy import Column, Integer, Numeric, String, Date, DateTime
from sqlalchemy.sql import func

from database import Base


class ExpenseRecord(Base):
    __tablename__ = "expense_records"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    item_name = Column(String(255), nullable=False)
    expense_date = Column(Date, nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )