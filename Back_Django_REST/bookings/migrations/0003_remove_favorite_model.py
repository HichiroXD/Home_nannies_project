from django.db import migrations, connection


def forwards(apps, schema_editor):
    """Drop the legacy bookings_favorite table."""
    with connection.cursor() as cursor:
        cursor.execute("""
            DROP TABLE IF EXISTS bookings_favorite CASCADE;
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
