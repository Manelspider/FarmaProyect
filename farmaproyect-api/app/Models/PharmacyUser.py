"""
Model: tbl_pharmacy_users
Relación entre farmacéuticos y farmacias (many-to-many)
"""
from django.db import models
from .CommonStatus import CommonStatus
from .Pharmacy import Pharmacy
from .User import User


class PharmacyUser(models.Model):
    """Relación entre farmacéuticos y farmacias (many-to-many)"""
    id = models.AutoField(primary_key=True)
    pharmacy = models.ForeignKey(
        Pharmacy,
        on_delete=models.CASCADE,
        related_name='pharmacy_users'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='user_pharmacies',
        limit_choices_to={'role__name': 'Farmacéutico'}
    )
    is_manager = models.BooleanField(default=False, help_text="Es responsable de la farmacia")
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='pharmacy_users',
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_pharmacy_users'
        verbose_name = 'Farmacéutico-Farmacia'
        verbose_name_plural = 'Farmacéuticos-Farmacias'
        unique_together = ['pharmacy', 'user']
        app_label = 'core'

    def __str__(self):
        return f"{self.user.email} - {self.pharmacy}"
