"""
Model: tbl_user_data
Datos adicionales del usuario
"""
from django.db import models
from .CommonStatus import CommonStatus
from .User import User


class UserData(models.Model):
    """Datos adicionales del usuario"""
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='data'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    avatar = models.CharField(max_length=255, blank=True, null=True)
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='user_data',
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_user_data'
        verbose_name = 'Datos de Usuario'
        verbose_name_plural = 'Datos de Usuarios'
        app_label = 'core'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
