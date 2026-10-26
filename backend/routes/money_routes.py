from fastapi import APIRouter, Depends

from schemas.money_schema import MoneyReceivedCreate
from database import SessionLocal
from models.money_received import MoneyReceived
from auth import require_auth


router = APIRouter(
    prefix="/api/money-received",
    tags=["Money Received"]
)


# =========================================================
# ADD MONEY RECEIVED
# Password NOT required
# =========================================================

@router.post("/")
def create_money_received(money: MoneyReceivedCreate):
    db = SessionLocal()

    try:
        new_money = MoneyReceived(
            amount=money.amount,
            received_from=money.received_from,
            received_date=money.received_date
        )

        db.add(new_money)
        db.commit()
        db.refresh(new_money)

        return {
            "message": "Money received added successfully!",
            "id": new_money.id
        }

    finally:
        db.close()


# =========================================================
# GET ALL MONEY RECEIVED
# Password REQUIRED
# =========================================================

@router.get("/")
def get_money_received(
    authenticated: bool = Depends(require_auth)
):
    db = SessionLocal()

    try:
        records = db.query(MoneyReceived).all()

        return records

    finally:
        db.close()


# =========================================================
# GET MONEY RECEIVED BY ID
# Password REQUIRED
# =========================================================

@router.get("/{money_id}")
def get_money_received_by_id(
    money_id: int,
    authenticated: bool = Depends(require_auth)
):
    db = SessionLocal()

    try:
        record = db.query(MoneyReceived).filter(
            MoneyReceived.id == money_id
        ).first()

        if not record:
            return {
                "message": "Money received record not found"
            }

        return record

    finally:
        db.close()


# =========================================================
# UPDATE MONEY RECEIVED
# Password REQUIRED
# =========================================================

@router.put("/{money_id}")
def update_money_received(
    money_id: int,
    money: MoneyReceivedCreate,
    authenticated: bool = Depends(require_auth)
):
    db = SessionLocal()

    try:
        existing_money = db.query(MoneyReceived).filter(
            MoneyReceived.id == money_id
        ).first()

        if not existing_money:
            return {
                "message": "Money received record not found"
            }

        existing_money.amount = money.amount
        existing_money.received_from = money.received_from
        existing_money.received_date = money.received_date

        db.commit()
        db.refresh(existing_money)

        return {
            "message": "Money received updated successfully!",
            "id": existing_money.id
        }

    finally:
        db.close()


# =========================================================
# DELETE MONEY RECEIVED
# Password REQUIRED
# =========================================================

@router.delete("/{money_id}")
def delete_money_received(
    money_id: int,
    authenticated: bool = Depends(require_auth)
):
    db = SessionLocal()

    try:
        existing_money = db.query(MoneyReceived).filter(
            MoneyReceived.id == money_id
        ).first()

        if not existing_money:
            return {
                "message": "Money received record not found"
            }

        db.delete(existing_money)
        db.commit()

        return {
            "message": "Money received deleted successfully!",
            "id": money_id
        }

    finally:
        db.close()