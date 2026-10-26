from database import Base, engine

from models.expense import ExpenseRecord
from models.money_received import MoneyReceived

print("Creating tables...")

Base.metadata.create_all(bind=engine)

print("Tables created successfully!")