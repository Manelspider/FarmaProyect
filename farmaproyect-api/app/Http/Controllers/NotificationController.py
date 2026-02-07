"""
NotificationController
Endpoints for notification/ticket management
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q
from core.models import Notification, NotificationType, NotificationMessage, Pharmacy, User, CommonStatus, PharmacyUser


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    """
    List notifications based on user role:
    - Admins: All notifications
    - Farmacéuticos: Only notifications from their pharmacies
    - Médicos: Only notifications assigned to them or created by them
    Query params: pharmacy_id (optional), type_id (optional), ticket_status (optional)
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    # Base query - only active notifications
    notifications_query = Notification.objects.filter(status_id=1).select_related(
        'notification_type', 'pharmacy', 'pharmacy__data', 'created_by', 'created_by__data', 
        'assigned_to', 'assigned_to__data'
    )
    
    # Filter based on role
    if role_name == 'Administrador':
        # Admins see all notifications
        pass
    elif role_name == 'Farmacéutico':
        # Farmacéuticos see notifications from their pharmacies
        pharmacy_ids = PharmacyUser.objects.filter(
            user=user, 
            status_id=1
        ).values_list('pharmacy_id', flat=True)
        notifications_query = notifications_query.filter(pharmacy_id__in=pharmacy_ids)
    elif role_name == 'Médico':
        # Médicos see notifications assigned to them or created by them
        notifications_query = notifications_query.filter(
            Q(assigned_to=user) | Q(created_by=user)
        )
    else:
        return Response({
            'success': False,
            'message': 'No tienes permisos para ver notificaciones'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Apply filters from query params
    pharmacy_id = request.GET.get('pharmacy_id', None)
    type_id = request.GET.get('type_id', None)
    ticket_status = request.GET.get('ticket_status', None)
    
    if pharmacy_id:
        notifications_query = notifications_query.filter(pharmacy_id=pharmacy_id)
    if type_id:
        notifications_query = notifications_query.filter(notification_type_id=type_id)
    if ticket_status:
        notifications_query = notifications_query.filter(ticket_status=ticket_status)
    
    # Build response data
    data = []
    for notification in notifications_query:
        created_by_name = ''
        if notification.created_by and hasattr(notification.created_by, 'data') and notification.created_by.data:
            created_by_name = notification.created_by.data.full_name
        
        assigned_to_name = ''
        if notification.assigned_to and hasattr(notification.assigned_to, 'data') and notification.assigned_to.data:
            assigned_to_name = notification.assigned_to.data.full_name
        
        pharmacy_name = ''
        if notification.pharmacy and hasattr(notification.pharmacy, 'data') and notification.pharmacy.data:
            pharmacy_name = notification.pharmacy.data.name
        
        data.append({
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'patient_cip': notification.patient_cip,
            'priority': notification.priority,
            'priority_display': dict(Notification.PRIORITY_CHOICES).get(notification.priority, notification.priority),
            'ticket_status': notification.ticket_status,
            'ticket_status_display': dict(Notification.STATUS_CHOICES).get(notification.ticket_status, notification.ticket_status),
            'notification_type_id': notification.notification_type_id,
            'notification_type_name': notification.notification_type.name if notification.notification_type else '',
            'notification_type_icon': notification.notification_type.icon if notification.notification_type else '',
            'notification_type_color': notification.notification_type.color if notification.notification_type else '',
            'pharmacy_id': notification.pharmacy_id,
            'pharmacy_name': pharmacy_name,
            'created_by_id': notification.created_by_id,
            'created_by_name': created_by_name,
            'assigned_to_id': notification.assigned_to_id,
            'assigned_to_name': assigned_to_name,
            'image_base64': notification.image_base64,
            'resolved_at': notification.resolved_at.isoformat() if notification.resolved_at else None,
            'created_at': notification.created_at.isoformat() if notification.created_at else None,
            'updated_at': notification.updated_at.isoformat() if notification.updated_at else None,
        })
    
    return Response({
        'success': True,
        'data': data,
        'total': len(data)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_notification(request, pk):
    """Get single notification details with messages"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    try:
        notification = Notification.objects.select_related(
            'notification_type', 'pharmacy', 'pharmacy__data', 
            'created_by', 'created_by__data', 'assigned_to', 'assigned_to__data'
        ).get(pk=pk, status_id=1)
        
        # Check permission
        if role_name == 'Farmacéutico':
            has_access = PharmacyUser.objects.filter(
                user=user, 
                pharmacy_id=notification.pharmacy_id, 
                status_id=1
            ).exists()
            if not has_access:
                return Response({
                    'success': False,
                    'message': 'No tienes acceso a esta notificación'
                }, status=status.HTTP_403_FORBIDDEN)
        elif role_name == 'Médico':
            if notification.assigned_to_id != user.id and notification.created_by_id != user.id:
                return Response({
                    'success': False,
                    'message': 'No tienes acceso a esta notificación'
                }, status=status.HTTP_403_FORBIDDEN)
        
        # Get messages
        messages = NotificationMessage.objects.filter(
            notification=notification, status_id=1
        ).select_related('sender', 'sender__data').order_by('created_at')
        
        messages_data = []
        for msg in messages:
            user_name = ''
            if msg.sender and hasattr(msg.sender, 'data') and msg.sender.data:
                user_name = msg.sender.data.full_name
            messages_data.append({
                'id': msg.id,
                'message': msg.message,
                'image_base64': msg.attachment,
                'user_id': msg.sender_id,
                'user_name': user_name,
                'created_at': msg.created_at.isoformat() if msg.created_at else None
            })
        
        created_by_name = ''
        if notification.created_by and hasattr(notification.created_by, 'data') and notification.created_by.data:
            created_by_name = notification.created_by.data.full_name
        
        assigned_to_name = ''
        if notification.assigned_to and hasattr(notification.assigned_to, 'data') and notification.assigned_to.data:
            assigned_to_name = notification.assigned_to.data.full_name
        
        pharmacy_name = ''
        if notification.pharmacy and hasattr(notification.pharmacy, 'data') and notification.pharmacy.data:
            pharmacy_name = notification.pharmacy.data.name
        
        data = {
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'patient_cip': notification.patient_cip,
            'priority': notification.priority,
            'priority_display': dict(Notification.PRIORITY_CHOICES).get(notification.priority, notification.priority),
            'ticket_status': notification.ticket_status,
            'ticket_status_display': dict(Notification.STATUS_CHOICES).get(notification.ticket_status, notification.ticket_status),
            'notification_type_id': notification.notification_type_id,
            'notification_type_name': notification.notification_type.name if notification.notification_type else '',
            'notification_type_icon': notification.notification_type.icon if notification.notification_type else '',
            'notification_type_color': notification.notification_type.color if notification.notification_type else '',
            'pharmacy_id': notification.pharmacy_id,
            'pharmacy_name': pharmacy_name,
            'created_by_id': notification.created_by_id,
            'created_by_name': created_by_name,
            'assigned_to_id': notification.assigned_to_id,
            'assigned_to_name': assigned_to_name,
            'image_base64': notification.image_base64,
            'resolved_at': notification.resolved_at.isoformat() if notification.resolved_at else None,
            'created_at': notification.created_at.isoformat() if notification.created_at else None,
            'updated_at': notification.updated_at.isoformat() if notification.updated_at else None,
            'messages': messages_data
        }
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Notification.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Notificación no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_notification(request):
    """
    Create a new notification.
    - Farmacéuticos: Create notifications for doctors (external or internal)
    - Médicos: Create notifications for pharmacies
    If external_email is provided, sends email to external doctor.
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    # Farmacéuticos, Médicos and Admins can create notifications
    if role_name not in ['Administrador', 'Farmacéutico', 'Médico']:
        return Response({
            'success': False,
            'message': 'No tienes permisos para crear notificaciones'
        }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    
    # Validate required fields
    required_fields = ['notification_type_id', 'pharmacy_id', 'title', 'message']
    for field in required_fields:
        if not data.get(field):
            return Response({
                'success': False,
                'message': f'Campo requerido: {field}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate notification type
    try:
        notification_type = NotificationType.objects.get(id=data['notification_type_id'], status_id=1)
    except NotificationType.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Tipo de notificación no válido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate pharmacy
    try:
        pharmacy = Pharmacy.objects.get(id=data['pharmacy_id'], status_id=1)
    except Pharmacy.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Farmacia no válida'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if farmacéutico has access to this pharmacy
    if role_name == 'Farmacéutico':
        has_access = PharmacyUser.objects.filter(
            user=user, 
            pharmacy=pharmacy, 
            status_id=1
        ).exists()
        if not has_access:
            return Response({
                'success': False,
                'message': 'No tienes acceso a esta farmacia'
            }, status=status.HTTP_403_FORBIDDEN)
    
    # Médicos can create notifications for any pharmacy (they don't need pharmacy access)
    # The notification will be sent TO the pharmacy
    
    # Validate assigned_to if provided
    assigned_to = None
    if data.get('assigned_to_id'):
        try:
            assigned_to = User.objects.get(id=data['assigned_to_id'], status_id=1)
        except User.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Usuario asignado no válido'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # For doctors, assign to pharmacy (the pharmacy users will see it)
    # For pharmacies, assign to a doctor if specified
    
    try:
        active_status = CommonStatus.objects.get(id=1)
        
        # Create notification
        notification = Notification.objects.create(
            notification_type=notification_type,
            pharmacy=pharmacy,
            created_by=user,
            assigned_to=assigned_to,
            title=data['title'],
            patient_cip=data.get('patient_cip', ''),
            priority=data.get('priority', 'normal'),
            ticket_status='pending',
            message=data['message'],
            image_base64=data.get('image_base64', ''),
            status=active_status
        )
        
        # If external email is provided, send notification email
        external_email = data.get('external_email', '')
        email_sent = False
        email_error = ''
        
        if external_email:
            try:
                pharmacy_name = pharmacy.data.name if hasattr(pharmacy, 'data') and pharmacy.data else 'Farmacia'
                
                subject = f'[FarmaProject] {notification_type.name}: {data["title"]}'
                message_body = f"""
Estimado/a Doctor/a,

Ha recibido una nueva notificación desde {pharmacy_name}:

Tipo: {notification_type.name}
Título: {data['title']}
Prioridad: {dict(Notification.PRIORITY_CHOICES).get(data.get('priority', 'normal'), 'Normal')}
{f"CIP Paciente: {data.get('patient_cip', '')}" if data.get('patient_cip') else ""}

Mensaje:
{data['message']}

---
Este correo ha sido enviado automáticamente desde FarmaProject.
Por favor, no responda directamente a este correo.
"""
                
                send_mail(
                    subject=subject,
                    message=message_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[external_email],
                    fail_silently=False
                )
                email_sent = True
            except Exception as e:
                email_error = str(e)
        
        # Build response
        response_data = {
            'id': notification.id,
            'title': notification.title,
            'message': notification.message,
            'notification_type_name': notification_type.name,
            'pharmacy_name': pharmacy.data.name if hasattr(pharmacy, 'data') and pharmacy.data else '',
            'created_at': notification.created_at.isoformat()
        }
        
        response_message = 'Notificación creada correctamente'
        if external_email:
            if email_sent:
                response_message += f'. Email enviado a {external_email}'
            else:
                response_message += f'. Error al enviar email: {email_error}'
        
        return Response({
            'success': True,
            'data': response_data,
            'email_sent': email_sent,
            'message': response_message
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_notification(request, pk):
    """Update notification"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    try:
        notification = Notification.objects.select_related('pharmacy').get(pk=pk, status_id=1)
    except Notification.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Notificación no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check permission
    if role_name == 'Farmacéutico':
        has_access = PharmacyUser.objects.filter(
            user=user, 
            pharmacy_id=notification.pharmacy_id, 
            status_id=1
        ).exists()
        if not has_access:
            return Response({
                'success': False,
                'message': 'No tienes acceso a esta notificación'
            }, status=status.HTTP_403_FORBIDDEN)
    elif role_name == 'Médico':
        if notification.assigned_to_id != user.id and notification.created_by_id != user.id:
            return Response({
                'success': False,
                'message': 'No tienes acceso a esta notificación'
            }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    
    # Store old status for change detection
    old_ticket_status = notification.ticket_status
    status_changed = False
    
    # Update allowed fields
    if 'title' in data:
        notification.title = data['title']
    if 'message' in data:
        notification.message = data['message']
    if 'patient_cip' in data:
        notification.patient_cip = data['patient_cip']
    if 'priority' in data:
        notification.priority = data['priority']
    if 'ticket_status' in data:
        if notification.ticket_status != data['ticket_status']:
            status_changed = True
        notification.ticket_status = data['ticket_status']
        # If resolved, set resolved_at
        if data['ticket_status'] == 'resolved' and not notification.resolved_at:
            from django.utils import timezone
            notification.resolved_at = timezone.now()
    if 'assigned_to_id' in data:
        if data['assigned_to_id']:
            try:
                assigned_to = User.objects.get(id=data['assigned_to_id'], status_id=1)
                notification.assigned_to = assigned_to
            except User.DoesNotExist:
                pass
        else:
            notification.assigned_to = None
    if 'image_base64' in data:
        notification.image_base64 = data['image_base64']
    
    notification.save()
    
    # If status changed, create an internal notification for involved parties
    if status_changed:
        from django.utils import timezone
        try:
            active_status = CommonStatus.objects.get(id=1)
            new_status_display = dict(Notification.STATUS_CHOICES).get(notification.ticket_status, notification.ticket_status)
            old_status_display = dict(Notification.STATUS_CHOICES).get(old_ticket_status, old_ticket_status)
            
            # Create a notification message to track the status change
            status_message = f"Estado cambiado de '{old_status_display}' a '{new_status_display}' por {user.data.full_name if user.data else user.email}"
            
            NotificationMessage.objects.create(
                notification=notification,
                sender=user,
                message=status_message,
                status=active_status
            )
            
        except Exception as e:
            # Don't fail the update if notification fails
            pass
    
    return Response({
        'success': True,
        'message': 'Notificación actualizada correctamente',
        'status_changed': status_changed
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_notification(request, pk):
    """Soft delete notification (Admin and creator only)"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    try:
        notification = Notification.objects.get(pk=pk, status_id=1)
    except Notification.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Notificación no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Only admin or creator can delete
    if role_name != 'Administrador' and notification.created_by_id != user.id:
        return Response({
            'success': False,
            'message': 'No tienes permisos para eliminar esta notificación'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Soft delete - set status to 3 (deleted)
    try:
        deleted_status = CommonStatus.objects.get(id=3)
        notification.status = deleted_status
        notification.save()
        
        return Response({
            'success': True,
            'message': 'Notificación eliminada correctamente'
        })
    except CommonStatus.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Error al eliminar la notificación'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_message(request, pk):
    """Add a message to a notification thread"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    try:
        notification = Notification.objects.get(pk=pk, status_id=1)
    except Notification.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Notificación no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check permission
    if role_name == 'Farmacéutico':
        has_access = PharmacyUser.objects.filter(
            user=user, 
            pharmacy_id=notification.pharmacy_id, 
            status_id=1
        ).exists()
        if not has_access:
            return Response({
                'success': False,
                'message': 'No tienes acceso a esta notificación'
            }, status=status.HTTP_403_FORBIDDEN)
    elif role_name == 'Médico':
        if notification.assigned_to_id != user.id and notification.created_by_id != user.id:
            return Response({
                'success': False,
                'message': 'No tienes acceso a esta notificación'
            }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    
    if not data.get('message'):
        return Response({
            'success': False,
            'message': 'El mensaje es requerido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        active_status = CommonStatus.objects.get(id=1)
        
        message = NotificationMessage.objects.create(
            notification=notification,
            sender=user,
            message=data['message'],
            attachment=data.get('image_base64', ''),
            status=active_status
        )
        
        user_name = ''
        if user.data:
            user_name = user.data.full_name
        
        return Response({
            'success': True,
            'data': {
                'id': message.id,
                'message': message.message,
                'image_base64': message.attachment,
                'user_id': user.id,
                'user_name': user_name,
                'created_at': message.created_at.isoformat()
            },
            'message': 'Mensaje añadido correctamente'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_notification_types(request):
    """Get all active notification types"""
    types = NotificationType.objects.filter(status_id=1).order_by('name')
    
    data = []
    for t in types:
        data.append({
            'id': t.id,
            'name': t.name,
            'description': t.description,
            'icon': t.icon,
            'color': t.color
        })
    
    return Response({
        'success': True,
        'data': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_doctors(request):
    """Get all active doctors for notification assignment"""
    doctors = User.objects.filter(
        role__name='Médico', 
        status_id=1
    ).select_related('data')
    
    data = []
    for doctor in doctors:
        name = ''
        if hasattr(doctor, 'data') and doctor.data:
            name = doctor.data.full_name
        data.append({
            'id': doctor.id,
            'email': doctor.email,
            'name': name
        })
    
    return Response({
        'success': True,
        'data': data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_notifications(request):
    """
    Get notifications for the bell icon based on user role:
    - Médicos: Notifications assigned to them (unread/recent)
    - Farmacéuticos: Status changes on notifications from their pharmacies
    - Admins: Not applicable (returns empty)
    
    Notifications that are resolved/closed for more than 24h are auto-hidden.
    Query params: limit (optional, default 10)
    """
    from django.utils import timezone
    from datetime import timedelta
    
    user = request.user
    role_name = user.role.name if user.role else None
    limit = int(request.GET.get('limit', 10))
    
    # Admins don't have bell notifications
    if role_name == 'Administrador':
        return Response({
            'success': True,
            'data': [],
            'total': 0,
            'show_bell': False
        })
    
    # Filter out old resolved/closed notifications (older than 24h)
    time_threshold = timezone.now() - timedelta(hours=24)
    
    notifications_query = Notification.objects.filter(status_id=1).select_related(
        'notification_type', 'pharmacy', 'pharmacy__data', 'created_by', 'created_by__data'
    ).order_by('-updated_at')
    
    # Exclude old closed/resolved notifications
    notifications_query = notifications_query.exclude(
        Q(ticket_status__in=['resolved', 'closed', 'cancelled']) & Q(updated_at__lt=time_threshold)
    )
    
    if role_name == 'Médico':
        # Médicos see notifications assigned to them
        notifications_query = notifications_query.filter(assigned_to=user)
    elif role_name == 'Farmacéutico':
        # Farmacéuticos see notifications from their pharmacies
        pharmacy_ids = PharmacyUser.objects.filter(
            user=user, 
            status_id=1
        ).values_list('pharmacy_id', flat=True)
        notifications_query = notifications_query.filter(pharmacy_id__in=pharmacy_ids)
    else:
        return Response({
            'success': True,
            'data': [],
            'total': 0,
            'show_bell': False
        })
    
    # Limit results
    notifications_query = notifications_query[:limit]
    
    data = []
    for notification in notifications_query:
        pharmacy_name = ''
        if notification.pharmacy and hasattr(notification.pharmacy, 'data') and notification.pharmacy.data:
            pharmacy_name = notification.pharmacy.data.name
        
        created_by_name = ''
        if notification.created_by and hasattr(notification.created_by, 'data') and notification.created_by.data:
            created_by_name = notification.created_by.data.full_name
        
        data.append({
            'id': notification.id,
            'title': notification.title,
            'message': notification.message[:100] + '...' if len(notification.message) > 100 else notification.message,
            'priority': notification.priority,
            'ticket_status': notification.ticket_status,
            'ticket_status_display': dict(Notification.STATUS_CHOICES).get(notification.ticket_status, notification.ticket_status),
            'notification_type_name': notification.notification_type.name if notification.notification_type else '',
            'notification_type_icon': notification.notification_type.icon if notification.notification_type else 'bell',
            'notification_type_color': notification.notification_type.color if notification.notification_type else '#6c757d',
            'pharmacy_name': pharmacy_name,
            'created_by_name': created_by_name,
            'updated_at': notification.updated_at.isoformat() if notification.updated_at else None,
            'created_at': notification.created_at.isoformat() if notification.created_at else None,
        })
    
    # Count pending notifications
    pending_count = Notification.objects.filter(
        status_id=1
    )
    if role_name == 'Médico':
        pending_count = pending_count.filter(assigned_to=user, ticket_status__in=['pending', 'in_progress'])
    elif role_name == 'Farmacéutico':
        pending_count = pending_count.filter(pharmacy_id__in=pharmacy_ids, ticket_status__in=['pending', 'in_progress'])
    
    return Response({
        'success': True,
        'data': data,
        'total': len(data),
        'pending_count': pending_count.count(),
        'show_bell': True
    })
