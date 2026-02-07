# Migration: Create tbl_user_data
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_create_tbl_users'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserData',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=100)),
                ('last_name', models.CharField(max_length=100)),
                ('phone', models.CharField(blank=True, max_length=20, null=True)),
                ('address', models.TextField(blank=True, null=True)),
                ('city', models.CharField(blank=True, max_length=100, null=True)),
                ('country', models.CharField(blank=True, max_length=100, null=True)),
                ('avatar', models.CharField(blank=True, max_length=255, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='user_data', to='core.commonstatus')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='data', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Datos de Usuario',
                'verbose_name_plural': 'Datos de Usuarios',
                'db_table': 'tbl_user_data',
                'app_label': 'core',
            },
        ),
    ]
