"""
Model: tbl_users
Usuario principal compatible con Django Admin
"""
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from .CommonStatus import CommonStatus
from .UserRole import UserRole


class UserManager(BaseUserManager):
    """Manager para el modelo User custom"""
    
    def create_user(self, email, password=None, **extra_fields):
        """Crear usuario normal"""
        if not email:
            raise ValueError('El email es obligatorio')
        
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        """Crear superusuario para el admin"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')
        
        # Obtener o crear rol de Administrador
        admin_role, _ = UserRole.objects.get_or_create(
            name='Administrador',
            defaults={'description': 'Rol de administrador del sistema'}
        )
        extra_fields.setdefault('role', admin_role)
        
        # Obtener status activo
        active_status, _ = CommonStatus.objects.get_or_create(
            id=1,
            defaults={'name': 'active'}
        )
        extra_fields.setdefault('status', active_status)
        
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Usuario principal compatible con Django Admin"""
    id = models.AutoField(primary_key=True)
    email = models.EmailField(unique=True, max_length=255)
    role = models.ForeignKey(
        UserRole,
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True
    )
    status = models.ForeignKey(
        CommonStatus,
        on_delete=models.PROTECT,
        related_name='users',
        default=1
    )
    
    # Campos para Django Admin
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'tbl_users'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        app_label = 'core'

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        """Nombre completo del usuario"""
        try:
            return self.data.full_name
        except Exception:
            return self.email

    def get_full_name(self):
        """Obtener nombre completo desde UserData"""
        try:
            return self.data.full_name
        except Exception:
            return self.email

    def get_short_name(self):
        """Obtener nombre corto"""
        try:
            return self.data.first_name
        except Exception:
            return self.email.split('@')[0]
