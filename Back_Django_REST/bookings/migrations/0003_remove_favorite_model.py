from django.db import migrations, connection


def forwards(apps, schema_editor):
    """Drop the legacy bookings_favorite table."""
    db_engine = connection.settings_dict.get('ENGINE', '')
    
    with connection.cursor() as cursor:
        if 'postgresql' in db_engine:
            cursor.execute("""
                DROP TABLE IF EXISTS bookings_favorite CASCADE;
            """)
        else:
            # SQLite doesn't support CASCADE
            cursor.execute("""
                DROP TABLE IF EXISTS bookings_favorite;
            """)


def backwards(apps, schema_editor):
    # No reverse migration
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0002_migrate_favorites'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
