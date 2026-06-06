let deletedTransactions = [];

let redoTransactions = [];


/* ---------------------------
   Load Categories
---------------------------- */

async function loadCategories() {

    const response =
        await fetch('/categories');

    const categories =
        await response.json();

    const dropdown =
        document.getElementById(
            'category_id'
        );

    dropdown.innerHTML = '';

    categories.forEach(category => {

        dropdown.innerHTML += `
            <option value="${category.category_id}">
                ${category.category_name}
            </option>
        `;
    });
}


/* ---------------------------
   Populate Years
---------------------------- */

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


/* ---------------------------
   Load Transactions
---------------------------- */

async function loadTransactions() {

    const response =
        await fetch('/transactions');

    const transactions =
        await response.json();

    const year =
        document.getElementById(
            'year-select'
        ).value;

    const month =
        document.getElementById(
            'month-select'
        ).value;

    const table =
        document.getElementById(
            'transaction-list'
        );

    table.innerHTML = '';

    let totalIncome = 0;

    let totalExpense = 0;

    transactions.forEach(transaction => {

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
            (year === '' ||
             transactionYear === year)
            &&
            (month === '' ||
             transactionMonth === month)
        ) {

            if (
                transaction.transaction_type
                === 'Income'
            ) {

                totalIncome +=
                    parseFloat(
                        transaction.amount
                    );

            } else {

                totalExpense +=
                    parseFloat(
                        transaction.amount
                    );
            }

            table.innerHTML += `

                <tr>

                    <td>${transaction.transaction_id}</td>

                    <td>${transaction.transaction_date}</td>

                    <td>${transaction.description}</td>

                    <td>${transaction.transaction_type}</td>

                    <td>₹${transaction.amount}</td>

                    <td>

                        <button
                        class="edit-btn"
                        onclick="
                        editTransaction(
                        ${transaction.transaction_id},
                        '${transaction.description}',
                        ${transaction.amount}
                        )">

                        Edit

                        </button>

                        <button
                        class="delete-btn"
                        onclick="
                        deleteTransaction(
                        ${transaction.transaction_id}
                        )">

                        Delete

                        </button>

                    </td>

                </tr>
            `;
        }
    });

    document.getElementById(
        'total-income'
    ).innerText =
        `₹${totalIncome.toFixed(2)}`;

    document.getElementById(
        'total-expense'
    ).innerText =
        `₹${totalExpense.toFixed(2)}`;
}


/* ---------------------------
   Add Transaction
---------------------------- */

document
.getElementById(
    "transaction-form"
)
.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        const transaction = {

            user_id: 1,

            category_id:
            parseInt(
                document.getElementById(
                    "category_id"
                ).value
            ),

            amount:
            parseFloat(
                document.getElementById(
                    "amount"
                ).value
            ),

            transaction_type:
            document.getElementById(
                "transaction_type"
            ).value,

            description:
            document.getElementById(
                "description"
            ).value,

            transaction_date:
            document.getElementById(
                "transaction_date"
            ).value
        };

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

        loadTransactions();

        document
        .getElementById(
            "transaction-form"
        )
        .reset();
    }
);


/* ---------------------------
   Delete Transaction
---------------------------- */

async function deleteTransaction(id) {

    await fetch(
        `/transactions/${id}`,
        {
            method: "DELETE"
        }
    );

    loadTransactions();
}


/* ---------------------------
   Edit Transaction
---------------------------- */

async function editTransaction(
    id,
    description,
    amount
){

    const newDescription =
        prompt(
            "Edit Description",
            description
        );

    const newAmount =
        prompt(
            "Edit Amount",
            amount
        );

    if(
        !newDescription ||
        !newAmount
    ){
        return;
    }

    await fetch(
        `/transactions/${id}`,
        {
            method: "PUT",

            headers:{
                "Content-Type":
                "application/json"
            },

            body:
            JSON.stringify({

                description:
                newDescription,

                amount:
                parseFloat(
                    newAmount
                )
            })
        }
    );

    loadTransactions();
}


/* ---------------------------
   Undo / Redo Placeholder
---------------------------- */

function undoDelete() {

    alert(
        "Undo functionality requires backend history tracking and will be added later."
    );
}

function redoDelete() {

    alert(
        "Redo functionality requires backend history tracking and will be added later."
    );
}


/* ---------------------------
   Startup
---------------------------- */

populateYears();

loadCategories();

loadTransactions();