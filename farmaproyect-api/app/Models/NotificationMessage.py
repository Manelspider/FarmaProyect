"""
Model: tbl_notification_messages
Mensajes/Respuestas dentro de una notificación/ticket
"""
from django.db import models
from .CommonStatus import CommonStatus
from .Notification import Notification
from .User import User


class NotificationMessage(models.Model):
    """Mensajes/Respuestas dentro de una notificación/ticket"""
    id = models.AutoField(primary_key=True)
    notification = models.ForeignKey(
        Notification,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='notification_messages'
    )
    message = models.TextField()
    attachment = models.CharField(max_length=255, blank=True, null=True, help_text="Ruta de archivo adjunto")
    is_internal = models.BooleanField(default=False, help_text="Nota interna (solo visible para farmacia)")
    
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='notification_messages',
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_notification_messages'
        verbose_name = 'Mensaje de Notificación'
        verbose_name_plural = 'Mensajes de Notificaciones'
        ordering = ['created_at']
        app_label = 'core'

    def __str__(self):
        return f"Mensaje de {self.sender.email} en #{self.notification.id}"
