"""
Model: tbl_notification_types
Tipos de notificaciones/tickets
"""
from django.db import models
from .CommonStatus import CommonStatus


class NotificationType(models.Model):
    """Tipos de notificaciones/tickets"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    icon = models.CharField(max_length=50, blank=True, null=True, help_text="Nombre del ícono")
    color = models.CharField(max_length=7, default='#6c757d', help_text="Color hex")
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='notification_types',
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_notification_types'
        verbose_name = 'Tipo de Notificación'
        verbose_name_plural = 'Tipos de Notificaciones'
        app_label = 'core'

    def __str__(self):
        return self.name
