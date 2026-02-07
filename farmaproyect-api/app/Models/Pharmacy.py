"""
Model: tbl_pharmacy
Farmacia
"""
from django.db import models
from .CommonStatus import CommonStatus


class Pharmacy(models.Model):
    """Farmacia"""
    id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=50, unique=True, help_text="Código único de la farmacia")
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='pharmacies',
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_pharmacy'
        verbose_name = 'Farmacia'
        verbose_name_plural = 'Farmacias'
        app_label = 'core'

    def __str__(self):
        try:
            return f"{self.data.name} ({self.code})"
        except Exception:
            return self.code
