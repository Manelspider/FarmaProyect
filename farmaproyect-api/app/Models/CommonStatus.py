"""
Model: tbl_common_status
Estados comunes del sistema
"""
from django.db import models


class CommonStatus(models.Model):
    """Estados comunes del sistema"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_common_status'
        verbose_name = 'Estado Común'
        verbose_name_plural = 'Estados Comunes'
        app_label = 'core'

    def __str__(self):
        return self.name
