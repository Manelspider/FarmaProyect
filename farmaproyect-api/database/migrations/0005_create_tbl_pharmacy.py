# Migration: Create tbl_pharmacy
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_create_tbl_user_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='Pharmacy',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('code', models.CharField(help_text='Código único de la farmacia', max_length=50, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='pharmacies', to='core.commonstatus')),
            ],
            options={
                'verbose_name': 'Farmacia',
                'verbose_name_plural': 'Farmacias',
                'db_table': 'tbl_pharmacy',
                'app_label': 'core',
            },
        ),
    ]
