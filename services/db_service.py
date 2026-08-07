"""
Database Service

Responsible for creating MySQL connections.
"""

import mysql.connector
from config import Config


def get_connection():
    """
    Create and return a MySQL connection.
    Credentials come from environment variables (.env) via config.py.

    Returns:
        mysql.connector.connection
    """

    connection = mysql.connector.connect(
        host=Config.DB_HOST,
        user=Config.DB_USER,
        password=Config.DB_PASSWORD,
        database=Config.DB_NAME
    )

    return connection
