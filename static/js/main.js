document
    .getElementById("transaction-form")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const transaction = {

            user_id: 1,

            category_id: parseInt(
                document.getElementById(
                    "category_id"
                ).value
            ),

            amount: parseFloat(
                document.getElementById(
                    "amount"
                ).value
            ),

            transaction_type: "Expense",

            description:
                document.getElementById(
                    "description"
                ).value,

            transaction_date:
                document.getElementById(
                    "transaction_date"
                ).value
        };

        const response =
            await fetch(
                "/transactions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            transaction
                        )
                }
            );

        const result =
            await response.json();

        alert(result.message);
    });

    function populateYears() {

    const yearSelect =
        document.getElementById(
            "year-select"
        );

    const currentYear =
        new Date().getFullYear();

    for (
        let year = currentYear;
        year >= 2020;
        year--
    ) {

        yearSelect.innerHTML += `
            <option value="${year}">
                ${year}
            </option>
        `;
    }
}

populateYears();

    async function loadTransactions() {

    const response =
        await fetch('/transactions');

    const transactions =
        await response.json();

    const year =
        document.getElementById(
            "year-select"
        ).value;

    const month =
        document.getElementById(
            "month-select"
        ).value;

    const container =
        document.getElementById(
            'transaction-list'
        );

    container.innerHTML = '';

    let total = 0;

    transactions.forEach(
        transaction => {

            const date =
                new Date(
                    transaction.transaction_date
                );

            const transactionYear =
                date.getFullYear().toString();

            const transactionMonth =
                String(
                    date.getMonth() + 1
                ).padStart(2, '0');

            if (
                (year === '' || transactionYear === year)
                &&
                (month === '' || transactionMonth === month)
            ) {

                total +=
                    parseFloat(
                        transaction.amount
                    );

                container.innerHTML += `
                    <p>
                        <strong>
                            ${transaction.description}
                        </strong>

                        -
                        ₹${transaction.amount}

                        -
                        ${transaction.transaction_date}
                    </p>
                `;
            }
        }
    );

    container.innerHTML += `
        <hr>

        <h3>
            Total Expenses:
            ₹${total.toFixed(2)}
        </h3>
    `;
}