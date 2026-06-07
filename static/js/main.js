/*
=========================================
FinanceTracker - Day 9
=========================================
*/

let categoryChart = null;

/* Monthly chart object */
let monthlyChart = null;


/*
=========================================
Load Categories
=========================================
*/

async function loadCategories() {

    try {

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

    } catch (error) {

        console.error(
            "Category Load Error:",
            error
        );
    }
}


/*
=========================================
Populate Year Dropdown
=========================================
*/

function populateYears() {

    const yearSelect =
        document.getElementById(
            "year-select"
        );

    if (!yearSelect) return;

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


/*
=========================================
Load Transactions
=========================================
*/

async function loadTransactions() {

    try {

        const response =
            await fetch('/transactions');

        const transactions =
            await response.json();

        const container =
            document.getElementById(
                'transaction-list'
            );

        container.innerHTML = '';

        let totalIncome = 0;

        let totalExpense = 0;

        const selectedYear =
            document.getElementById(
                'year-select'
            )?.value || '';

        const selectedMonth =
            document.getElementById(
                'month-select'
            )?.value || '';

        transactions.forEach(transaction => {

            const date =
                new Date(
                    transaction.transaction_date
                );

            const year =
                date.getFullYear().toString();

            const month =
                String(
                    date.getMonth() + 1
                ).padStart(2, '0');

            if (
                (selectedYear === '' ||
                    selectedYear === year)

                &&

                (selectedMonth === '' ||
                    selectedMonth === month)
            ) {

                if (
                    transaction.transaction_type
                    === "Income"
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

                container.innerHTML += `

                    <tr>

                        <td>
                            ${transaction.transaction_id}
                        </td>

                        <td>
                            ${transaction.transaction_date}
                        </td>

                        <td>
                            ${transaction.description}
                        </td>

                        <td>
                            ${transaction.transaction_type}
                        </td>

                        <td>
                            ₹${transaction.amount}
                        </td>

                        <td>

                            <button
                            onclick="
                            editTransaction(
                            ${transaction.transaction_id},
                            '${transaction.description}',
                            ${transaction.amount}
                            )">

                            Edit

                            </button>

                            <button
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
            "total-income"
        ).innerText =
            `₹${totalIncome.toFixed(2)}`;

        document.getElementById(
            "total-expense"
        ).innerText =
            `₹${totalExpense.toFixed(2)}`;
        /*
=========================================
Budget Calculation
=========================================
*/

try {

    const budget =
        await loadBudget();

console.log("Budget =", budget);
console.log("Total Expense =", totalExpense);

    const remaining =
        budget - totalExpense;
    
    console.log("Remaining =", remaining);


    document
        .getElementById(
            'remaining-budget'
        )
        .innerText =
        `₹${remaining.toFixed(2)}`;

    const warning =
        document.getElementById(
            'budget-warning'
        );

    if (warning) {

        if (remaining < 0) {

            warning.innerText =
                "⚠ Budget Exceeded";

        } else {

            warning.innerText = "";
        }
    }

} catch (error) {

    console.error(
        "Budget Calculation Error:",
        error
    );
}

    } catch (error) {

        console.error(
            "Transaction Load Error:",
            error
        );
    }
}


/*
=========================================
Add Transaction
=========================================
*/

const form =
    document.getElementById(
        "transaction-form"
    );

if (form) {

    form.addEventListener(
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

            try {

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

                form.reset();

                loadTransactions();

                loadCategoryChart();

                loadMonthlyChart();

            } catch (error) {

                console.error(
                    "Add Transaction Error:",
                    error
                );
            }
        }
    );
}


/*
=========================================
Delete Transaction
=========================================
*/

async function deleteTransaction(id) {

    const confirmDelete =
        confirm(
            "Delete this transaction?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        await fetch(
            `/transactions/${id}`,
            {
                method: "DELETE"
            }
        );

        loadTransactions();

        loadCategoryChart();

        loadMonthlyChart();

    } catch (error) {

        console.error(
            "Delete Error:",
            error
        );
    }
}


/*
=========================================
Edit Transaction
=========================================
*/

async function editTransaction(
    id,
    oldDescription,
    oldAmount
) {

    const newDescription =
        prompt(
            "Edit Description",
            oldDescription
        );

    const newAmount =
        prompt(
            "Edit Amount",
            oldAmount
        );

    if (
        newDescription === null ||
        newAmount === null
    ) {
        return;
    }

    try {

        await fetch(
            `/transactions/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

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

                loadCategoryChart();

                loadMonthlyChart();

    } catch (error) {

        console.error(
            "Edit Error:",
            error
        );
    }
}


/*
=========================================
Analytics Pie Chart
=========================================
*/

async function loadCategoryChart() {

    try {

        const response =
            await fetch(
                '/analytics/categories'
            );

        const data =
            await response.json();

        const labels =
            data.map(
                item =>
                item.category_name
            );

        const totals =
            data.map(
                item =>
                item.total
            );

        const canvas =
            document.getElementById(
                'categoryChart'
            );

        if (!canvas) {
            return;
        }

        if (categoryChart) {
            categoryChart.destroy();
        }

        categoryChart =
            new Chart(
                canvas,
                {

                    type: 'pie',

                    data: {

                        labels: labels,

                        datasets: [
                            {
                                data: totals
                            }
                        ]
                    }
                }
            );

    } catch (error) {

        console.error(
            "Chart Error:",
            error
        );
    }
}
/*
=========================================
Load Budget
=========================================
*/

async function loadBudget() {

    try {

        const response =
            await fetch('/budget');

        const budget =
            await response.json();

        return parseFloat(
            budget.monthly_limit
        );

    } catch (error) {

        console.error(
            "Budget Error:",
            error
        );

        return 0;
    }
}
/*
=========================================
Monthly Expense Chart
=========================================
*/

async function loadMonthlyChart() {

    try {

        const response =
            await fetch(
                '/analytics/monthly'
            );

        const data =
            await response.json();

        const labels =
            data.map(
                item =>
                item.month
            );

        const totals =
            data.map(
                item =>
                item.total
            );

        const canvas =
            document.getElementById(
                'monthlyChart'
            );

        if (!canvas) {
            return;
        }

        if (monthlyChart) {
            monthlyChart.destroy();
        }

        monthlyChart =
            new Chart(
                canvas,
                {

                    type: 'line',

                    data: {

                        labels: labels,

                        datasets: [
                            {
                                label:
                                    'Monthly Expenses',

                                data:
                                    totals,

                                tension: 0.3
                            }
                        ]
                    }
                }
            );

    } catch (error) {

        console.error(
            "Monthly Chart Error:",
            error
        );
    }
}
/*
=========================================
Export CSV
Day 11
=========================================
*/

function exportCSV() {

    window.location.href =
        "/export/csv";
}

/*
=========================================
Startup
=========================================
*/

populateYears();

loadCategories();

loadTransactions();

loadCategoryChart();

loadMonthlyChart();