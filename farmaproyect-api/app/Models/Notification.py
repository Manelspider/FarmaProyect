"""
Model: tbl_notifications
Notificaciones/Tickets entre médicos y farmacias
"""
from django.db import models
from django.utils import timezone
from .CommonStatus import CommonStatus
from .NotificationType import NotificationType
from .Pharmacy import Pharmacy
from .User import User


class Notification(models.Model):
    """Notificaciones/Tickets entre médicos y farmacias"""
    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('normal', 'Normal'),
        ('high', 'Alta'),
        ('urgent', 'Urgente'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pendiente'),
        ('in_progress', 'En Proceso'),
        ('resolved', 'Resuelto'),
        ('closed', 'Cerrado'),
        ('cancelled', 'Cancelado'),
    ]

    id = models.AutoField(primary_key=True)
    notification_type = models.ForeignKey(
        NotificationType,
        on_delete=models.PROTECT,
        related_name='notifications'
    )
    pharmacy = models.ForeignKey(
        Pharmacy,
        on_delete=models.CASCADE,
        related_name='notifications',
        help_text="Farmacia destinataria"
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_notifications',
        help_text="Usuario que crea la notificación (médico o farmacéutico)"
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='assigned_notifications',
        null=True,
        blank=True,
        help_text="Usuario asignado (médico o farmacéutico)"
    )
    
    title = models.CharField(max_length=255)
    patient_cip = models.CharField(max_length=50, blank=True, null=True, help_text="CIP del paciente")
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    ticket_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Campos de la notificación
    message = models.TextField(help_text="Mensaje inicial de la notificación")
    attachment = models.CharField(max_length=255, blank=True, null=True, help_text="Ruta de imagen adjunta")
    
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='notifications',
        default=1
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_notifications'
        verbose_name = 'Notificación/Ticket'
        verbose_name_plural = 'Notificaciones/Tickets'
        ordering = ['-created_at']
        app_label = 'core'

    def __str__(self):
        return f"#{self.id} - {self.title}"
    
    def mark_as_resolved(self):
        """Marcar como resuelto"""
        self.ticket_status = 'resolved'
        self.resolved_at = timezone.now()
        self.save(update_fields=['ticket_status', 'resolved_at'])
