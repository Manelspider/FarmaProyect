# Migration: Create tbl_pharmacy_data
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0005_create_tbl_pharmacy'),
    ]

    operations = [
        migrations.CreateModel(
            name='PharmacyData',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=200)),
                ('address', models.TextField()),
                ('city', models.CharField(max_length=100)),
                ('state', models.CharField(blank=True, max_length=100, null=True)),
                ('postal_code', models.CharField(max_length=20)),
                ('country', models.CharField(default='España', max_length=100)),
                ('phone', models.CharField(max_length=20)),
                ('email', models.EmailField(blank=True, max_length=254, null=True)),
                ('license_number', models.CharField(help_text='Número de licencia', max_length=100, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('pharmacy', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='data', to='core.pharmacy')),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='pharmacy_data', to='core.commonstatus')),
            ],
            options={
                'verbose_name': 'Datos de Farmacia',
                'verbose_name_plural': 'Datos de Farmacias',
                'db_table': 'tbl_pharmacy_data',
                'app_label': 'core',
            },
        ),
    ]
