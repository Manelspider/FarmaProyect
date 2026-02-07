"""
Serializers para API REST
Laravel-style organization
"""
from rest_framework import serializers
from app.Models import (
    CommonStatus, UserRole, User, UserData,
    Pharmacy, PharmacyData, PharmacyUser,
    NotificationType, Notification, NotificationMessage
)


class CommonStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommonStatus
        fields = ['id', 'name', 'created_at', 'updated_at']


class UserRoleSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'name', 'description', 'status', 'status_name', 'created_at', 'updated_at']


class UserDataSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='status.name', read_only=True)
    full_name = serializers.CharField(read_only=True)

    class Meta:
        model = UserData
        fields = [
            'id', 'first_name', 'last_name', 'phone', 'address',
            'city', 'country', 'avatar', 'status', 'status_name',
            'full_name', 'created_at', 'updated_at'
        ]


class UserSerializer(serializers.ModelSerializer):
    data = UserDataSerializer(read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'password', 'role', 'role_name',
            'status', 'status_name', 'last_login', 'data',
            'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class UserListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados"""
    first_name = serializers.CharField(source='data.first_name', read_only=True)
    last_name = serializers.CharField(source='data.last_name', read_only=True)
    full_name = serializers.CharField(source='data.full_name', read_only=True)
    phone = serializers.CharField(source='data.phone', read_only=True)
    city = serializers.CharField(source='data.city', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    role_id = serializers.IntegerField(source='role.id', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name', 'phone', 'city', 'role_id', 'role_name', 'last_login']


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class AuthResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    token = serializers.CharField()
    message = serializers.CharField()


# ============================================================================
# PHARMACY SERIALIZERS
# ============================================================================

class PharmacyDataSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = PharmacyData
        fields = [
            'id', 'name', 'logo', 'address', 'city', 'state', 'postal_code',
            'country', 'phone', 'email', 'license_number',
            'latitude', 'longitude',
            'status', 'status_name', 'created_at', 'updated_at'
        ]


class PharmacyListSerializer(serializers.ModelSerializer):
    """Serializer ligero para listados/select"""
    name = serializers.CharField(source='data.name', read_only=True)
    address = serializers.CharField(source='data.address', read_only=True)
    city = serializers.CharField(source='data.city', read_only=True)
    postal_code = serializers.CharField(source='data.postal_code', read_only=True)
    phone = serializers.CharField(source='data.phone', read_only=True)
    email = serializers.CharField(source='data.email', read_only=True)
    logo = serializers.CharField(source='data.logo', read_only=True)
    latitude = serializers.DecimalField(source='data.latitude', max_digits=10, decimal_places=7, read_only=True)
    longitude = serializers.DecimalField(source='data.longitude', max_digits=10, decimal_places=7, read_only=True)

    class Meta:
        model = Pharmacy
        fields = ['id', 'code', 'name', 'address', 'city', 'postal_code', 'phone', 'email', 'logo', 'latitude', 'longitude']


class PharmacySerializer(serializers.ModelSerializer):
    data = PharmacyDataSerializer(read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = Pharmacy
        fields = ['id', 'code', 'status', 'status_name', 'data', 'created_at', 'updated_at']


class PharmacyUserSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.data.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = PharmacyUser
        fields = [
            'id', 'pharmacy', 'pharmacy_name', 'user', 'user_email',
            'user_name', 'is_manager', 'status', 'status_name',
            'created_at', 'updated_at'
        ]


# ============================================================================
# NOTIFICATION SYSTEM SERIALIZERS
# ============================================================================

class NotificationTypeSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = NotificationType
        fields = ['id', 'name', 'description', 'icon', 'color', 'status', 'status_name', 'created_at', 'updated_at']


class NotificationMessageSerializer(serializers.ModelSerializer):
    sender_email = serializers.EmailField(source='sender.email', read_only=True)
    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)

    class Meta:
        model = NotificationMessage
        fields = [
            'id', 'notification', 'sender', 'sender_email', 'sender_name',
            'message', 'attachment', 'is_internal', 'status', 'status_name',
            'created_at', 'updated_at'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    notification_type_name = serializers.CharField(source='notification_type.name', read_only=True)
    notification_type_icon = serializers.CharField(source='notification_type.icon', read_only=True)
    notification_type_color = serializers.CharField(source='notification_type.color', read_only=True)
    pharmacy_name = serializers.CharField(source='pharmacy.data.name', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    assigned_to_email = serializers.EmailField(source='assigned_to.email', read_only=True, allow_null=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True, allow_null=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    messages = NotificationMessageSerializer(many=True, read_only=True)
    messages_count = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'notification_type', 'notification_type_name', 
            'notification_type_icon', 'notification_type_color',
            'pharmacy', 'pharmacy_name', 'created_by', 'created_by_email',
            'created_by_name', 'assigned_to', 'assigned_to_email', 'assigned_to_name',
            'title', 'patient_cip', 'priority', 'ticket_status', 'message',
            'attachment', 'status', 'status_name', 'messages', 'messages_count',
            'resolved_at', 'created_at', 'updated_at'
        ]
    
    def get_messages_count(self, obj):
        return obj.messages.count()


class NotificationCreateSerializer(serializers.ModelSerializer):
    """Serializer para crear notificaciones"""
    
    class Meta:
        model = Notification
        fields = [
            'notification_type', 'pharmacy', 'title', 'patient_cip',
            'priority', 'message', 'attachment'
        ]
    
    def create(self, validated_data):
        # El created_by se establece desde la vista con request.user
        return super().create(validated_data)
