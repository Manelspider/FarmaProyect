# Generated migration for adding image_base64 fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_add_prescription_model'),
    ]

    operations = [
        # Add image_base64 to prescriptions
        migrations.AddField(
            model_name='prescription',
            name='image_base64',
            field=models.TextField(blank=True, null=True, help_text='Imagen de la receta en base64'),
        ),
        # Add image_base64 to notifications
        migrations.AddField(
            model_name='notification',
            name='image_base64',
            field=models.TextField(blank=True, null=True, help_text='Imagen adjunta en base64'),
        ),
    ]
