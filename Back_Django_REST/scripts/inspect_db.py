import sqlite3
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / 'db.sqlite3'
print('DB path:', DB)
conn = sqlite3.connect(DB)
cur = conn.cursor()
print('\nTables:')
for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table'"):
    print('-', row[0])

print('\nColumns for chat_conversation:')
for row in cur.execute("PRAGMA table_info('chat_conversation')"):
    print(row)

conn.close()
