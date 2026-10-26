// =========================================================
// SPENDLOG AI - MONEY RECEIVED RECORDS
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// =========================================================
// CHECK LOGIN
// =========================================================

const token = sessionStorage.getItem("access_token");

if (!token) {

    window.location.href =
        "unlock.html?next=money_records.html";

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
// LOAD MONEY RECEIVED RECORDS
// =========================================================

async function loadMoneyRecords() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/api/money-received/`,
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
                "unlock.html?next=money_records.html";

            return;

        }


        // OTHER ERROR
        if (!response.ok) {

            showMessage(
                "Unable to load money received records.",
                "danger"
            );

            return;

        }


        const data =
            await response.json();


        const tableBody =
            document.getElementById(
                "moneyTableBody"
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
                        No money received records found.
                    </td>
                </tr>
            `;

            return;

        }


        // DISPLAY RECORDS
        data.forEach(function (money) {

            const row =
                document.createElement("tr");


            row.innerHTML = `
                <td>
                    ${money.id}
                </td>

                <td>
                    ₹${Number(money.amount).toFixed(2)}
                </td>

                <td>
                    ${money.received_from}
                </td>

                <td>
                    ${money.received_date}
                </td>

                <td>

                    <button
                        class="btn btn-sm btn-warning me-1"
                        onclick="editMoney(${money.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="btn btn-sm btn-danger"
                        onclick="deleteMoney(${money.id})"
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
            "Load money records error:",
            error
        );

    }

}


// =========================================================
// DELETE MONEY RECEIVED
// =========================================================

async function deleteMoney(id) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this money received record?"
        );


    if (!confirmDelete) {

        return;

    }


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/money-received/${id}`,
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
                "unlock.html?next=money_records.html";

            return;

        }


        const data =
            await response.json();


        if (response.ok) {

            showMessage(
                "Money received record deleted successfully!",
                "success"
            );


            loadMoneyRecords();

        }

        else {

            showMessage(
                data.detail ||
                "Failed to delete money received record.",
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
            "Delete money record error:",
            error
        );

    }

}


// =========================================================
// EDIT MONEY RECEIVED
// =========================================================

async function editMoney(id) {

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


    const receivedFrom =
        prompt(
            "Enter new received from:"
        );


    if (receivedFrom === null) {

        return;

    }


    if (
        receivedFrom.trim() === ""
    ) {

        showMessage(
            "Received from cannot be empty.",
            "danger"
        );

        return;

    }


    const receivedDate =
        prompt(
            "Enter new date (YYYY-MM-DD):"
        );


    if (receivedDate === null) {

        return;

    }


    if (
        receivedDate.trim() === ""
    ) {

        showMessage(
            "Date cannot be empty.",
            "danger"
        );

        return;

    }


    const moneyData = {

        amount:
            numericAmount,

        received_from:
            receivedFrom.trim(),

        received_date:
            receivedDate.trim()

    };


    try {

        const response = await fetch(
            `${API_BASE_URL}/api/money-received/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    ...getAuthHeaders()
                },

                body:
                    JSON.stringify(
                        moneyData
                    )
            }
        );


        // AUTH ERROR
        if (response.status === 401) {

            sessionStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "unlock.html?next=money_records.html";

            return;

        }


        const data =
            await response.json();


        if (response.ok) {

            showMessage(
                "Money received record updated successfully!",
                "success"
            );


            loadMoneyRecords();

        }

        else {

            showMessage(
                data.detail ||
                "Failed to update money received record.",
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
            "Edit money record error:",
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
            "moneyRecordsMessage"
        );


    messageBox.textContent =
        message;


    messageBox.className =
        `mt-4 text-center fw-bold text-${type}`;

}


// =========================================================
// LOAD RECORDS
// =========================================================

loadMoneyRecords();