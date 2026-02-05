from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import StatusViewSet, health

router = DefaultRouter()
router.register(r'status', StatusViewSet, basename='status')

urlpatterns = [
    path('health/', health, name='health'),
] + router.urls
