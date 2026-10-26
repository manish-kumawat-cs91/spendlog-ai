// =========================================================
// SPENDLOG AI - EXPENSE RECORDS
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// =========================================================
// CHECK LOGIN
// =========================================================

const token = sessionStorage.getItem("access_token");

if (!token) {

    window.location.href =
        "unlock.html?next=records.html";

}


// =========================================================
// AUTHORIZATION HEADER
// =========================================================

function getAuthHeaders() {

    return {
        "Authorization": `Bearer ${token}`
    };

}


// =========================================================
// LOAD EXPENSE RECORDS
// =========================================================

async function loadExpenses() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/expenses/`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );


        // AUTH ERROR
        if (response.status === 401) {

            sessionStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "unlock.html?next=records.html";

            return;

        }


        // OTHER ERROR
        if (!response.ok) {

            showMessage(
                "Unable to load expense records.",
                "danger"
            );

            return;

        }


        const data =
            await response.json();


        const tableBody =
            document.getElementById(
                "expenseTableBody"
            );


        tableBody.innerHTML = "";


        // NO RECORDS
        if (
            !data ||
            data.length === 0
        ) {

            tableBody.innerHTML = `
                <tr>
                    <td
                        colspan="5"
                        class="text-center text-muted"
                    >
                        No expense records found.
                    </td>
                </tr>
            `;

            return;

        }


        // DISPLAY RECORDS
        data.forEach(function (expense) {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>
                    ${expense.id}
                </td>

                <td>
                    ₹${Number(expense.amount).toFixed(2)}
                </td>

                <td>
                    ${expense.item_name}
                </td>

                <td>
                    ${expense.expense_date}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-warning me-1"
                        onclick="editExpense(${expense.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="btn btn-sm btn-danger"
                        onclick="deleteExpense(${expense.id})"
                    >
                        Delete
                    </button>

                </td>
            `;


            tableBody.appendChild(row);

        });

    }

    catch (error) {

        showMessage(
            "Server connection failed.",
            "danger"
        );

        console.error(
            "Load expenses error:",
            error
        );

    }

}


// =========================================================
// DELETE EXPENSE
// =========================================================

async function deleteExpense(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/expenses/${id}`,
            {
                method: "DELETE",
                headers: getAuthHeaders()
            }
        );


        // AUTH ERROR
        if (response.status === 401) {

            sessionStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "unlock.html?next=records.html";

            return;

        }


        const data =
            await response.json();


        if (response.ok) {

            showMessage(
                "Expense deleted successfully!",
                "success"
            );


            loadExpenses();

        }

        else {

            showMessage(
                data.detail ||
                "Failed to delete expense.",
                "danger"
            );

        }

    }

    catch (error) {

        showMessage(
            "Server connection failed.",
            "danger"
        );

        console.error(
            "Delete expense error:",
            error
        );

    }

}


// =========================================================
// EDIT EXPENSE
// =========================================================

async function editExpense(id) {

    const amount =
        prompt(
            "Enter new amount:"
        );


    if (amount === null) {

        return;

    }


    const numericAmount =
        parseFloat(amount);


    if (
        isNaN(numericAmount) ||
        numericAmount <= 0
    ) {

        showMessage(
            "Please enter a valid amount.",
            "danger"
        );

        return;

    }


    const itemName =
        prompt(
            "Enter new item name:"
        );


    if (itemName === null) {

        return;

    }


    if (
        itemName.trim() === ""
    ) {

        showMessage(
            "Item name cannot be empty.",
            "danger"
        );

        return;

    }


    const expenseDate =
        prompt(
            "Enter new date (YYYY-MM-DD):"
        );


    if (expenseDate === null) {

        return;

    }


    if (
        expenseDate.trim() === ""
    ) {

        showMessage(
            "Date cannot be empty.",
            "danger"
        );

        return;

    }


    const expenseData = {

        amount:
            numericAmount,

        item_name:
            itemName.trim(),

        expense_date:
            expenseDate.trim()

    };


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/expenses/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    ...getAuthHeaders()
                },

                body:
                    JSON.stringify(
                        expenseData
                    )
            }
        );


        // AUTH ERROR
        if (response.status === 401) {

            sessionStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "unlock.html?next=records.html";

            return;

        }


        const data =
            await response.json();


        if (response.ok) {

            showMessage(
                "Expense updated successfully!",
                "success"
            );


            loadExpenses();

        }

        else {

            showMessage(
                data.detail ||
                "Failed to update expense.",
                "danger"
            );

        }

    }

    catch (error) {

        showMessage(
            "Server connection failed.",
            "danger"
        );

        console.error(
            "Edit expense error:",
            error
        );

    }

}


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
    message,
    type
) {

    const messageBox =
        document.getElementById(
            "recordsMessage"
        );


    messageBox.textContent =
        message;


    messageBox.className =
        `mt-4 text-center fw-bold text-${type}`;

}


// =========================================================
// LOAD RECORDS
// =========================================================

loadExpenses();