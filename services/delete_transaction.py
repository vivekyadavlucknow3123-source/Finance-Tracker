"""
Delete Transaction Service
"""

from database.database.db_connection import get_connection


def delete_transaction(transaction_id):
    """
    Delete a transaction by ID.
    """

    conn = get_connection()

    cursor = conn.cursor()

    query = """
    DELETE FROM transactions
    WHERE transaction_id = %s
    """

    cursor.execute(query, (transaction_id,))

    conn.commit()

    cursor.close()
    conn.close()

    print("✅ Transaction Deleted Successfully")