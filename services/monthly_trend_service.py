from database.database.db_connection import get_connection


def get_monthly_expenses(user_id):

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    query = """
SELECT
DATE_FORMAT(
transaction_date,
'%Y-%m'
) AS month,

SUM(amount) AS total

FROM transactions

WHERE transaction_type='Expense'
AND user_id=%s

GROUP BY month

ORDER BY month
"""

    cursor.execute(query, (user_id,))

    result =cursor.fetchall()

    cursor.close()

    conn.close()

    return result