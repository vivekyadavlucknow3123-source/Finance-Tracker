"""
Database Service

Responsible for creating MySQL connections.
"""

import mysql.connector


def get_connection():
    """
    Create and return a MySQL connection.

    Returns:
        mysql.connector.connection
    """

    connection = mysql.connector.connect(
        host="localhost",
        user="root",# Change this to your MySQL database username
        password="root",# Change this to your MySQL database password
        database="finance_tracker"
    )

    return connection