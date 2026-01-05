import shutil
import sqlite3
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / 'db.sqlite3'
BACKUP = DB.with_suffix('.sqlite3.bak')
print('DB:', DB)
print('Backup:', BACKUP)
shutil.copy2(DB, BACKUP)
print('Backup created')
conn = sqlite3.connect(DB)
cur = conn.cursor()
print('\nExisting chat migrations:')
for row in cur.execute("SELECT id, app, name FROM django_migrations WHERE app='chat'"):
    print(row)

print('\nDeleting chat migration records from django_migrations...')
cur.execute("DELETE FROM django_migrations WHERE app='chat'")

print('Dropping table chat_conversation if exists...')
try:
    cur.execute('DROP TABLE IF EXISTS chat_conversation')
    cur.execute('DROP TABLE IF EXISTS chat_message')
    cur.execute('DROP TABLE IF EXISTS chat_conversation_participants')
    conn.commit()
    print('Dropped table (if existed) and committed')
except Exception as e:
    print('Error dropping table:', e)
finally:
    conn.close()
print('Done')
