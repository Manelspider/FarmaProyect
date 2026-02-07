"""
LEGACY FILE - Admin ahora en app/Http/Admin.py
Mantiene compatibilidad con Django
"""
from django.contrib import admin
from app.Models import (
	CommonStatus, UserRole, User, UserData,
	Pharmacy, PharmacyData, PharmacyUser,
	NotificationType, Notification, NotificationMessage
)

# Registro básico para evitar caída del admin
admin.site.register(CommonStatus)
admin.site.register(UserRole)
admin.site.register(User)
admin.site.register(UserData)
admin.site.register(Pharmacy)
admin.site.register(PharmacyData)
admin.site.register(PharmacyUser)
admin.site.register(NotificationType)
admin.site.register(Notification)
admin.site.register(NotificationMessage)

# Django busca automáticamente admin.py en las apps registradas
# Este archivo mantiene compatibilidad importando todo desde la nueva ubicación
