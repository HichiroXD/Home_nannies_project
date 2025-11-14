"""
Migration to copy favorites from bookings.Favorite table to favorites.Favorite table using raw SQL.
"""
from django.db import migrations, connection


def forwards(apps, schema_editor):
    """Copy favorites from bookings_favorite to favorites_favorite using raw SQL."""
    with connection.cursor() as cursor:
        # Check if bookings_favorite table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'bookings_favorite'
            );
        """)
        table_exists = cursor.fetchone()[0]
        
        if not table_exists:
            # No legacy data, skip
            return
        
        # Copy data from bookings_favorite to favorites_favorite
        # Map bookings.Favorite.nanny (User) -> favorites.Favorite.nanny (NannyProfile)
        cursor.execute("""
            INSERT INTO favorites_favorite (parent_id, nanny_id, created_at)
            SELECT 
                bf.parent_id,
                np.id,
                bf.created_at
            FROM bookings_favorite bf
            INNER JOIN nannies_nannyprofile np ON np.user_id = bf.nanny_id
            WHERE NOT EXISTS (
                SELECT 1 FROM favorites_favorite ff
                WHERE ff.parent_id = bf.parent_id 
                AND ff.nanny_id = np.id
            )
            ON CONFLICT DO NOTHING;
        """)


def backwards(apps, schema_editor):
    # No reverse migration (data copy only)
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0001_initial'),
        ('favorites', '0001_initial'),
        ('nannies', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
