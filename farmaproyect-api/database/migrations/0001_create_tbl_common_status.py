# Migration: Create tbl_common_status
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='CommonStatus',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'verbose_name': 'Estado Común',
                'verbose_name_plural': 'Estados Comunes',
                'db_table': 'tbl_common_status',
                'app_label': 'core',
            },
        ),
    ]
