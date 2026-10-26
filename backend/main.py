from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from database import SessionLocal

from routes.expense_routes import router as expense_router
from routes.money_routes import router as money_router
from routes.search_routes import router as search_router
from routes.dashboard_routes import router as dashboard_router
from routes.auth_routes import router as auth_router


app = FastAPI(title="SpendLog AI")


# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Expense Routes
app.include_router(expense_router)

# Money Received Routes
app.include_router(money_router)

# Search Routes
app.include_router(search_router)

# Dashboard Routes
app.include_router(dashboard_router)

# Authentication Routes
app.include_router(auth_router)


@app.get("/")
def home():
    return {
        "message": "SpendLog AI API is running!"
    }


@app.get("/db-test")
def database_test():

    db = SessionLocal()

    try:
        db.execute(text("SELECT 1"))

        return {
            "message": "PostgreSQL connected successfully!"
        }

    finally:
        db.close()