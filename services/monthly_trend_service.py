from database.database.db_connection import get_connection


def get_monthly_expenses():

    conn = get_connection()

    cursor = conn.cursor(
        dictionary=True
    )

    query = """
    SELECT

        MONTH(transaction_date)
        AS month,

        SUM(amount)
        AS total

    FROM transactions

    WHERE
    transaction_type='Expense'

    GROUP BY
    MONTH(transaction_date)

    ORDER BY
    MONTH(transaction_date)
    """

    cursor.execute(query)

    result =cursor.fetchall()

    cursor.close()

    conn.close()

    return result