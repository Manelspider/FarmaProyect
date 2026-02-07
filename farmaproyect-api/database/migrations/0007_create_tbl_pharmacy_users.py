# Migration: Create tbl_pharmacy_users
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_create_tbl_pharmacy_data'),
    ]

    operations = [
        migrations.CreateModel(
            name='PharmacyUser',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('is_manager', models.BooleanField(default=False, help_text='Es responsable de la farmacia')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('pharmacy', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='pharmacy_users', to='core.pharmacy')),
                ('status', models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='pharmacy_users', to='core.commonstatus')),
                ('user', models.ForeignKey(limit_choices_to={'role__name': 'Farmacéutico'}, on_delete=django.db.models.deletion.CASCADE, related_name='user_pharmacies', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Farmacéutico-Farmacia',
                'verbose_name_plural': 'Farmacéuticos-Farmacias',
                'db_table': 'tbl_pharmacy_users',
                'unique_together': {('pharmacy', 'user')},
                'app_label': 'core',
            },
        ),
    ]
