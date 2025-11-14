"""
Migration to copy favorites from bookings.Favorite table to favorites.Favorite table.
"""
from django.db import migrations


def forwards(apps, schema_editor):
    BookingsFavorite = apps.get_model('bookings', 'Favorite')
    FavoritesFavorite = apps.get_model('favorites', 'Favorite')
    NannyProfile = apps.get_model('nannies', 'NannyProfile')
    User = apps.get_model('users', 'User')

    # Iterate over existing bookings.Favorite rows and create corresponding favorites.Favorite
    for bf in BookingsFavorite.objects.all():
        try:
            parent = User.objects.get(pk=bf.parent_id)
        except User.DoesNotExist:
            continue

        # bookings.Favorite.nanny previously referenced a User; find corresponding NannyProfile
        try:
            nanny_profile = NannyProfile.objects.get(user_id=bf.nanny_id)
        except NannyProfile.DoesNotExist:
            # skip mapping if nanny has no profile
            continue

        # Avoid duplicates
        if not FavoritesFavorite.objects.filter(parent_id=parent.id, nanny_id=nanny_profile.id).exists():
            FavoritesFavorite.objects.create(
                parent_id=parent.id,
                nanny_id=nanny_profile.id,
                created_at=bf.created_at if hasattr(bf, 'created_at') else None
            )


def backwards(apps, schema_editor):
    # No reverse migration (data copy only)
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0001_initial'),
        ('favorites', '0001_initial'),
        ('nannies', '0001_initial'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
