"""
NotificationTypeSeeder
Seeds the tbl_notification_types table
"""
from database.seeders.seeder import Seeder
from core.models import NotificationType, CommonStatus


class NotificationTypeSeeder(Seeder):
    """Seed notification types"""
    
    def run(self):
        """Execute the seeder"""
        active_status = CommonStatus.objects.get(id=1)
        
        notification_types = [
            {
                'name': 'Incidencia de Medicamento',
                'description': 'Notificar incidencias sobre un medicamento prescrito',
                'icon': 'pill',
                'color': '#dc3545'
            },
            {
                'name': 'Receta Caducada',
                'description': 'Notificar que la receta del paciente se le ha caducado',
                'icon': 'file-clock',
                'color': '#fd7e14'
            },
            {
                'name': 'Mensaje de Urgencia',
                'description': 'Enviar mensaje de urgencia',
                'icon': 'alert-triangle',
                'color': '#ffc107'
            },
            {
                'name': 'Consulta General',
                'description': 'Consulta general sobre medicación',
                'icon': 'message-circle',
                'color': '#17a2b8'
            },
            {
                'name': 'Solicitud de Información',
                'description': 'Solicitud de información adicional',
                'icon': 'info-circle',
                'color': '#6c757d'
            },
        ]
        
        created_count = 0
        for type_data in notification_types:
            notification_type, created = NotificationType.objects.get_or_create(
                name=type_data['name'],
                defaults={
                    'description': type_data['description'],
                    'icon': type_data['icon'],
                    'color': type_data['color'],
                    'status': active_status
                }
            )
            if created:
                created_count += 1
        
        print(f"  ✓ Created {created_count} notification types (total: {len(notification_types)})")
