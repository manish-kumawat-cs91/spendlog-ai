from sqlalchemy import Column, Integer, Numeric, String, Date, DateTime
from sqlalchemy.sql import func

from database import Base


class MoneyReceived(Base):
    __tablename__ = "money_received"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Numeric(10, 2), nullable=False)
    received_from = Column(String(255), nullable=False)
    received_date = Column(Date, nullable=False)

    created_at = Column(
        DateTime,
        server_default=func.now()
    )

    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )