# Migration: Create tbl_notifications
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_create_tbl_notification_types'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('patient_cip', models.CharField(blank=True, help_text='CIP del paciente', max_length=50, null=True)),
                ('priority', models.CharField(choices=[('low', 'Baja'), ('normal', 'Normal'), ('high', 'Alta'), ('urgent', 'Urgente')], default='normal', max_length=10)),
                ('ticket_status', models.CharField(choices=[('pending', 'Pendiente'), ('in_progress', 'En Proceso'), ('resolved', 'Resuelto'), ('closed', 'Cerrado'), ('cancelled', 'Cancelado')], default='pending', max_length=20)),
                ('message', models.TextField(help_text='Mensaje inicial de la notificación')),
                ('attachment', models.CharField(blank=True, help_text='Ruta de imagen adjunta', max_length=255, null=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('assigned_to', models.ForeignKey(blank=True, help_text='Usuario asignado (médico o farmacéutico)', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_notifications', to=settings.AUTH_USER_MODEL)),
                ('created_by', models.ForeignKey(help_text='Usuario que crea la notificación (médico o farmacéutico)', on_delete=django.db.models.deletion.PROTECT, related_name='created_notifications', to=settings.AUTH_USER_MODEL)),
                ('notification_type', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='notifications', to='core.notificationtype')),
                ('pharmacy', models.ForeignKey(help_text='Farmacia destinataria', on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='core.pharmacy')),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='notifications', to='core.commonstatus')),
            ],
            options={
                'verbose_name': 'Notificación/Ticket',
                'verbose_name_plural': 'Notificaciones/Tickets',
                'db_table': 'tbl_notifications',
                'ordering': ['-created_at'],
                'app_label': 'core',
            },
        ),
    ]
