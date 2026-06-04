import mysql.connector

try:
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="root"
    )

    if connection.is_connected():
        print("✅ Connected Successfully to MySQL!")

except mysql.connector.Error as err:
    print("❌ Error:", err)

finally:
    try:
        connection.close()
        print("Connection closed.")
    except:
        pass