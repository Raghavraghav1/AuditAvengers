import mysql.connector
import os

# Use keyword arguments instead of full URL
conn = mysql.connector.connect(
    host="interchange.proxy.rlwy.net",
    port=20639,
    user="root",
    password="nwPKmzXjMQOHkjlaGLndEYiCwXuOOBTa",
    database="railway"
)

print("Database connected...")

cursor = conn.cursor(dictionary=True)


folder = r"C:\Users\user\Music\OneDrive\Documents\dumps"
print("Files in folder:", os.listdir(folder))

with open(r"C:\Users\user\PycharmProjects\flaskApp\Dump20250527\audittracker_audit_details.sql", "r") as f:

    sql = f.read()
    for statement in sql.split(';'):
        if statement.strip():
            cursor.execute(statement)

conn.commit()
cursor.close()
conn.close()

print("Import completed.")
