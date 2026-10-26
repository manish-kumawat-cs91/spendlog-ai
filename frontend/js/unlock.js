// =========================================================
// SPENDLOG AI - UNLOCK
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000";

const unlockForm =
    document.getElementById("unlockForm");

const unlockMessage =
    document.getElementById("unlockMessage");


// =========================================================
// FORM SUBMIT
// =========================================================

unlockForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const password =
            document.getElementById("password").value;


        if (!password) {

            showMessage(
                "Please enter your password.",
                "danger"
            );

            return;

        }


        try {

            const response = await fetch(
                `${API_BASE_URL}/api/auth/unlock`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        password: password
                    })
                }
            );


            const data =
                await response.json();


            // =================================================
            // CORRECT PASSWORD
            // =================================================

            if (response.ok) {

                sessionStorage.setItem(
                    "access_token",
                    data.access_token
                );


                showMessage(
                    "Access granted!",
                    "success"
                );


                // Clear password field
                document.getElementById(
                    "password"
                ).value = "";


                // Get requested page
                const urlParams =
                    new URLSearchParams(
                        window.location.search
                    );


                const nextPage =
                    urlParams.get("next");


                // Only allow protected pages
                const allowedPages = [
                    "records.html",
                    "search.html",
                    "money_records.html"
                ];


                let destination =
                    "records.html";


                if (
                    nextPage &&
                    allowedPages.includes(nextPage)
                ) {

                    destination =
                        nextPage;

                }


                setTimeout(
                    function () {

                        window.location.href =
                            destination;

                    },
                    500
                );

            }


            // =================================================
            // WRONG PASSWORD
            // =================================================

            else {

                showMessage(
                    data.detail ||
                    "Incorrect password.",
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
                "Unlock error:",
                error
            );

        }

    }
);


// =========================================================
// MESSAGE
// =========================================================

function showMessage(
    message,
    type
) {

    unlockMessage.textContent =
        message;

    unlockMessage.className =
        `mt-3 text-center fw-bold text-${type}`;

}