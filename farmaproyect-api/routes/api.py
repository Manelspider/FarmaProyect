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

router = DefaultRouter()
router.register(r'status', StatusViewSet, basename='status')

urlpatterns = [
    path('health/', health, name='health'),
    path('auth/login', login, name='auth_login'),
    path('auth/logout', logout, name='auth_logout'),
    path('auth/me', me, name='auth_me'),
    path('auth/change-password', change_password, name='auth_change_password'),
    path('auth/refresh', refresh_token, name='auth_refresh_token'),
    path('auth/verify', verify_token, name='auth_verify_token'),
] + router.urls
