const moneyForm = document.getElementById("moneyForm");
const moneyMessage = document.getElementById("moneyMessage");

moneyForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Test message
    moneyMessage.textContent = "Button clicked...";
    moneyMessage.className = "mt-3 text-center text-primary fw-bold";

    const amount = document.getElementById("amount").value;
    const receivedFrom = document.getElementById("receivedFrom").value;
    const receivedDate = document.getElementById("receivedDate").value;

    const moneyData = {
        amount: parseFloat(amount),
        received_from: receivedFrom,
        received_date: receivedDate
    };

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/api/money-received/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(moneyData)
            }
        );

        const data = await response.json();

        if (response.ok) {

            moneyMessage.textContent =
                "Money received added successfully!";

            moneyMessage.className =
                "mt-3 text-center text-success fw-bold";

            moneyForm.reset();

        } else {

            moneyMessage.textContent =
                data.detail || "Failed to add money received.";

            moneyMessage.className =
                "mt-3 text-center text-danger fw-bold";
        }

    } catch (error) {

        moneyMessage.textContent =
            "Server connection failed.";

        moneyMessage.className =
            "mt-3 text-center text-danger fw-bold";

        console.error(error);
    }
});