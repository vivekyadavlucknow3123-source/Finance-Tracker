from database.database.db_connection import get_connection


def get_budget():

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    query = """
    SELECT *
    FROM budgets
    ORDER BY budget_id DESC
    LIMIT 1
    """

    cursor.execute(query)

    result = cursor.fetchone()

    cursor.close()
    conn.close()

    return result