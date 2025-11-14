from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0002_migrate_favorites'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Favorite',
        ),
    ]
