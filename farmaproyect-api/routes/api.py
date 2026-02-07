"""
API Routes
Laravel-style routes organization
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from app.Http.Controllers.ApiController import StatusViewSet, health
from app.Http.Controllers.AuthController import (
    login, 
    logout, 
    me, 
    change_password, 
    refresh_token,
    verify_token
)
from app.Http.Controllers.PharmacyController import (
    list_pharmacies,
    get_pharmacy,
    my_pharmacies,
    create_pharmacy,
    update_pharmacy,
    delete_pharmacy
)
from app.Http.Controllers.UserController import (
    list_users,
    get_user,
    create_user,
    update_user,
    delete_user,
    list_roles
)
from app.Http.Controllers.NotificationController import (
    list_notifications,
    get_notification,
    create_notification,
    update_notification,
    delete_notification,
    add_message,
    list_notification_types,
    list_doctors,
    my_notifications
)
from app.Http.Controllers.PrescriptionController import (
    list_prescriptions,
    get_prescription,
    create_prescription,
    update_prescription,
    delete_prescription,
    dispense_prescription,
    send_to_pharmacy
)

router = DefaultRouter()
router.register(r'status', StatusViewSet, basename='status')

urlpatterns = [
    path('health/', health, name='health'),
    # Auth
    path('auth/login', login, name='auth_login'),
    path('auth/logout', logout, name='auth_logout'),
    path('auth/me', me, name='auth_me'),
    path('auth/change-password', change_password, name='auth_change_password'),
    path('auth/refresh', refresh_token, name='auth_refresh_token'),
    path('auth/verify', verify_token, name='auth_verify_token'),
    # Pharmacies
    path('pharmacies', list_pharmacies, name='pharmacies_list'),
    path('pharmacies/create', create_pharmacy, name='pharmacies_create'),
    path('pharmacies/my', my_pharmacies, name='pharmacies_my'),
    path('pharmacies/<int:pk>', get_pharmacy, name='pharmacies_detail'),
    path('pharmacies/<int:pk>/update', update_pharmacy, name='pharmacies_update'),
    path('pharmacies/<int:pk>/delete', delete_pharmacy, name='pharmacies_delete'),
    # Users
    path('users', list_users, name='users_list'),
    path('users/roles', list_roles, name='users_roles'),
    path('users/create', create_user, name='users_create'),
    path('users/<int:pk>', get_user, name='users_detail'),
    path('users/<int:pk>/update', update_user, name='users_update'),
    path('users/<int:pk>/delete', delete_user, name='users_delete'),
    # Notifications
    path('notifications', list_notifications, name='notifications_list'),
    path('notifications/my', my_notifications, name='notifications_my'),
    path('notifications/types', list_notification_types, name='notifications_types'),
    path('notifications/doctors', list_doctors, name='notifications_doctors'),
    path('notifications/create', create_notification, name='notifications_create'),
    path('notifications/<int:pk>', get_notification, name='notifications_detail'),
    path('notifications/<int:pk>/update', update_notification, name='notifications_update'),
    path('notifications/<int:pk>/delete', delete_notification, name='notifications_delete'),
    path('notifications/<int:pk>/message', add_message, name='notifications_add_message'),
    # Prescriptions
    path('prescriptions', list_prescriptions, name='prescriptions_list'),
    path('prescriptions/create', create_prescription, name='prescriptions_create'),
    path('prescriptions/<int:pk>', get_prescription, name='prescriptions_detail'),
    path('prescriptions/<int:pk>/update', update_prescription, name='prescriptions_update'),
    path('prescriptions/<int:pk>/delete', delete_prescription, name='prescriptions_delete'),
    path('prescriptions/<int:pk>/dispense', dispense_prescription, name='prescriptions_dispense'),
    path('prescriptions/<int:pk>/send', send_to_pharmacy, name='prescriptions_send'),
] + router.urls
