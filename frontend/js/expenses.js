const expenseForm = document.getElementById("expenseForm");
const expenseMessage = document.getElementById("expenseMessage");


expenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const amount = document.getElementById("amount").value;
    const itemName = document.getElementById("itemName").value;
    const expenseDate = document.getElementById("expenseDate").value;


    const expenseData = {
        amount: parseFloat(amount),
        item_name: itemName,
        expense_date: expenseDate
    };


    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/expenses/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(expenseData)
            }
        );


        const data = await response.json();


        if (response.ok) {

            expenseMessage.textContent =
                "Expense added successfully!";

            expenseMessage.className =
                "mt-3 text-center text-success fw-bold";


            expenseForm.reset();

        } else {

            expenseMessage.textContent =
                data.detail || "Failed to add expense.";

            expenseMessage.className =
                "mt-3 text-center text-danger fw-bold";
        }


    } catch (error) {

        expenseMessage.textContent =
            "Server connection failed.";

        expenseMessage.className =
            "mt-3 text-center text-danger fw-bold";

        console.error(error);
    }

});