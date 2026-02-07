"""
Model: tbl_prescriptions
Recetas médicas creadas por doctores
"""
from django.db import models
from django.utils import timezone
from .CommonStatus import CommonStatus
from .User import User
from .Pharmacy import Pharmacy


class Prescription(models.Model):
    """Recetas médicas - solo doctores pueden crear/editar"""
    
    PRESCRIPTION_STATUS_CHOICES = [
        ('draft', 'Borrador'),
        ('active', 'Activa'),
        ('dispensed', 'Dispensada'),
        ('expired', 'Caducada'),
        ('cancelled', 'Cancelada'),
    ]

    id = models.AutoField(primary_key=True)
    
    # Doctor que crea la receta
    doctor = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='prescriptions_created',
        help_text="Médico que crea la receta"
    )
    
    # Farmacia destino (opcional - puede no tener farmacia asignada)
    pharmacy = models.ForeignKey(
        Pharmacy,
        on_delete=models.SET_NULL,
        related_name='prescriptions',
        null=True,
        blank=True,
        help_text="Farmacia destinataria (opcional)"
    )
    
    # Datos del paciente
    patient_cip = models.CharField(max_length=50, help_text="CIP del paciente")
    patient_name = models.CharField(max_length=255, blank=True, null=True, help_text="Nombre del paciente")
    patient_birth_date = models.DateField(null=True, blank=True, help_text="Fecha de nacimiento")
    
    # Datos de la receta
    medication = models.CharField(max_length=255, help_text="Medicamento recetado")
    dosage = models.CharField(max_length=100, blank=True, null=True, help_text="Posología")
    quantity = models.PositiveIntegerField(default=1, help_text="Cantidad")
    instructions = models.TextField(blank=True, null=True, help_text="Instrucciones de uso")
    
    # Fechas
    issue_date = models.DateField(default=timezone.now, help_text="Fecha de emisión")
    expiry_date = models.DateField(null=True, blank=True, help_text="Fecha de caducidad")
    
    # Estado de la receta
    prescription_status = models.CharField(
        max_length=20, 
        choices=PRESCRIPTION_STATUS_CHOICES, 
        default='active'
    )
    
    # Notas adicionales
    notes = models.TextField(blank=True, null=True, help_text="Notas adicionales")
    
    # Imagen adjunta en base64
    image_base64 = models.TextField(blank=True, null=True, help_text="Imagen de la receta en base64")
    
    # Trazabilidad
    dispensed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='prescriptions_dispensed',
        null=True,
        blank=True,
        help_text="Farmacéutico que dispensó"
    )
    dispensed_at = models.DateTimeField(null=True, blank=True)
    
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='prescriptions',
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_prescriptions'
        verbose_name = 'Receta'
        verbose_name_plural = 'Recetas'
        ordering = ['-created_at']
        app_label = 'core'

    def __str__(self):
        return f"Receta #{self.id} - {self.patient_cip} - {self.medication}"
    
    def is_expired(self):
        """Verificar si la receta ha caducado"""
        if self.expiry_date:
            return timezone.now().date() > self.expiry_date
        return False
    
    def mark_as_dispensed(self, pharmacist):
        """Marcar como dispensada por un farmacéutico"""
        self.prescription_status = 'dispensed'
        self.dispensed_by = pharmacist
        self.dispensed_at = timezone.now()
        self.save(update_fields=['prescription_status', 'dispensed_by', 'dispensed_at'])
