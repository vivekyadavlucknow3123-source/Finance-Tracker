// =====================================
// PART 4 — Success Notifications Function
// =====================================
function showMessage(message) {
    alert(message);
}

// =====================================
// UNDO / REDO HISTORY STACKS & CACHE
// =====================================
let deletedTransactions = [];
let redoTransactions = [];
let globalCategories = []; // ✨ FIX: Global array categories ki sahi ID dhoondhne ke liye

let categoryChart = null;
let monthlyChart = null;

// =====================================
// Step 6: Load AI Insight
// =====================================
async function loadAIInsights() {
    try {
        const response = await fetch("/ai/insights");
        const data = await response.json();
        const aiInsightEl = document.getElementById("aiInsight");
        if (aiInsightEl) {
            aiInsightEl.innerText = data.message;
        }
    } catch (error) {
        console.error("AI Insights Load Error:", error);
    }
}

// =====================================
// Load Categories Dropdowns
// =====================================
async function loadCategories() {
    try {
        const response = await fetch('/categories');
        globalCategories = await response.json(); 
        
        const dropdown = document.getElementById('category_id');
        if (dropdown) dropdown.innerHTML = '';

        const categoryFilter = document.getElementById("category-filter");
        if(categoryFilter) {
            categoryFilter.innerHTML = `<option value="">All Categories</option>`;
        }

        globalCategories.forEach(category => {
            if(categoryFilter){
                categoryFilter.innerHTML += `<option value="${category.category_name}">${category.category_name}</option>`;
            }
            if (dropdown) {
                dropdown.innerHTML += `<option value="${category.category_id}">${category.category_name}</option>`;
            }
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
    // PART 7 — Show Loading Indicator
    const loadingIndicator = document.getElementById("loading");
    if (loadingIndicator) {
        loadingIndicator.style.display = "block";
    }

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
        if (container) container.innerHTML = '';

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

        if (filteredTransactions.length === 0) {
            if (container) {
                container.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center;">
                        No transactions found. Add your first transaction.
                    </td>
                </tr>
                `;
            }
            // PART 7 — Hide Loading Indicator before early return
            if (loadingIndicator) loadingIndicator.style.display = "none";
            return;
        }

        if (sortValue === "amount-desc") filteredTransactions.sort((a, b) => b.amount - a.amount);
        if (sortValue === "amount-asc") filteredTransactions.sort((a, b) => a.amount - b.amount);
        if (sortValue === "date-desc") filteredTransactions.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));
        if (sortValue === "date-asc") filteredTransactions.sort((a, b) => new Date(a.transaction_date) - new Date(b.transaction_date));

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
                totalAmount += parseFloat(transaction.amount);
                
                if (transaction.transaction_type === "Income") {
                    highestIncome = Math.max(highestIncome, parseFloat(transaction.amount));
                }

                if (transaction.transaction_type === "Expense") {
                    highestExpense = Math.max(highestExpense, parseFloat(transaction.amount));
                }
                const category = transaction.category_name || "Unknown";
                if (!categoryTotals[category]) {
                    categoryTotals[category] = 0;
                }
                categoryTotals[category] += parseFloat(transaction.amount);

                if (container) {
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
            }
        });

        const incomeEl = document.getElementById("total-income");
        const expenseEl = document.getElementById("total-expense");
        if (incomeEl) incomeEl.innerText = `₹${totalIncome.toFixed(2)}`;
        if (expenseEl) expenseEl.innerText = `₹${totalExpense.toFixed(2)}`;
        
        // =====================================
        // DAY 17 STATISTICS
        // =====================================
        const savings = totalIncome - totalExpense;
        const averageAmount = filteredTransactions.length > 0 ? totalAmount / filteredTransactions.length : 0;

        const statInc = document.getElementById("stat-income");
        const statExp = document.getElementById("stat-expense");
        const statSav = document.getElementById("stat-savings");
        const statCount = document.getElementById("stat-transactions");
        const highInc = document.getElementById("highest-income");
        const highExp = document.getElementById("highest-expense");
        const avgAmt = document.getElementById("average-amount");
        const topCat = document.getElementById("top-category");

        if (statInc) statInc.innerText = `₹${totalIncome.toFixed(2)}`;
        if (statExp) statExp.innerText = `₹${totalExpense.toFixed(2)}`;
        if (statSav) statSav.innerText = `₹${savings.toFixed(2)}`;
        if (statCount) statCount.innerText = filteredTransactions.length;
        if (highInc) highInc.innerText = `₹${highestIncome.toFixed(2)}`;
        if (highExp) highExp.innerText = `₹${highestExpense.toFixed(2)}`;
        if (avgAmt) avgAmt.innerText = `₹${averageAmount.toFixed(2)}`;
        
        let topCategory = "-";
        let topAmount = 0;

        for (const category in categoryTotals) {
            if (categoryTotals[category] > topAmount) {
                topAmount = categoryTotals[category];
                topCategory = category;
            }
        }

        if (topCat) topCat.innerText = topCategory;

        try {
            const budget = await loadBudget();
            const remaining = budget - totalExpense;
            let budgetUsage = 0;
            if (budget > 0) {
                budgetUsage = (totalExpense / budget) * 100;
            }
            
            const statusElement = document.getElementById("budget-status");
            const alertElement = document.getElementById("budget-alert");
            const percentUsed = (totalExpense / budget) * 100;
            const progressBar = document.getElementById("budget-progress");
            
            // =====================================
            // PART 2 — Better Budget Empty State
            // =====================================
            if (alertElement) {
                if (budget === 0) {
                    alertElement.innerHTML = `No budget configured. Create a budget to start tracking spending.`;
                } else if (budgetUsage < 50) {
                    if (statusElement) statusElement.innerText = "Safe Zone";
                    alertElement.innerHTML = `✅ Great! Your spending is under control.`;
                    alertElement.style.background = "#d4edda";
                } else if (budgetUsage >= 50 && budgetUsage < 80) {
                    if (statusElement) statusElement.innerText = "Warning Zone";
                    alertElement.innerHTML = `⚠ You have used ${budgetUsage.toFixed(0)}% of your budget.`;
                    alertElement.style.background = "#fff3cd";
                } else if (budgetUsage >= 80 && budgetUsage <= 100) {
                    if (statusElement) statusElement.innerText = "Critical Zone";
                    alertElement.innerHTML = `🚨 Budget almost exhausted. ${budgetUsage.toFixed(0)}% used.`;
                    alertElement.style.background = "#f8d7da";
                } else {
                    if (statusElement) statusElement.innerText = "Budget Exceeded";
                    alertElement.innerHTML = `❌ Budget exceeded. Overspent by ₹${Math.abs(remaining).toFixed(2)}`;
                    alertElement.style.background = "#dc3545";
                    alertElement.style.color = "white";
                }
            }
            
            if (progressBar && budget > 0) {
                progressBar.style.width = `${percentUsed}%`;
                if (percentUsed < 70) progressBar.style.background = "green";
                else if (percentUsed < 90) progressBar.style.background = "orange";
                else progressBar.style.background = "red";
            }
            
            const remainingBudgetEl = document.getElementById('remaining-budget');
            if (remainingBudgetEl) remainingBudgetEl.innerText = `₹${remaining.toFixed(2)}`;
            
            const warning = document.getElementById('budget-warning');
            if (warning) {
                warning.innerText = (remaining < 0) ? "⚠ Budget Exceeded" : "";
            }

        } catch (error) {
            console.error("Budget Calculation Error:", error);
        }

    } catch (error) {
        console.error("Transaction Load Error:", error);
    } finally {
        // PART 7 — Hide Loading Indicator safely
        if (loadingIndicator) {
            loadingIndicator.style.display = "none";
        }
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

            // PART 4 — Transaction Added Notification
            showMessage("Transaction Added Successfully");

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
    // PART 3 — Delete Confirmation Check
    const confirmed = confirm("Delete this transaction?");
    if (!confirmed) {
        return;
    }

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

        // PART 4 — Transaction Deleted Notification
        showMessage("Transaction Deleted Successfully");

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

        // PART 4 — Transaction Updated Notification
        showMessage("Transaction Updated Successfully");

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
    const searchInp = document.getElementById("search-input");
    const sortSel = document.getElementById("sort-select");
    const typeFilt = document.getElementById("type-filter");
    const catFilt = document.getElementById("category-filter");

    if (searchInp) searchInp.value = "";
    if (sortSel) sortSel.value = "";
    if (typeFilt) typeFilt.value = "";
    if (catFilt) catFilt.value = "";
    loadTransactions();
});

/* ✨ CRITICAL ERROR FIX: Added conditional existence check loops down here */
const budgetType = document.getElementById("budgetType");
const budgetInput = document.getElementById("budgetInput");

if (budgetType && budgetInput) {
    budgetType.addEventListener("change", () => {
        if(budgetType.value === "income"){
            budgetInput.style.display = "none";
        } else {
            budgetInput.style.display = "block";
        }
    });
}

const saveBudgetBtn = document.getElementById("saveBudgetBtn");
if (saveBudgetBtn) {
    saveBudgetBtn.addEventListener("click", saveBudget);
}

async function saveBudget(){
    const budgetTypeEl = document.getElementById("budgetType");
    const budgetInputEl = document.getElementById("budgetInput");

    if (!budgetTypeEl || !budgetInputEl) return;

    const budgetTypeValue = budgetTypeEl.value;
    const monthlyLimit = budgetInputEl.value;

    console.log("Budget = ", monthlyLimit);

    try {
        await fetch("/budget", {
            method:"POST",
            headers:{
                "Content-Type": "application/json"
            },
            body:JSON.stringify({
                budget_type: budgetTypeValue,
                monthly_limit: monthlyLimit
            })
        });
        alert("Budget Saved");
    } catch(error) {
        console.error("Save Budget Error:", error);
    }
}

// =====================================
// ✨ FIXED: Secure DOM checking functions
// =====================================
async function loadBudgetAdvice() {
    try {
        const response = await fetch("/ai/recommendations");
        const data = await response.json();
        const adviceElement = document.getElementById("budgetAdvice");

        // FIX: Ensure the element exists before trying to modify innerText
        if (adviceElement) {
            if (data.recommendations && data.recommendations.length > 0) {
                adviceElement.innerText = data.recommendations[0];
            } else {
                adviceElement.innerText = "No advice calculated yet.";
            }
        }
    } catch (error) {
        console.error("Budget Advice Load Error:", error);
    }
}

async function loadHealthScore() {
    try {
        const response = await fetch("/ai/health");
        const data = await response.json();

        const scoreElement = document.getElementById("healthScore");
        const statusElement = document.getElementById("healthStatus");

        // FIX: Safe multi-element verification checks
        if (scoreElement) {
            scoreElement.innerText = data.score;
        }
        if (statusElement) {
            statusElement.innerText = data.status;
        }
    } catch (error) {
        console.error("Health Score Load Error:", error);
    }
}
async function
loadMonthlyReport(){

    const response =

    await fetch(
        "/ai/report"
    );

    const data =

    await response.json();

    document
    .getElementById(
        "monthlyReport"
    )
    .innerHTML =

    `
    Income:
    ₹${data.income}
    <br>

    Expense:
    ₹${data.expense}
    <br>

    Savings:
    ₹${data.savings}
    <br>

    Top Category:
    ${data.top_category}
    <br>

    Health Score:
    ${data.health_score}
    <br>

    Status:
    ${data.health_status}
    `;
}
async function
loadAIDashboard(){

    const response =

    await fetch(
        "/ai/dashboard"
    );

    const data =

    await response.json();

    document
    .getElementById(
        "healthScore"
    )
    .innerText =

    data.health.score;

    document
    .getElementById(
        "healthStatus"
    )
    .innerText =

    data.health.status;

    document
    .getElementById(
        "aiInsight"
    )
    .innerText =

    data.insights.message;

    document
    .getElementById(
        "budgetAdvice"
    )
    .innerText =

    data.recommendations
        .recommendations
        .join(
            " | "
        );

}
async function
sendMessage(){

    const message =

    document
    .getElementById(
        "chatInput"
    )
    .value;

    const response =

    await fetch(

        "/ai/chat",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                message

            })

        }

    );

    const data =

    await response.json();

    document
    .getElementById(
        "chatResponse"
    )
    .innerText =

    data.reply;

}
async function
loadForecast(){

    const response =

    await fetch(
        "/ai/forecast"
    );

    const data =

    await response.json();

    document
    .getElementById(
        "forecastAmount"
    )
    .innerText =

    "₹" +
    data.forecast;

}
async function
loadAlerts(){

    const response =

    await fetch(
        "/ai/alerts"
    );

    const data =

    await response.json();

    document
    .getElementById(
        "smartAlerts"
    )
    .innerHTML =

    data.alerts
    .map(
        alert =>
        `<p>${alert}</p>`
    )
    .join("");

}

async function
forgotPassword(){

    const email =

    document
    .getElementById(
        "resetEmail"
    )
    .value;

    const response =

    await fetch(

        "/forgot-password",

        {

            method:"POST",

            headers:{

                "Content-Type":
                "application/json"

            },

            body:JSON.stringify({

                email

            })

        }

    );

    const data =

    await response.json();

    alert(
        data.message
    );
}

// =====================================
// Step 7: Call It On Page Load
// Orchestration / Initialization
// =====================================
document.addEventListener("DOMContentLoaded", () => {
    populateYears();
    loadCategories();
    loadTransactions();
    loadCategoryChart();
    loadMonthlyChart();
    loadAIInsights();
    loadBudgetAdvice();
    loadHealthScore();
    loadMonthlyReport();
    loadAIDashboard();
    loadForecast();
});
loadAlerts();