from rest_framework import serializers
from .models import ParentProfile


class ParentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ParentProfile
        fields = [
            'id', 'username', 'email', 'full_name',
            'phone', 'address', 'emergency_contact',
            'children_count', 'preferences',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_full_name(self, obj):
        return obj.user.get_full_name() or obj.user.username
