# SpendLog AI

### Record Every Rupee. Find It Anytime.

SpendLog AI is a personal money record system that helps users record and search:

- Money Spent
- Money Received

It provides secure access to existing records and allows searching expenses by day, month, year, and item.

---

## Features

### Expense Management

- Add Expense
- View Expense Records
- Edit Expense
- Delete Expense

### Money Received

- Add Money Received
- View Money Received Records
- Edit Money Received Record
- Delete Money Received Record

### Search

Expenses can be searched by:

- Day
- Month
- Year
- Item Name

Item search supports partial and case-insensitive matching.

### Authentication

Existing records and data-management operations are protected by password authentication.

The system uses:

- Password verification
- Bearer access token
- Session-based frontend access

Adding a new expense or money received record does not require unlocking.

### LangGraph

The search system uses a LangGraph workflow:

START
↓
Detect Search Type
↓
Validate Search
↓
Fetch Records
↓
Process Records
↓
Calculate Total
↓
Prepare Result
↓
Complete
↓
END

### Server-Sent Events

The search system can provide progress updates such as:

- Search started
- Search type detected
- Search validated
- Records fetched
- Total calculated
- Search completed

---

## Technology Stack

### Frontend

- HTML
- CSS
- JavaScript
- Bootstrap
- Fetch API

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy

### Database

- PostgreSQL

### AI / Workflow

- LangGraph

### Security

- Environment variables
- Password authentication
- Bearer token authentication

---

## Project Structure

```text
spendlog-ai/
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── auth.py
│   ├── create_tables.py
│   ├── requirements.txt
│   ├── .env
│   │
│   ├── models/
│   │   ├── expense.py
│   │   └── money_received.py
│   │
│   ├── schemas/
│   │   ├── expense_schema.py
│   │   └── money_schema.py
│   │
│   ├── routes/
│   │   ├── expense_routes.py
│   │   ├── money_routes.py
│   │   ├── search_routes.py
│   │   ├── dashboard_routes.py
│   │   └── auth_routes.py
│   │
│   ├── services/
│   │   ├── expense_service.py
│   │   ├── money_service.py
│   │   └── search_service.py
│   │
│   └── workflows/
│       └── search_workflow.py
│
├── frontend/
│   ├── index.html
│   ├── expenses.html
│   ├── money_received.html
│   ├── records.html
│   ├── search.html
│   ├── unlock.html
│   │
│   ├── css/
│   │   └── style.css
│   │
│   └── js/
│       ├── app.js
│       ├── expenses.js
│       ├── money.js
│       ├── records.js
│       ├── search.js
│       └── unlock.js
│
└── README.md

API Endpoints 
expences 
POST   /api/expenses/
GET    /api/expenses/
GET    /api/expenses/{expense_id}
PUT    /api/expenses/{expense_id}
DELETE /api/expenses/{expense_id}

Money Received 
POST   /api/money-received/
GET    /api/money-received/
GET    /api/money-received/{money_id}
PUT    /api/money-received/{money_id}
DELETE /api/money-received/{money_id}

Search 
GET /api/search/day
GET /api/search/month
GET /api/search/year
GET /api/search/item
GET /api/search/stream

Dashboard
GET /api/dashboard/

Authentication
POST /api/auth/unlock