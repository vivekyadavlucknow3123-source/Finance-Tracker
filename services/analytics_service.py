"""
Analytics Service
"""

from database.database.db_connection import get_connection


def get_category_totals(user_id):
    """
    Returns total expense amount grouped by category.
    """

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    query = """
SELECT
c.category_name,
SUM(t.amount) AS total
FROM transactions t
JOIN categories c
ON t.category_id = c.category_id
WHERE t.user_id = %s
AND t.transaction_type = 'Expense'
GROUP BY c.category_name
"""

    cursor.execute(
    query,
    (user_id,)
)

    result = cursor.fetchall()

    cursor.close()
    conn.close()

    return result