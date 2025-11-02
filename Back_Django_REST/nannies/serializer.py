from rest_framework import serializers
from users.models import User  # ✅ importar modelo


class NannyProfileSerializer(serializers.ModelSerializer):
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'reviews']

    def get_reviews(self, obj):
        from reviews.serializer import ReviewSerializer  # ✅ Importación local (evita el bucle)
        reviews = obj.reviews_received.all()
        return ReviewSerializer(reviews, many=True).data
