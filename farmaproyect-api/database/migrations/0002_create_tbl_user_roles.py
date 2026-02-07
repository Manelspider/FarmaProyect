# Migration: Create tbl_user_roles
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_create_tbl_common_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserRole',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='user_roles', to='core.commonstatus')),
            ],
            options={
                'verbose_name': 'Rol de Usuario',
                'verbose_name_plural': 'Roles de Usuario',
                'db_table': 'tbl_user_roles',
                'app_label': 'core',
            },
        ),
    ]
