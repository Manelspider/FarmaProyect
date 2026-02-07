"""
Django Admin Configuration
Laravel-style organization
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from app.Models import (
    CommonStatus, UserRole, User, UserData,
    Pharmacy, PharmacyData, PharmacyUser,
    NotificationType, Notification, NotificationMessage
)


class CustomUserCreationForm(UserCreationForm):
    """Formulario para crear usuarios"""
    class Meta:
        model = User
        fields = ('email',)


class CustomUserChangeForm(UserChangeForm):
    """Formulario para editar usuarios"""
    class Meta:
        model = User
        fields = ('email', 'role', 'status', 'is_active', 'is_staff', 'is_superuser')


class UserDataInline(admin.StackedInline):
    """Inline para UserData"""
    model = UserData
    can_delete = False
    verbose_name_plural = 'Datos Personales'
    fk_name = 'user'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin personalizado para User"""
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    
    list_display = ('email', 'get_full_name', 'role', 'status', 'is_staff', 'is_superuser', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role', 'status')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información del Rol', {'fields': ('role', 'status')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'status', 'is_staff', 'is_superuser'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)
    inlines = [UserDataInline]
    
    def get_full_name(self, obj):
        """Mostrar nombre completo"""
        return obj.full_name
    get_full_name.short_description = 'Nombre Completo'


@admin.register(CommonStatus)
class CommonStatusAdmin(admin.ModelAdmin):
    """Admin para CommonStatus"""
    list_display = ('id', 'name', 'created_at', 'updated_at')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """Admin para UserRole"""
    list_display = ('name', 'description', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserData)
class UserDataAdmin(admin.ModelAdmin):
    """Admin para UserData"""
    list_display = ('user', 'first_name', 'last_name', 'phone', 'city', 'country')
    search_fields = ('first_name', 'last_name', 'user__email')
    list_filter = ('status', 'city', 'country')
    readonly_fields = ('created_at', 'updated_at')


# ============================================================================
# PHARMACY ADMIN
# ============================================================================

class PharmacyDataInline(admin.StackedInline):
    """Inline para PharmacyData"""
    model = PharmacyData
    can_delete = False
    verbose_name_plural = 'Datos de la Farmacia'


class PharmacyUserInline(admin.TabularInline):
    """Inline para PharmacyUser"""
    model = PharmacyUser
    extra = 1
    verbose_name_plural = 'Farmacéuticos'


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    """Admin para Pharmacy"""
    list_display = ('code', 'get_name', 'get_city', 'status', 'created_at')
    search_fields = ('code', 'data__name', 'data__city')
    list_filter = ('status', 'data__city')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PharmacyDataInline, PharmacyUserInline]
    
    def get_name(self, obj):
        try:
            return obj.data.name
        except Exception:
            return '-'
    get_name.short_description = 'Nombre'
    
    def get_city(self, obj):
        try:
            return obj.data.city
        except Exception:
            return '-'
    get_city.short_description = 'Ciudad'


@admin.register(PharmacyData)
class PharmacyDataAdmin(admin.ModelAdmin):
    """Admin para PharmacyData"""
    list_display = ('name', 'city', 'phone', 'license_number', 'status')
    search_fields = ('name', 'city', 'license_number')
    list_filter = ('status', 'city', 'country')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PharmacyUser)
class PharmacyUserAdmin(admin.ModelAdmin):
    """Admin para PharmacyUser"""
    list_display = ('user', 'pharmacy', 'is_manager', 'status', 'created_at')
    search_fields = ('user__email', 'pharmacy__data__name')
    list_filter = ('is_manager', 'status')
    readonly_fields = ('created_at', 'updated_at')


# ============================================================================
# NOTIFICATION SYSTEM ADMIN
# ============================================================================

@admin.register(NotificationType)
class NotificationTypeAdmin(admin.ModelAdmin):
    """Admin para NotificationType"""
    list_display = ('name', 'icon', 'color', 'status', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')


class NotificationMessageInline(admin.TabularInline):
    """Inline para NotificationMessage"""
    model = NotificationMessage
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('sender', 'message', 'attachment', 'is_internal', 'created_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin para Notification"""
    list_display = ('id', 'title', 'notification_type', 'pharmacy', 'created_by', 'priority', 'ticket_status', 'created_at')
    search_fields = ('title', 'patient_cip', 'created_by__email')
    list_filter = ('notification_type', 'priority', 'ticket_status', 'status', 'pharmacy')
    readonly_fields = ('created_at', 'updated_at', 'resolved_at')
    inlines = [NotificationMessageInline]
    
    fieldsets = (
        ('Información General', {
            'fields': ('notification_type', 'pharmacy', 'title', 'patient_cip')
        }),
        ('Contenido', {
            'fields': ('message', 'attachment')
        }),
        ('Gestión', {
            'fields': ('created_by', 'assigned_to', 'priority', 'ticket_status', 'status')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at', 'resolved_at')
        }),
    )


@admin.register(NotificationMessage)
class NotificationMessageAdmin(admin.ModelAdmin):
    """Admin para NotificationMessage"""
    list_display = ('notification', 'sender', 'get_message_preview', 'is_internal', 'created_at')
    search_fields = ('message', 'sender__email', 'notification__title')
    list_filter = ('is_internal', 'status', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    get_message_preview.short_description = 'Mensaje'"""
Django Admin Configuration
Laravel-style organization
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from app.Models import (
    CommonStatus, UserRole, User, UserData,
    Pharmacy, PharmacyData, PharmacyUser,
    NotificationType, Notification, NotificationMessage
)


class CustomUserCreationForm(UserCreationForm):
    """Formulario para crear usuarios"""
    class Meta:
        model = User
        fields = ('email',)


class CustomUserChangeForm(UserChangeForm):
    """Formulario para editar usuarios"""
    class Meta:
        model = User
        fields = ('email', 'role', 'status', 'is_active', 'is_staff', 'is_superuser')


class UserDataInline(admin.StackedInline):
    """Inline para UserData"""
    model = UserData
    can_delete = False
    verbose_name_plural = 'Datos Personales'
    fk_name = 'user'


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin personalizado para User"""
    form = CustomUserChangeForm
    add_form = CustomUserCreationForm
    
    list_display = ('email', 'get_full_name', 'role', 'status', 'is_staff', 'is_superuser', 'created_at')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'role', 'status')
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Información del Rol', {'fields': ('role', 'status')}),
        ('Permisos', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Fechas Importantes', {'fields': ('last_login', 'created_at', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2', 'role', 'status', 'is_staff', 'is_superuser'),
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at', 'last_login')
    search_fields = ('email',)
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)
    inlines = [UserDataInline]
    
    def get_full_name(self, obj):
        """Mostrar nombre completo"""
        return obj.full_name
    get_full_name.short_description = 'Nombre Completo'


@admin.register(CommonStatus)
class CommonStatusAdmin(admin.ModelAdmin):
    """Admin para CommonStatus"""
    list_display = ('id', 'name', 'created_at', 'updated_at')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    """Admin para UserRole"""
    list_display = ('name', 'description', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(UserData)
class UserDataAdmin(admin.ModelAdmin):
    """Admin para UserData"""
    list_display = ('user', 'first_name', 'last_name', 'phone', 'city', 'country')
    search_fields = ('first_name', 'last_name', 'user__email')
    list_filter = ('status', 'city', 'country')
    readonly_fields = ('created_at', 'updated_at')


# ============================================================================
# PHARMACY ADMIN
# ============================================================================

class PharmacyDataInline(admin.StackedInline):
    """Inline para PharmacyData"""
    model = PharmacyData
    can_delete = False
    verbose_name_plural = 'Datos de la Farmacia'


class PharmacyUserInline(admin.TabularInline):
    """Inline para PharmacyUser"""
    model = PharmacyUser
    extra = 1
    verbose_name_plural = 'Farmacéuticos'


@admin.register(Pharmacy)
class PharmacyAdmin(admin.ModelAdmin):
    """Admin para Pharmacy"""
    list_display = ('code', 'get_name', 'get_city', 'status', 'created_at')
    search_fields = ('code', 'data__name', 'data__city')
    list_filter = ('status', 'data__city')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PharmacyDataInline, PharmacyUserInline]
    
    def get_name(self, obj):
        try:
            return obj.data.name
        except:
            return '-'
    get_name.short_description = 'Nombre'
    
    def get_city(self, obj):
        try:
            return obj.data.city
        except:
            return '-'
    get_city.short_description = 'Ciudad'


@admin.register(PharmacyData)
class PharmacyDataAdmin(admin.ModelAdmin):
    """Admin para PharmacyData"""
    list_display = ('name', 'city', 'phone', 'license_number', 'status')
    search_fields = ('name', 'city', 'license_number')
    list_filter = ('status', 'city', 'country')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PharmacyUser)
class PharmacyUserAdmin(admin.ModelAdmin):
    """Admin para PharmacyUser"""
    list_display = ('user', 'pharmacy', 'is_manager', 'status', 'created_at')
    search_fields = ('user__email', 'pharmacy__data__name')
    list_filter = ('is_manager', 'status')
    readonly_fields = ('created_at', 'updated_at')


# ============================================================================
# NOTIFICATION SYSTEM ADMIN
# ============================================================================

@admin.register(NotificationType)
class NotificationTypeAdmin(admin.ModelAdmin):
    """Admin para NotificationType"""
    list_display = ('name', 'icon', 'color', 'status', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('status',)
    readonly_fields = ('created_at', 'updated_at')


class NotificationMessageInline(admin.TabularInline):
    """Inline para NotificationMessage"""
    model = NotificationMessage
    extra = 0
    readonly_fields = ('created_at',)
    fields = ('sender', 'message', 'attachment', 'is_internal', 'created_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin para Notification"""
    list_display = ('id', 'title', 'notification_type', 'pharmacy', 'created_by', 'priority', 'ticket_status', 'created_at')
    search_fields = ('title', 'patient_cip', 'created_by__email')
    list_filter = ('notification_type', 'priority', 'ticket_status', 'status', 'pharmacy')
    readonly_fields = ('created_at', 'updated_at', 'resolved_at')
    inlines = [NotificationMessageInline]
    
    fieldsets = (
        ('Información General', {
            'fields': ('notification_type', 'pharmacy', 'title', 'patient_cip')
        }),
        ('Contenido', {
            'fields': ('message', 'attachment')
        }),
        ('Gestión', {
            'fields': ('created_by', 'assigned_to', 'priority', 'ticket_status', 'status')
        }),
        ('Fechas', {
            'fields': ('created_at', 'updated_at', 'resolved_at')
        }),
    )


@admin.register(NotificationMessage)
class NotificationMessageAdmin(admin.ModelAdmin):
    """Admin para NotificationMessage"""
    list_display = ('notification', 'sender', 'get_message_preview', 'is_internal', 'created_at')
    search_fields = ('message', 'sender__email', 'notification__title')
    list_filter = ('is_internal', 'status', 'created_at')
    readonly_fields = ('created_at', 'updated_at')
    
    def get_message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    get_message_preview.short_description = 'Mensaje'


