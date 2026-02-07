# Migration: Create tbl_notification_types
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_create_tbl_pharmacy_users'),
    ]

    operations = [
        migrations.CreateModel(
            name='NotificationType',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('icon', models.CharField(blank=True, help_text='Nombre del ícono', max_length=50, null=True)),
                ('color', models.CharField(default='#6c757d', help_text='Color hex', max_length=7)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='notification_types', to='core.commonstatus')),
            ],
            options={
                'verbose_name': 'Tipo de Notificación',
                'verbose_name_plural': 'Tipos de Notificaciones',
                'db_table': 'tbl_notification_types',
                'app_label': 'core',
            },
        ),
    ]
