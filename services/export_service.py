"""
=========================================
Export Service
Day 11
=========================================

Purpose:
Export all transactions into CSV format.
"""

import csv


def export_transactions_to_csv(
    transactions,
    file_path
):
    """
    Create CSV file from transactions.
    """

    with open(
        file_path,
        mode="w",
        newline="",
        encoding="utf-8"
    ) as file:

        writer = csv.writer(file)

        # CSV Header

        writer.writerow([
            "Transaction ID",
            "User ID",
            "Category ID",
            "Amount",
            "Type",
            "Description",
            "Date"
        ])

        # CSV Data

        for transaction in transactions:

            writer.writerow([
                transaction["transaction_id"],
                transaction["user_id"],
                transaction["category_id"],
                transaction["amount"],
                transaction["transaction_type"],
                transaction["description"],
                transaction["transaction_date"]
            ])

    return file_path