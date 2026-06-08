// =====================================
// UNDO / REDO STACKS
// =====================================
// ✨ EXPLANATION: These arrays store the history of our actions. 
// When we delete something, it goes into 'deletedTransactions'. 
// If we undo it, it goes into 'redoTransactions'.
let deletedTransactions = [];
let redoTransactions = [];

let categoryChart = null;
let monthlyChart = null;

// =====================================
// Load Categories
// =====================================
async function loadCategories() {
    try {
        const response = await fetch('/categories');
        const categories = await response.json();
        const dropdown = document.getElementById('category_id');
        dropdown.innerHTML = '';

        const categoryFilter = document.getElementById("category-filter");
        if(categoryFilter) {
            categoryFilter.innerHTML = `<option value="">All Categories</option>`;
        }

        categories.forEach(category => {
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
// Populate Year Dropdown
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
// Load Transactions
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

        const selectedYear = document.getElementById('year-select')?.value || '';
        const selectedMonth = document.getElementById('month-select')?.value || '';
        
        // ✨ EXPLANATION: Filtering logic happens FIRST before checking if array is empty
        let filteredTransactions = transactions.filter(transaction => {
            const matchesSearch = transaction.description.toLowerCase().includes(searchText);
            const matchesType = typeFilter === "" || transaction.transaction_type === typeFilter;
            const matchesCategory = categoryFilter === "" || transaction.category_name === categoryFilter;
            return (matchesSearch && matchesType && matchesCategory);
        });

        // SORTING LOGIC
        if (sortValue === "amount-desc") filteredTransactions.sort((a, b) => b.amount - a.amount);
        if (sortValue === "amount-asc") filteredTransactions.sort((a, b) => a.amount - b.amount);
        if (sortValue === "date-desc") filteredTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
        if (sortValue === "date-asc") filteredTransactions.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

        // EMPTY STATE CHECK
        if(filteredTransactions && filteredTransactions.length === 0){
            container.innerHTML = `<tr><td colspan="6">No Transactions Found</td></tr>`;
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

                // ✨ EXPLANATION: We update the Delete button here to pass ALL transaction details to the function. 
                // This gives our undo feature the data it needs to recreate the transaction later.
                container.innerHTML += `
                    <tr>
                        <td>${transaction.transaction_id}</td>
                        <td>${transaction.transaction_date}</td>
                        <td>${transaction.description}</td>
                        <td>${transaction.transaction_type}</td>
                        <td>₹${transaction.amount}</td>
                        <td>
                            <button onclick="editTransaction(${transaction.transaction_id}, '${transaction.description}', ${transaction.amount})">Edit</button>
                            
                            <button onclick="deleteTransaction(${transaction.transaction_id}, '${transaction.description}', ${transaction.amount}, ${transaction.category_id || 1}, '${transaction.transaction_type}', '${transaction.transaction_date}')">
                                Delete
                            </button>
                        </td>
                    </tr>
                `;
            }
        });

        document.getElementById("total-income").innerText = `₹${totalIncome.toFixed(2)}`;
        document.getElementById("total-expense").innerText = `₹${totalExpense.toFixed(2)}`;

        // Budget Calculation
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
// Add Transaction
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
// Delete Transaction (Now saves history!)
// =====================================
// ✨ EXPLANATION: We take all parameters so we can save the complete object.
async function deleteTransaction(id, description, amount, category_id, transaction_type, transaction_date) {
    const confirmDelete = confirm("Delete this transaction?");
    if (!confirmDelete) return;

    try {
        // ✨ EXPLANATION: Push the exact data object to our deleted array BEFORE we delete it from the backend.
        deletedTransactions.push({
            transaction_id: id,
            description: description,
            amount: amount,
            category_id: category_id,
            transaction_type: transaction_type,
            transaction_date: transaction_date
        });

        // Clear redo stack because a new action occurred
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
// Undo Delete
// =====================================
// ✨ EXPLANATION: This takes the last item out of the 'deleted' array and POSTs it back to the database.
async function undoDelete() {
    if (deletedTransactions.length === 0) {
        alert("Nothing to undo!");
        return;
    }

    const transactionToRestore = deletedTransactions.pop();

    try {
        await fetch("/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transactionToRestore)
        });

        // Push it into redo stack so we can delete it again if we want
        redoTransactions.push(transactionToRestore);

        loadTransactions();
        loadCategoryChart();
        loadMonthlyChart();
    } catch (error) {
        console.error("Undo Error:", error);
    }
}

// =====================================
// Redo Delete
// =====================================
// ✨ EXPLANATION: This takes the item we just restored, and deletes it again.
async function redoDelete() {
    if (redoTransactions.length === 0) {
        alert("Nothing to redo!");
        return;
    }

    const transactionToDelete = redoTransactions.pop();

    try {
        await fetch(`/transactions/${transactionToDelete.transaction_id}`, { method: "DELETE" });

        // Push it back to the undo stack
        deletedTransactions.push(transactionToDelete);

        loadTransactions();
        loadCategoryChart();
        loadMonthlyChart();
    } catch (error) {
        console.error("Redo Error:", error);
    }
}

// =====================================
// Edit Transaction
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
// Analytics Charts
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
// Load Budget
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
// Exports
// =====================================
function exportCSV() { window.location.href = "/export/csv"; }
function exportPDF() { window.location.href = "/export/pdf"; }

// =====================================
// AUTO SEARCH & FILTERS
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
// Startup
// =====================================
populateYears();
loadCategories();
loadTransactions();
loadCategoryChart();
loadMonthlyChart();