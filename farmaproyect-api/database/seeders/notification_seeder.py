"""
NotificationSeeder
Seeds the notifications table with sample data
"""
import random
from datetime import timedelta
from django.utils import timezone
from database.seeders.seeder import Seeder
from core.models import Notification, NotificationType, Pharmacy, User, CommonStatus


class NotificationSeeder(Seeder):
    """Seed notifications with sample data"""
    
    def run(self):
        """Execute the seeder"""
        active_status = CommonStatus.objects.get(id=1)
        
        # Get notification types
        notification_types = list(NotificationType.objects.all())
        if not notification_types:
            print("  ⚠ No notification types found, skipping notifications")
            return
        
        # Get pharmacies and doctors
        pharmacies = list(Pharmacy.objects.all())
        doctors = list(User.objects.filter(role__name='Médico'))
        farmaceuticos = list(User.objects.filter(role__name='Farmacéutico'))
        
        if not pharmacies or not doctors:
            print("  ⚠ No pharmacies or doctors found, skipping notifications")
            return
        
        # Sample notification data templates
        notifications_templates = [
            # Incidencia de Medicamento
            {
                'type_name': 'Incidencia de Medicamento',
                'titles': [
                    'Posible interacción medicamentosa',
                    'Reacción adversa reportada',
                    'Error en dosis prescrita',
                    'Medicamento contraindicado',
                    'Problema con principio activo'
                ],
                'messages': [
                    'Se ha detectado una posible interacción entre Omeprazol y Clopidogrel en el paciente.',
                    'El paciente reporta mareos y náuseas tras iniciar tratamiento con Atorvastatina.',
                    'La dosis de Metformina parece exceder el máximo recomendado para pacientes con IR.',
                    'El Ibuprofeno está contraindicado por el historial de úlcera gástrica del paciente.',
                    'Problema de alergia al principio activo del medicamento prescrito.'
                ],
                'priorities': ['high', 'urgent', 'normal', 'high', 'urgent']
            },
            # Receta Caducada
            {
                'type_name': 'Receta Caducada',
                'titles': [
                    'Receta caducada - Renovación necesaria',
                    'Tratamiento crónico sin renovar',
                    'Receta vencida hace 3 días',
                    'Paciente sin medicación crónica',
                    'Urgente: Medicación de hipertensión'
                ],
                'messages': [
                    'La receta del paciente para Enalapril ha caducado. Requiere renovación.',
                    'El tratamiento crónico con Levotiroxina no ha sido renovado desde hace 2 meses.',
                    'La receta de Insulina Lantus caducó hace 3 días. Paciente diabético.',
                    'Paciente crónico sin renovación de Sintrom. Necesita INR.',
                    'Medicación antihipertensiva caducada. Riesgo cardiovascular.'
                ],
                'priorities': ['normal', 'high', 'urgent', 'high', 'urgent']
            },
            # Mensaje de Urgencia
            {
                'type_name': 'Mensaje de Urgencia',
                'titles': [
                    'URGENTE: Retirada de lote',
                    'Alerta sanitaria',
                    'Paciente requiere atención inmediata',
                    'Medicamento retirado del mercado',
                    'Reacción grave reportada'
                ],
                'messages': [
                    'Se ha ordenado la retirada del lote ABC123 de Paracetamol. Verificar stock.',
                    'Alerta de la AEMPS sobre posible contaminación en productos inyectables.',
                    'Paciente con síntomas de sobredosis. Requiere seguimiento inmediato.',
                    'El medicamento Ranitidina ha sido retirado. Contactar pacientes afectados.',
                    'Reacción anafiláctica reportada tras administración de antibiótico.'
                ],
                'priorities': ['urgent', 'urgent', 'urgent', 'high', 'urgent']
            },
            # Consulta General
            {
                'type_name': 'Consulta General',
                'titles': [
                    'Consulta sobre posología',
                    'Duda sobre administración',
                    'Información adicional requerida',
                    'Consulta de compatibilidad',
                    'Pregunta sobre efectos secundarios'
                ],
                'messages': [
                    'Por favor, confirmar la posología correcta de Amoxicilina para niño de 8 años.',
                    'El paciente pregunta si puede tomar el medicamento con el estómago vacío.',
                    'Necesito información sobre la disponibilidad de genérico para Symbicort.',
                    '¿Es compatible tomar Omeprazol junto con suplementos de hierro?',
                    '¿Cuáles son los efectos secundarios más comunes del tratamiento prescrito?'
                ],
                'priorities': ['low', 'normal', 'low', 'normal', 'low']
            },
            # Solicitud de Información
            {
                'type_name': 'Solicitud de Información',
                'titles': [
                    'Solicitud ficha técnica',
                    'Información de disponibilidad',
                    'Datos de principio activo',
                    'Historial farmacológico',
                    'Precio y cobertura'
                ],
                'messages': [
                    'Solicito la ficha técnica del medicamento Humira para revisión.',
                    'Por favor, confirmar disponibilidad de Ventolín en formato inhalador.',
                    'Necesito información detallada sobre el principio activo Adalimumab.',
                    'Solicito historial de dispensaciones del paciente de los últimos 6 meses.',
                    'Información sobre precio y cobertura de la Seguridad Social para Truvada.'
                ],
                'priorities': ['low', 'normal', 'low', 'normal', 'normal']
            }
        ]
        
        # Sample CIPs
        sample_cips = [
            'BBBB12345678', 'AAAA87654321', 'CCCC11112222', 
            'DDDD33334444', 'EEEE55556666', 'FFFF77778888',
            'GGGG99990000', 'HHHH12121212', None, None  # Some without CIP
        ]
        
        # Status options
        statuses = ['pending', 'in_progress', 'resolved', 'closed', 'cancelled']
        status_weights = [0.3, 0.25, 0.2, 0.15, 0.1]
        
        created_count = 0
        now = timezone.now()
        
        # Create notifications across different months
        for month_offset in range(12):  # Last 12 months
            # Random number of notifications per month (more recent = more notifications)
            num_notifications = random.randint(1, 5) if month_offset < 3 else random.randint(0, 3)
            
            for _ in range(num_notifications):
                template = random.choice(notifications_templates)
                
                # Find notification type
                notif_type = None
                for nt in notification_types:
                    if nt.name == template['type_name']:
                        notif_type = nt
                        break
                
                if not notif_type:
                    continue
                
                idx = random.randint(0, len(template['titles']) - 1)
                
                # Random date within the month
                days_ago = month_offset * 30 + random.randint(0, 29)
                created_date = now - timedelta(days=days_ago, hours=random.randint(0, 23))
                
                # Select creator (doctor or farmaceutico)
                all_creators = doctors + farmaceuticos
                creator = random.choice(all_creators)
                pharmacy = random.choice(pharmacies)
                
                # Determine status (older = more likely resolved)
                if month_offset > 6:
                    ticket_status = random.choices(['resolved', 'closed'], [0.7, 0.3])[0]
                elif month_offset > 3:
                    ticket_status = random.choices(statuses, status_weights)[0]
                else:
                    ticket_status = random.choices(['pending', 'in_progress', 'resolved'], [0.4, 0.4, 0.2])[0]
                
                notification = Notification.objects.create(
                    notification_type=notif_type,
                    pharmacy=pharmacy,
                    created_by=creator,
                    title=template['titles'][idx],
                    message=template['messages'][idx],
                    patient_cip=random.choice(sample_cips),
                    priority=template['priorities'][idx],
                    ticket_status=ticket_status,
                    status=active_status,
                )
                
                # Override created_at
                Notification.objects.filter(id=notification.id).update(created_at=created_date)
                
                if ticket_status in ['resolved', 'closed']:
                    resolve_date = created_date + timedelta(days=random.randint(1, 14))
                    Notification.objects.filter(id=notification.id).update(resolved_at=resolve_date)
                
                created_count += 1
        
        print(f"  ✓ Created {created_count} notifications")
