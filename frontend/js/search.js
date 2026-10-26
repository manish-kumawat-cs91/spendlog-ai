// =========================================================
// SPENDLOG AI - SEARCH WITH SSE
// =========================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// =========================================================
// CHECK AUTHENTICATION
// =========================================================

const token = sessionStorage.getItem("access_token");

if (!token) {
    window.location.href = "unlock.html?next=search.html";
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
// ELEMENTS
// =========================================================

const searchType = document.getElementById("searchType");

const dayInput = document.getElementById("dayInput");
const monthInput = document.getElementById("monthInput");
const yearInput = document.getElementById("yearInput");
const itemInput = document.getElementById("itemInput");

const searchButton = document.getElementById("searchButton");

const progressBox = document.getElementById("progressBox");
const progressMessage = document.getElementById("progressMessage");

const resultBox = document.getElementById("resultBox");
const resultTableBody = document.getElementById("resultTableBody");

const totalAmount = document.getElementById("totalAmount");

const searchMessage = document.getElementById("searchMessage");


// =========================================================
// CHANGE SEARCH TYPE
// =========================================================

searchType.addEventListener("change", function () {

    dayInput.style.display = "none";
    monthInput.style.display = "none";
    yearInput.style.display = "none";
    itemInput.style.display = "none";

    if (searchType.value === "day") {
        dayInput.style.display = "block";
    }

    else if (searchType.value === "month") {
        monthInput.style.display = "block";
    }

    else if (searchType.value === "year") {
        yearInput.style.display = "block";
    }

    else if (searchType.value === "item") {
        itemInput.style.display = "block";
    }

});


// =========================================================
// SEARCH BUTTON
// =========================================================

searchButton.addEventListener("click", startSearch);


// =========================================================
// START SEARCH
// =========================================================

async function startSearch() {

    const type = searchType.value;

    let searchValue = "";


    // -----------------------------------------------------
    // GET SEARCH VALUE
    // -----------------------------------------------------

    if (type === "day") {

        searchValue =
            document.getElementById("searchDate").value;

        if (!searchValue) {

            showMessage(
                "Please select a date.",
                "danger"
            );

            return;
        }
    }


    else if (type === "month") {

        searchValue =
            document.getElementById("searchMonth").value;

        if (!searchValue) {

            showMessage(
                "Please select a month.",
                "danger"
            );

            return;
        }
    }


    else if (type === "year") {

        searchValue =
            document.getElementById("searchYear").value;

        if (!searchValue) {

            showMessage(
                "Please enter a year.",
                "danger"
            );

            return;
        }
    }


    else if (type === "item") {

        searchValue =
            document
                .getElementById("searchItem")
                .value
                .trim();

        if (!searchValue) {

            showMessage(
                "Please enter an item name.",
                "danger"
            );

            return;
        }
    }


    // =====================================================
    // RESET UI
    // =====================================================

    progressBox.style.display = "block";

    resultBox.style.display = "none";

    searchMessage.textContent = "";

    progressMessage.innerHTML =
        "🔄 Connecting to search stream...";

    searchButton.disabled = true;

    searchButton.textContent =
        "Searching...";


    // =====================================================
    // SSE REQUEST
    // =====================================================

    try {

        const url =
            `${API_BASE_URL}/api/search/stream` +
            `?search_type=${encodeURIComponent(type)}` +
            `&search_value=${encodeURIComponent(searchValue)}`;


        const response = await fetch(
            url,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );


        // =================================================
        // AUTH ERROR
        // =================================================

        if (response.status === 401) {

            sessionStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "unlock.html?next=search.html";

            return;
        }


        // =================================================
        // SERVER ERROR
        // =================================================

        if (!response.ok) {

            showMessage(
                "Search request failed.",
                "danger"
            );

            resetSearchButton();

            return;
        }


        // =================================================
        // CHECK SSE STREAM
        // =================================================

        if (!response.body) {

            showMessage(
                "SSE stream is not available.",
                "danger"
            );

            resetSearchButton();

            return;
        }


        // =================================================
        // CREATE SSE READER
        // =================================================

        const reader =
            response.body.getReader();

        const decoder =
            new TextDecoder();

        let buffer = "";


        // =================================================
        // READ STREAM
        // =================================================

        while (true) {

            const streamResult =
                await reader.read();

            const value =
                streamResult.value;

            const done =
                streamResult.done;


            if (done) {
                break;
            }


            buffer += decoder.decode(
                value,
                {
                    stream: true
                }
            );


            // ---------------------------------------------
            // SPLIT SSE EVENTS
            // ---------------------------------------------

            const events =
                buffer.split("\n\n");


            buffer =
                events.pop();


            // ---------------------------------------------
            // PROCESS EVENTS
            // ---------------------------------------------

            for (const event of events) {

                if (!event.startsWith("data:")) {
                    continue;
                }


                const jsonText =
                    event
                        .replace(/^data:\s*/, "")
                        .trim();


                try {

                    const eventData =
                        JSON.parse(jsonText);


                    // =====================================
                    // LIVE SSE PROGRESS
                    // =====================================

                    if (eventData.progress) {

                        updateProgress(
                            eventData.progress
                        );
                    }


                    // =====================================
                    // FINAL RESULT
                    // =====================================

                    if (
                        eventData.status === "completed" &&
                        eventData.result
                    ) {

                        updateProgress(
                            "✅ Search workflow completed"
                        );


                        displayResults(
                            eventData.result
                        );
                    }


                    // =====================================
                    // SSE ERROR
                    // =====================================

                    if (
                        eventData.status === "error"
                    ) {

                        updateProgress(
                            "❌ Search failed"
                        );


                        showMessage(
                            eventData.progress ||
                            "Search failed.",
                            "danger"
                        );
                    }

                }

                catch (error) {

                    console.error(
                        "Invalid SSE data:",
                        error
                    );

                }

            }

        }


        // =================================================
        // STREAM FINISHED
        // =================================================

        resetSearchButton();

    }


    catch (error) {

        console.error(
            "SSE Search Error:",
            error
        );


        showMessage(
            "Server connection failed.",
            "danger"
        );


        updateProgress(
            "❌ SSE connection failed"
        );


        resetSearchButton();
    }

}


// =========================================================
// UPDATE SSE PROGRESS
// =========================================================

function updateProgress(message) {

    progressBox.style.display = "block";


    progressMessage.innerHTML = `
        <div class="d-flex align-items-center gap-2">

            <span class="spinner-border spinner-border-sm"></span>

            <span>${message}</span>

        </div>
    `;


    // Keep latest progress visible
    progressBox.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });

}


// =========================================================
// DISPLAY RESULTS
// =========================================================

function displayResults(result) {

    resultBox.style.display = "block";

    resultTableBody.innerHTML = "";


    const total =
        Number(result.total_amount || 0);


    totalAmount.textContent =
        `₹${total.toFixed(2)}`;


    // =====================================================
    // NO RECORDS
    // =====================================================

    if (
        !result.records ||
        result.records.length === 0
    ) {

        resultTableBody.innerHTML = `
            <tr>

                <td
                    colspan="4"
                    class="text-center text-muted"
                >
                    No records found.
                </td>

            </tr>
        `;

        return;
    }


    // =====================================================
    // DISPLAY RECORDS
    // =====================================================

    result.records.forEach(function (record) {

        const row =
            document.createElement("tr");


        const amount =
            Number(record.amount || 0);


        row.innerHTML = `
            <td>${record.id}</td>

            <td>₹${amount.toFixed(2)}</td>

            <td>${record.item_name}</td>

            <td>${record.expense_date}</td>
        `;


        resultTableBody.appendChild(row);

    });

}


// =========================================================
// RESET SEARCH BUTTON
// =========================================================

function resetSearchButton() {

    searchButton.disabled = false;

    searchButton.textContent =
        "Search Records";
}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(message, type) {

    searchMessage.textContent =
        message;

    searchMessage.className =
        `mt-4 text-center fw-bold text-${type}`;
}