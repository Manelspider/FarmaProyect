# Migration: Create tbl_notification_messages
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0009_create_tbl_notifications'),
    ]

    operations = [
        migrations.CreateModel(
            name='NotificationMessage',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('message', models.TextField()),
                ('attachment', models.CharField(blank=True, help_text='Ruta de archivo adjunto', max_length=255, null=True)),
                ('is_internal', models.BooleanField(default=False, help_text='Nota interna (solo visible para farmacia)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('notification', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='core.notification')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='notification_messages', to=settings.AUTH_USER_MODEL)),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='notification_messages', to='core.commonstatus')),
            ],
            options={
                'verbose_name': 'Mensaje de Notificación',
                'verbose_name_plural': 'Mensajes de Notificaciones',
                'db_table': 'tbl_notification_messages',
                'ordering': ['created_at'],
                'app_label': 'core',
            },
        ),
    ]
