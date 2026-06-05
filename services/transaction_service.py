from services.db_service import get_connection


def get_all_transactions():

    conn = get_connection()

    cursor = conn.cursor(dictionary=True)

    query = """
    SELECT
        transaction_id,
        user_id,
        category_id,
        amount,
        transaction_type,
        description,
        transaction_date
    FROM transactions
    """

    cursor.execute(query)

    transactions = cursor.fetchall()

    cursor.close()
    conn.close()

    return transactions


def add_transaction(
    user_id,
    category_id,
    amount,
    transaction_type,
    description,
    transaction_date
):
    """
    Insert a new transaction into database.
    """

    conn = get_connection()

    cursor = conn.cursor()

    query = """
    INSERT INTO transactions
    (
        user_id,
        category_id,
        amount,
        transaction_type,
        description,
        transaction_date
    )
    VALUES
    (%s, %s, %s, %s, %s, %s)
    """

    cursor.execute(
        query,
        (
            user_id,
            category_id,
            amount,
            transaction_type,
            description,
            transaction_date
        )
    )

    conn.commit()

    cursor.close()
    conn.close()