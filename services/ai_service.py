from decimal import Decimal  # <-- Added to handle secure financial math precision
from services.db_service import get_connection


def get_ai_insights(user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Total Expense
    cursor.execute(
        """
        SELECT 
            SUM(amount) AS total_expense 
        FROM transactions 
        WHERE user_id = %s 
        AND transaction_type = 'Expense'
        """,
        (user_id,),
    )
    expense_result = cursor.fetchone()
    total_expense = (
        expense_result["total_expense"]
        if expense_result and expense_result["total_expense"]
        else 0
    )

    # Total Income
    cursor.execute(
        """
        SELECT 
            SUM(amount) AS total_income 
        FROM transactions 
        WHERE user_id = %s 
        AND transaction_type = 'Income'
        """,
        (user_id,),
    )
    income_result = cursor.fetchone()
    total_income = income_result["total_income"] or 0

    # Top Category
    cursor.execute(
        """
        SELECT 
            c.category_name, 
            SUM(t.amount) AS total 
        FROM transactions t
        JOIN categories c 
        ON t.category_id = c.category_id 
        WHERE t.user_id = %s 
        AND t.transaction_type = 'Expense'
        GROUP BY c.category_name 
        ORDER BY total DESC 
        LIMIT 1
        """,
        (user_id,),
    )
    top_category = cursor.fetchone()

    cursor.close()
    conn.close()

    return {
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "top_category": (
            top_category["category_name"] if top_category else "None"
        ),
        "message": (
            f"You spend most on {top_category['category_name']}"
            if top_category
            else "No transaction data found."
        ),
    }


def get_budget_recommendations(user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Expense
    cursor.execute(
        """
        SELECT 
            SUM(amount) AS total_expense 
        FROM transactions 
        WHERE user_id=%s 
        AND transaction_type='Expense'
        """,
        (user_id,),
    )
    expense_result = cursor.fetchone()
    total_expense = expense_result["total_expense"] or 0

    # Budget
    cursor.execute(
        """
        SELECT 
            monthly_limit 
        FROM budgets 
        WHERE user_id=%s 
        ORDER BY budget_id DESC 
        LIMIT 1
        """,
        (user_id,),
    )
    budget_result = cursor.fetchone()
    budget = (
        budget_result["monthly_limit"]
        if budget_result and budget_result["monthly_limit"]
        else 0
    )

    cursor.close()
    conn.close()

    recommendations = []

    # --- Updated Section with Safe Decimal Math ---
    if budget == 0:
        recommendations.append("Set a budget first.")
    else:
        percentage = (total_expense / budget) * 100

        if percentage >= 100:
            recommendations.append("Budget exceeded.")
        elif percentage >= 80:
            recommendations.append("You have used more than 80% of your budget.")
        else:
            recommendations.append("Budget usage is healthy.")

        # Bonus savings evaluation
        savings = budget - total_expense
        # FIX: Comparing and multiplying Decimal with a Decimal string literal
        if savings < (budget * Decimal('0.10')):
            recommendations.append("Try to save at least 10% of your budget.")
    # ------------------------------------------

    return {
        "budget": float(budget),
        "expense": float(total_expense),
        "recommendations": recommendations,
    }


def get_financial_health_score(user_id):
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    # Income
    cursor.execute(
        """
        SELECT 
            SUM(amount) AS total_income 
        FROM transactions 
        WHERE user_id=%s 
        AND transaction_type='Income'
        """,
        (user_id,)
    )
    income_result = cursor.fetchone()
    income = income_result["total_income"] or 0

    # Expense
    cursor.execute(
        """
        SELECT 
            SUM(amount) AS total_expense 
        FROM transactions 
        WHERE user_id=%s 
        AND transaction_type='Expense'
        """,
        (user_id,)
    )
    expense_result = cursor.fetchone()
    expense = expense_result["total_expense"] or 0

    cursor.close()
    conn.close()

    if income == 0:
        return {
            "score": 0,
            "status": "No Data"
        }

    # FIX: Cast values to float to prevent Decimal/Float calculation crash down here
    savings = float(income) - float(expense)
    savings_rate = (savings / float(income)) * 100

    score = min(100, max(0, savings_rate))

    if score >= 71:
        status = "Excellent"
    elif score >= 41:
        status = "Average"
    else:
        status = "Poor"

    return {
        "score": round(score),
        "status": status
    }
def get_monthly_report(
    user_id
):

    insights = get_ai_insights(
        user_id
    )

    health = (
        get_financial_health_score(
            user_id
        )
    )

    recommendations = (
        get_budget_recommendations(
            user_id
        )
    )

    savings = (
        insights[
            "total_income"
        ]
        -
        insights[
            "total_expense"
        ]
    )

    return {

        "income":
        insights[
            "total_income"
        ],

        "expense":
        insights[
            "total_expense"
        ],

        "savings":
        savings,

        "top_category":
        insights[
            "top_category"
        ],

        "health_score":
        health[
            "score"
        ],

        "health_status":
        health[
            "status"
        ],

        "recommendations":
        recommendations[
            "recommendations"
        ]

    }
def get_ai_dashboard(
    user_id
):

    return {

        "insights":
        get_ai_insights(
            user_id
        ),

        "health":
        get_financial_health_score(
            user_id
        ),

        "recommendations":
        get_budget_recommendations(
            user_id
        ),

        "report":
        get_monthly_report(
            user_id
        )
    }
def get_expense_forecast(
    user_id
):

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    cursor.execute(
        """
        SELECT
        AVG(month_total)
        AS forecast

        FROM
        (
            SELECT
            MONTH(transaction_date)
            AS month_num,

            SUM(amount)
            AS month_total

            FROM transactions

            WHERE user_id=%s

            AND transaction_type=
            'Expense'

            GROUP BY
            MONTH(transaction_date)

        ) monthly_expenses
        """,

        (user_id,)
    )

    result = (
        cursor.fetchone()
    )

    cursor.close()

    conn.close()

    forecast = (
        result["forecast"]
        or 0
    )

    return {

        "forecast":
        round(
            float(
                forecast
            ),
            2
        )

    }
def get_smart_alerts(
    user_id
):

    insights = (
        get_ai_insights(
            user_id
        )
    )

    alerts = []

    income = (
        insights[
            "total_income"
        ]
    )

    expense = (
        insights[
            "total_expense"
        ]
    )

    # Expense > Income

    if expense > income:

        alerts.append(
            "⚠ Expenses exceed income."
        )

    # Savings

    savings = (
        income -
        expense
    )

    if income > 0:

        savings_rate = (
            savings /
            income
        ) * 100

        if savings_rate < 10:

            alerts.append(
                "⚠ Savings below 10%."
            )

    # Budget Check

    recommendations = (
        get_budget_recommendations(
            user_id
        )
    )

    if (
        "Budget exceeded."
        in
        recommendations[
            "recommendations"
        ]
    ):

        alerts.append(
            "⚠ Budget exceeded."
        )

    if len(alerts) == 0:

        alerts.append(
            "✅ No financial risks detected."
        )

    return {

        "alerts":
        alerts

    }