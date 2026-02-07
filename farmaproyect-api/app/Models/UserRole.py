"""
Model: tbl_user_roles
Roles de usuario del sistema
"""
from django.db import models
from .CommonStatus import CommonStatus


class UserRole(models.Model):
    """Roles de usuario"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='user_roles',
        default=1
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_user_roles'
        verbose_name = 'Rol de Usuario'
        verbose_name_plural = 'Roles de Usuario'
        app_label = 'core'

    def __str__(self):
        return self.name
