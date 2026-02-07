"""
Model: tbl_pharmacy_data
Datos de la farmacia
"""
from django.db import models
from .CommonStatus import CommonStatus
from .Pharmacy import Pharmacy


class PharmacyData(models.Model):
    """Datos de la farmacia"""
    id = models.AutoField(primary_key=True)
    pharmacy = models.OneToOneField(
        Pharmacy,
        on_delete=models.CASCADE,
        related_name='data'
    )
    name = models.CharField(max_length=200)
    logo = models.CharField(max_length=500, blank=True, null=True, help_text="URL del logo")
    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='España')
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)
    license_number = models.CharField(max_length=100, unique=True, help_text="Número de licencia")
    latitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    longitude = models.DecimalField(max_digits=10, decimal_places=7, blank=True, null=True)
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='pharmacy_data',
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_pharmacy_data'
        verbose_name = 'Datos de Farmacia'
        verbose_name_plural = 'Datos de Farmacias'
        app_label = 'core'

    def __str__(self):
        return self.name
