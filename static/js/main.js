// =====================================
// UNDO / REDO HISTORY STACKS & CACHE
// =====================================
let deletedTransactions = [];
let redoTransactions = [];
let globalCategories = []; // ✨ FIX: Global array categories ki sahi ID dhoondhne ke liye

let categoryChart = null;
let monthlyChart = null;

// =====================================
// Load Categories Dropdowns
// =====================================
async function loadCategories() {
    try {
        const response = await fetch('/categories');
        globalCategories = await response.json(); 
        
        const dropdown = document.getElementById('category_id');
        dropdown.innerHTML = '';

        const categoryFilter = document.getElementById("category-filter");
        if(categoryFilter) {
            categoryFilter.innerHTML = `<option value="">All Categories</option>`;
        }

        globalCategories.forEach(category => {
            if(categoryFilter){
                categoryFilter.innerHTML += `<option value="${category.category_name}">${category.category_name}</option>`;
            }
            dropdown.innerHTML += `<option value="${category.category_id}">${category.category_name}</option>`;
        });
    } catch (error) {
        console.error("Category Load Error:", error);
    }
}

// =====================================
// Populate Year Dropdown Filter
// =====================================
function populateYears() {
    const yearSelect = document.getElementById("year-select");
    if (!yearSelect) return;
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2020; year--) {
        yearSelect.innerHTML += `<option value="${year}">${year}</option>`;
    }
}

// =====================================
// Fetch and Render Transactions Table
// =====================================
async function loadTransactions() {
    try {
        const response = await fetch('/transactions');
        const transactions = await response.json();
        
        const categoryFilter = document.getElementById("category-filter")?.value || "";
        const searchText = document.getElementById("search-input")?.value.toLowerCase() || "";
        const sortValue = document.getElementById("sort-select")?.value || "";
        const typeFilter = document.getElementById("type-filter")?.value || "";
        
        const transactionCount = document.getElementById("transaction-count");
        if (transactionCount) transactionCount.innerText = transactions.length;

        const container = document.getElementById('transaction-list');
        container.innerHTML = '';

        const recentActivity = document.getElementById("recent-activity");
        if (recentActivity) recentActivity.innerHTML = "";

        let totalIncome = 0;
        let totalExpense = 0;
        let highestIncome = 0;
        let highestExpense = 0;
        let totalAmount = 0;
        let categoryTotals = {};

        const selectedYear = document.getElementById('year-select')?.value || '';
        const selectedMonth = document.getElementById('month-select')?.value || '';
        
        let filteredTransactions = transactions.filter(transaction => {
            const matchesSearch = transaction.description.toLowerCase().includes(searchText);
            const matchesType = typeFilter === "" || transaction.transaction_type === typeFilter;
            const matchesCategory = categoryFilter === "" || transaction.category_name === categoryFilter;
            return (matchesSearch && matchesType && matchesCategory);
        });

        if (sortValue === "amount-desc") filteredTransactions.sort((a, b) => b.amount - a.amount);
        if (sortValue === "amount-asc") filteredTransactions.sort((a, b) => a.amount - b.amount);
        if (sortValue === "date-desc") filteredTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
        if (sortValue === "date-asc") filteredTransactions.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

        if(filteredTransactions && filteredTransactions.length === 0){
            container.innerHTML = `<tr><td colspan="6" style="text-align:center;">No Transactions Found</td></tr>`;
        }

        filteredTransactions.forEach(transaction => {
            if (recentActivity && recentActivity.children.length < 5) {
                recentActivity.innerHTML += `<li>${transaction.description} - ₹${transaction.amount}</li>`;
            }

            const date = new Date(transaction.transaction_date);
            const year = date.getFullYear().toString();
            const month = String(date.getMonth() + 1).padStart(2, '0');

            if ((selectedYear === '' || selectedYear === year) && (selectedMonth === '' || selectedMonth === month)) {
                if (transaction.transaction_type === "Income") {
                    totalIncome += parseFloat(transaction.amount);
                } else {
                    totalExpense += parseFloat(transaction.amount);
                }
                totalAmount +=
                parseFloat(
                transaction.amount);
                if (transaction.transaction_type === "Income") {
                    highestIncome =Math.max(highestIncome,parseFloat(transaction.amount ) );
                }

                if (transaction.transaction_type=== "Expense") {
                    highestExpense =Math.max( highestExpense, parseFloat(transaction.amount));
                }
                const category = transaction.category_name ||"Unknown";
                  if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                  }
                categoryTotals[category] +=parseFloat(transaction.amount);

                // ✨ FIX: category_name ko safely pass kiya jaa raha hai
                container.innerHTML += `
                    <tr>
                        <td>${transaction.transaction_id}</td>
                        <td>${transaction.transaction_date}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.transaction_type}</td>
                        <td>₹${transaction.amount}</td>
                        <td>
                            <button onclick="editTransaction(${transaction.transaction_id}, '${transaction.description}', ${transaction.amount})">Edit</button>
                            <button onclick="deleteTransaction(${transaction.transaction_id}, '${transaction.description}', ${transaction.amount}, '${transaction.category_name}', '${transaction.transaction_type}', '${transaction.transaction_date}')">Delete</button>
                        </td>
                    </tr>
                `;
            }
        });

        document.getElementById("total-income").innerText = `₹${totalIncome.toFixed(2)}`;
        document.getElementById("total-expense").innerText = `₹${totalExpense.toFixed(2)}`;
        // =====================================
// DAY 17 STATISTICS
// =====================================

const savings =
    totalIncome -
    totalExpense;

const averageAmount =

    filteredTransactions.length > 0

    ?

    totalAmount /
    filteredTransactions.length

    :

    0;

document
.getElementById(
    "stat-income"
)
.innerText =
`₹${totalIncome.toFixed(2)}`;

document
.getElementById(
    "stat-expense"
)
.innerText =
`₹${totalExpense.toFixed(2)}`;

document
.getElementById(
    "stat-savings"
)
.innerText =
`₹${savings.toFixed(2)}`;

document
.getElementById(
    "stat-transactions"
)
.innerText =
filteredTransactions.length;

document
.getElementById(
    "highest-income"
)
.innerText =
`₹${highestIncome.toFixed(2)}`;

document
.getElementById(
    "highest-expense"
)
.innerText =
`₹${highestExpense.toFixed(2)}`;

document
.getElementById(
    "average-amount"
)
.innerText =
`₹${averageAmount.toFixed(2)}`;
let topCategory =
    "-";

let topAmount =
    0;

for (
    const category
    in categoryTotals
) {

    if (
        categoryTotals[
            category
        ] > topAmount
    ) {

        topAmount =
            categoryTotals[
                category
            ];

        topCategory =
            category;
    }
}

document
.getElementById(
    "top-category"
)
.innerText =
topCategory;

        try {
            const budget = await loadBudget();
            const remaining = budget - totalExpense;
            const percentUsed = (totalExpense / budget) * 100;
            const progressBar = document.getElementById("budget-progress");

            if (progressBar && budget > 0) {
                progressBar.style.width = `${percentUsed}%`;
                if (percentUsed < 70) progressBar.style.background = "green";
                else if (percentUsed < 90) progressBar.style.background = "orange";
                else progressBar.style.background = "red";
            }
            
            document.getElementById('remaining-budget').innerText = `₹${remaining.toFixed(2)}`;
            const warning = document.getElementById('budget-warning');

            if (warning) {
                warning.innerText = (remaining < 0) ? "⚠ Budget Exceeded" : "";
            }

        } catch (error) {
            console.error("Budget Calculation Error:", error);
        }

    } catch (error) {
        console.error("Transaction Load Error:", error);
    }
}

// =====================================
// Add New Transaction Handling
// =====================================
const form = document.getElementById("transaction-form");
if (form) {
    form.addEventListener("submit", async function(event) {
        event.preventDefault();

        const transaction = {
            category_id: parseInt(document.getElementById("category_id").value),
            amount: parseFloat(document.getElementById("amount").value),
            transaction_type: document.getElementById("transaction_type").value,
            description: document.getElementById("description").value,
            transaction_date: document.getElementById("transaction_date").value
        };

        try {
            await fetch("/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(transaction)
            });

            form.reset();
            loadTransactions();
            loadCategoryChart();
            loadMonthlyChart();
        } catch (error) {
            console.error("Add Transaction Error:", error);
        }
    });
}

// =====================================
// Delete Transaction Function
// =====================================
async function deleteTransaction(id, description, amount, category_name, transaction_type, transaction_date) {
    const confirmDelete = confirm("Delete this transaction?");
    if (!confirmDelete) return;

    try {
        deletedTransactions.push({
            transaction_id: id,
            description: description,
            amount: amount,
            category_name: category_name,
            transaction_type: transaction_type,
            transaction_date: transaction_date
        });

        redoTransactions = [];

        await fetch(`/transactions/${id}`, { method: "DELETE" });

        loadTransactions();
        loadCategoryChart();
        loadMonthlyChart();
    } catch (error) {
        console.error("Delete Error:", error);
    }
}

// =====================================
// Undo Delete Action (FIXED)
// =====================================
async function undoDelete() {
    if (deletedTransactions.length === 0) {
        alert("Nothing to undo!");
        return;
    }

    const transactionToRestore = deletedTransactions.pop();

    // ✨ FIX: Global array se real category_id dhoondh raha hai taaki backend crash na ho
    const matchedCategory = globalCategories.find(c => c.category_name === transactionToRestore.category_name);
    const resolvedCategoryId = matchedCategory ? matchedCategory.category_id : (globalCategories[0]?.category_id || 1);

    const safePayload = {
        category_id: parseInt(resolvedCategoryId),
        amount: parseFloat(transactionToRestore.amount),
        transaction_type: transactionToRestore.transaction_type,
        description: transactionToRestore.description,
        transaction_date: transactionToRestore.transaction_date
    };

    try {
        await fetch("/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(safePayload)
        });

        redoTransactions = [];

        loadTransactions();
        loadCategoryChart();
        loadMonthlyChart();
    } catch (error) {
        console.error("Undo Error:", error);
    }
}

// =====================================
// Redo Delete Action
// =====================================
async function redoDelete() {
    if (redoTransactions.length === 0) {
        alert("Nothing to redo!");
        return;
    }

    const transactionToDelete = redoTransactions.pop();

    try {
        await fetch(`/transactions/${transactionToDelete.transaction_id}`, { method: "DELETE" });

        deletedTransactions.push(transactionToDelete);

        loadTransactions();
        loadCategoryChart();
        loadMonthlyChart();
    } catch (error) {
        console.error("Redo Error:", error);
    }
}

// =====================================
// Modify Existing Entry inline
// =====================================
async function editTransaction(id, oldDescription, oldAmount) {
    const newDescription = prompt("Edit Description", oldDescription);
    const newAmount = prompt("Edit Amount", oldAmount);

    if (newDescription === null || newAmount === null) return;

    try {
        await fetch(`/transactions/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                description: newDescription,
                amount: parseFloat(newAmount)
            })
        });

        loadTransactions();
        loadCategoryChart();
        loadMonthlyChart();
    } catch (error) {
        console.error("Edit Error:", error);
    }
}

// =====================================
// Analytics Chart.js Interactivity
// =====================================
async function loadCategoryChart() {
    try {
        const response = await fetch('/analytics/categories');
        const data = await response.json();
        const labels = data.map(item => item.category_name);
        const totals = data.map(item => item.total);
        const canvas = document.getElementById('categoryChart');

        if (!canvas) return;
        if (categoryChart) categoryChart.destroy();

        categoryChart = new Chart(canvas, {
            type: 'pie',
            data: { labels: labels, datasets: [{ data: totals }] }
        });
    } catch (error) {
        console.error("Chart Error:", error);
    }
}

async function loadMonthlyChart() {
    try {
        const response = await fetch('/analytics/monthly');
        const data = await response.json();
        const labels = data.map(item => item.month);
        const totals = data.map(item => item.total);
        const canvas = document.getElementById('monthlyChart');

        if (!canvas) return;
        if (monthlyChart) monthlyChart.destroy();

        monthlyChart = new Chart(canvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{ label: 'Monthly Expenses', data: totals, tension: 0.3 }]
            }
        });
    } catch (error) {
        console.error("Monthly Chart Error:", error);
    }
}

// =====================================
// Obtain Initial Budget Setup Value
// =====================================
async function loadBudget() {
    try {
        const response = await fetch('/budget');
        const budget = await response.json();
        return parseFloat(budget.monthly_limit);
    } catch (error) {
        console.error("Budget Error:", error);
        return 0;
    }
}

// =====================================
// Export Actions
// =====================================
function exportCSV() { window.location.href = "/export/csv"; }
function exportPDF() { window.location.href = "/export/pdf"; }

// =====================================
// Auto-Run Input Listeners & Reset Actions
// =====================================
document.getElementById("search-input")?.addEventListener("keyup", loadTransactions);
document.getElementById("sort-select")?.addEventListener("change", loadTransactions);
document.getElementById("type-filter")?.addEventListener("change", loadTransactions);
document.getElementById("category-filter")?.addEventListener("change", loadTransactions);

document.getElementById("reset-filters")?.addEventListener("click", () => {
    document.getElementById("search-input").value = "";
    document.getElementById("sort-select").value = "";
    document.getElementById("type-filter").value = "";
    document.getElementById("category-filter").value = "";
    loadTransactions();
});

// =====================================
// Orchestration / Initialization
// =====================================
populateYears();
loadCategories();
loadTransactions();
loadCategoryChart();
loadMonthlyChart();