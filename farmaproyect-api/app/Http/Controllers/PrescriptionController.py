"""
PrescriptionController
Endpoints for prescription management
- Doctors: Full CRUD
- Pharmacists: Read only + mark as dispensed
- Admins: Full access
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from core.models import Prescription, Pharmacy, User, CommonStatus, PharmacyUser


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_prescriptions(request):
    """
    List prescriptions based on user role:
    - Admins: All prescriptions
    - Médicos: Only their own prescriptions
    - Farmacéuticos: Prescriptions sent to their pharmacies
    Query params: pharmacy_id, patient_cip, prescription_status
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    # Base query - only active prescriptions
    prescriptions_query = Prescription.objects.filter(status_id=1).select_related(
        'doctor', 'doctor__data', 'pharmacy', 'pharmacy__data', 
        'dispensed_by', 'dispensed_by__data'
    )
    
    # Filter based on role
    if role_name == 'Administrador':
        pass  # Admins see all
    elif role_name == 'Médico':
        # Doctors see only their own prescriptions
        prescriptions_query = prescriptions_query.filter(doctor=user)
    elif role_name == 'Farmacéutico':
        # Pharmacists see prescriptions sent to their pharmacies
        pharmacy_ids = PharmacyUser.objects.filter(
            user=user, 
            status_id=1
        ).values_list('pharmacy_id', flat=True)
        prescriptions_query = prescriptions_query.filter(pharmacy_id__in=pharmacy_ids)
    else:
        return Response({
            'success': False,
            'message': 'No tienes permisos para ver recetas'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Apply filters from query params
    pharmacy_id = request.GET.get('pharmacy_id', None)
    patient_cip = request.GET.get('patient_cip', None)
    prescription_status = request.GET.get('prescription_status', None)
    
    if pharmacy_id:
        prescriptions_query = prescriptions_query.filter(pharmacy_id=pharmacy_id)
    if patient_cip:
        prescriptions_query = prescriptions_query.filter(patient_cip__icontains=patient_cip)
    if prescription_status:
        prescriptions_query = prescriptions_query.filter(prescription_status=prescription_status)
    
    prescriptions_query = prescriptions_query.order_by('-created_at')
    
    data = []
    for prescription in prescriptions_query:
        doctor_name = ''
        if prescription.doctor and hasattr(prescription.doctor, 'data') and prescription.doctor.data:
            doctor_name = prescription.doctor.data.full_name
        
        pharmacy_name = ''
        if prescription.pharmacy and hasattr(prescription.pharmacy, 'data') and prescription.pharmacy.data:
            pharmacy_name = prescription.pharmacy.data.name
        
        dispensed_by_name = ''
        if prescription.dispensed_by and hasattr(prescription.dispensed_by, 'data') and prescription.dispensed_by.data:
            dispensed_by_name = prescription.dispensed_by.data.full_name
        
        data.append({
            'id': prescription.id,
            'patient_cip': prescription.patient_cip,
            'patient_name': prescription.patient_name or '',
            'medication': prescription.medication,
            'dosage': prescription.dosage or '',
            'quantity': prescription.quantity,
            'prescription_status': prescription.prescription_status,
            'prescription_status_display': dict(Prescription.PRESCRIPTION_STATUS_CHOICES).get(
                prescription.prescription_status, prescription.prescription_status
            ),
            'doctor_id': prescription.doctor_id,
            'doctor_name': doctor_name,
            'pharmacy_id': prescription.pharmacy_id,
            'pharmacy_name': pharmacy_name,
            'issue_date': prescription.issue_date.isoformat() if prescription.issue_date else None,
            'expiry_date': prescription.expiry_date.isoformat() if prescription.expiry_date else None,
            'dispensed_by_name': dispensed_by_name,
            'dispensed_at': prescription.dispensed_at.isoformat() if prescription.dispensed_at else None,
            'created_at': prescription.created_at.isoformat() if prescription.created_at else None,
        })
    
    return Response({
        'success': True,
        'data': data,
        'total': len(data)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_prescription(request, pk):
    """Get single prescription details"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    try:
        prescription = Prescription.objects.select_related(
            'doctor', 'doctor__data', 'pharmacy', 'pharmacy__data',
            'dispensed_by', 'dispensed_by__data'
        ).get(pk=pk, status_id=1)
        
        # Check permission
        if role_name == 'Farmacéutico':
            if prescription.pharmacy_id:
                has_access = PharmacyUser.objects.filter(
                    user=user, 
                    pharmacy_id=prescription.pharmacy_id, 
                    status_id=1
                ).exists()
                if not has_access:
                    return Response({
                        'success': False,
                        'message': 'No tienes acceso a esta receta'
                    }, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    'success': False,
                    'message': 'Esta receta no está asignada a ninguna farmacia'
                }, status=status.HTTP_403_FORBIDDEN)
        elif role_name == 'Médico':
            if prescription.doctor_id != user.id:
                return Response({
                    'success': False,
                    'message': 'No tienes acceso a esta receta'
                }, status=status.HTTP_403_FORBIDDEN)
        
        doctor_name = ''
        if prescription.doctor and hasattr(prescription.doctor, 'data') and prescription.doctor.data:
            doctor_name = prescription.doctor.data.full_name
        
        pharmacy_name = ''
        if prescription.pharmacy and hasattr(prescription.pharmacy, 'data') and prescription.pharmacy.data:
            pharmacy_name = prescription.pharmacy.data.name
        
        dispensed_by_name = ''
        if prescription.dispensed_by and hasattr(prescription.dispensed_by, 'data') and prescription.dispensed_by.data:
            dispensed_by_name = prescription.dispensed_by.data.full_name
        
        data = {
            'id': prescription.id,
            'patient_cip': prescription.patient_cip,
            'patient_name': prescription.patient_name or '',
            'patient_birth_date': prescription.patient_birth_date.isoformat() if prescription.patient_birth_date else None,
            'medication': prescription.medication,
            'dosage': prescription.dosage or '',
            'quantity': prescription.quantity,
            'instructions': prescription.instructions or '',
            'notes': prescription.notes or '',
            'image_base64': prescription.image_base64 or '',
            'prescription_status': prescription.prescription_status,
            'prescription_status_display': dict(Prescription.PRESCRIPTION_STATUS_CHOICES).get(
                prescription.prescription_status, prescription.prescription_status
            ),
            'doctor_id': prescription.doctor_id,
            'doctor_name': doctor_name,
            'pharmacy_id': prescription.pharmacy_id,
            'pharmacy_name': pharmacy_name,
            'issue_date': prescription.issue_date.isoformat() if prescription.issue_date else None,
            'expiry_date': prescription.expiry_date.isoformat() if prescription.expiry_date else None,
            'dispensed_by_id': prescription.dispensed_by_id,
            'dispensed_by_name': dispensed_by_name,
            'dispensed_at': prescription.dispensed_at.isoformat() if prescription.dispensed_at else None,
            'created_at': prescription.created_at.isoformat() if prescription.created_at else None,
            'updated_at': prescription.updated_at.isoformat() if prescription.updated_at else None,
        }
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Prescription.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Receta no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_prescription(request):
    """
    Create a new prescription.
    Only doctors and admins can create prescriptions.
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    # Only Médicos and Admins can create prescriptions
    if role_name not in ['Administrador', 'Médico']:
        return Response({
            'success': False,
            'message': 'Solo médicos pueden crear recetas'
        }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    
    # Validate required fields
    required_fields = ['patient_cip', 'medication']
    for field in required_fields:
        if not data.get(field):
            return Response({
                'success': False,
                'message': f'Campo requerido: {field}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate pharmacy if provided
    pharmacy = None
    if data.get('pharmacy_id'):
        try:
            pharmacy = Pharmacy.objects.get(id=data['pharmacy_id'], status_id=1)
        except Pharmacy.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Farmacia no válida'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        active_status = CommonStatus.objects.get(id=1)
        
        # Parse dates
        issue_date = timezone.now().date()
        if data.get('issue_date'):
            try:
                issue_date = timezone.datetime.strptime(data['issue_date'], '%Y-%m-%d').date()
            except ValueError:
                pass
        
        expiry_date = None
        if data.get('expiry_date'):
            try:
                expiry_date = timezone.datetime.strptime(data['expiry_date'], '%Y-%m-%d').date()
            except ValueError:
                pass
        
        patient_birth_date = None
        if data.get('patient_birth_date'):
            try:
                patient_birth_date = timezone.datetime.strptime(data['patient_birth_date'], '%Y-%m-%d').date()
            except ValueError:
                pass
        
        # Create prescription
        prescription = Prescription.objects.create(
            doctor=user,
            pharmacy=pharmacy,
            patient_cip=data['patient_cip'],
            patient_name=data.get('patient_name', ''),
            patient_birth_date=patient_birth_date,
            medication=data['medication'],
            dosage=data.get('dosage', ''),
            quantity=data.get('quantity', 1),
            instructions=data.get('instructions', ''),
            notes=data.get('notes', ''),
            image_base64=data.get('image_base64', ''),
            issue_date=issue_date,
            expiry_date=expiry_date,
            prescription_status=data.get('prescription_status', 'active'),
            status=active_status
        )
        
        response_data = {
            'id': prescription.id,
            'patient_cip': prescription.patient_cip,
            'medication': prescription.medication,
            'pharmacy_name': pharmacy.data.name if pharmacy and hasattr(pharmacy, 'data') and pharmacy.data else '',
            'created_at': prescription.created_at.isoformat()
        }
        
        return Response({
            'success': True,
            'data': response_data,
            'message': 'Receta creada correctamente'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_prescription(request, pk):
    """
    Update prescription.
    Only doctors (owner) and admins can edit.
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    try:
        prescription = Prescription.objects.get(pk=pk, status_id=1)
    except Prescription.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Receta no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check permission - only doctor owner or admin
    if role_name == 'Médico':
        if prescription.doctor_id != user.id:
            return Response({
                'success': False,
                'message': 'No puedes editar recetas de otros médicos'
            }, status=status.HTTP_403_FORBIDDEN)
    elif role_name == 'Farmacéutico':
        return Response({
            'success': False,
            'message': 'Los farmacéuticos no pueden editar recetas'
        }, status=status.HTTP_403_FORBIDDEN)
    elif role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'No tienes permisos para editar recetas'
        }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    
    # Update allowed fields
    if 'patient_cip' in data:
        prescription.patient_cip = data['patient_cip']
    if 'patient_name' in data:
        prescription.patient_name = data['patient_name']
    if 'patient_birth_date' in data:
        if data['patient_birth_date']:
            try:
                prescription.patient_birth_date = timezone.datetime.strptime(
                    data['patient_birth_date'], '%Y-%m-%d'
                ).date()
            except ValueError:
                pass
        else:
            prescription.patient_birth_date = None
    if 'medication' in data:
        prescription.medication = data['medication']
    if 'dosage' in data:
        prescription.dosage = data['dosage']
    if 'quantity' in data:
        prescription.quantity = data['quantity']
    if 'instructions' in data:
        prescription.instructions = data['instructions']
    if 'notes' in data:
        prescription.notes = data['notes']
    if 'image_base64' in data:
        prescription.image_base64 = data['image_base64']
    if 'issue_date' in data:
        if data['issue_date']:
            try:
                prescription.issue_date = timezone.datetime.strptime(
                    data['issue_date'], '%Y-%m-%d'
                ).date()
            except ValueError:
                pass
    if 'expiry_date' in data:
        if data['expiry_date']:
            try:
                prescription.expiry_date = timezone.datetime.strptime(
                    data['expiry_date'], '%Y-%m-%d'
                ).date()
            except ValueError:
                pass
        else:
            prescription.expiry_date = None
    if 'prescription_status' in data:
        prescription.prescription_status = data['prescription_status']
    if 'pharmacy_id' in data:
        if data['pharmacy_id']:
            try:
                pharmacy = Pharmacy.objects.get(id=data['pharmacy_id'], status_id=1)
                prescription.pharmacy = pharmacy
            except Pharmacy.DoesNotExist:
                pass
        else:
            prescription.pharmacy = None
    
    prescription.save()
    
    return Response({
        'success': True,
        'message': 'Receta actualizada correctamente'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_prescription(request, pk):
    """Soft delete prescription (Doctor owner and Admin only)"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    try:
        prescription = Prescription.objects.get(pk=pk, status_id=1)
    except Prescription.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Receta no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Only admin or doctor owner can delete
    if role_name == 'Médico':
        if prescription.doctor_id != user.id:
            return Response({
                'success': False,
                'message': 'No puedes eliminar recetas de otros médicos'
            }, status=status.HTTP_403_FORBIDDEN)
    elif role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'No tienes permisos para eliminar recetas'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        deleted_status = CommonStatus.objects.get(id=3)
        prescription.status = deleted_status
        prescription.save()
        
        return Response({
            'success': True,
            'message': 'Receta eliminada correctamente'
        })
    except CommonStatus.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Error al eliminar la receta'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def dispense_prescription(request, pk):
    """
    Mark prescription as dispensed.
    Only pharmacists can dispense.
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    # Only pharmacists and admins can dispense
    if role_name not in ['Administrador', 'Farmacéutico']:
        return Response({
            'success': False,
            'message': 'Solo farmacéuticos pueden dispensar recetas'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        prescription = Prescription.objects.get(pk=pk, status_id=1)
    except Prescription.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Receta no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if pharmacist has access to this pharmacy
    if role_name == 'Farmacéutico' and prescription.pharmacy_id:
        has_access = PharmacyUser.objects.filter(
            user=user, 
            pharmacy_id=prescription.pharmacy_id, 
            status_id=1
        ).exists()
        if not has_access:
            return Response({
                'success': False,
                'message': 'No tienes acceso a esta receta'
            }, status=status.HTTP_403_FORBIDDEN)
    
    # Check if already dispensed
    if prescription.prescription_status == 'dispensed':
        return Response({
            'success': False,
            'message': 'Esta receta ya ha sido dispensada'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if expired
    if prescription.is_expired():
        return Response({
            'success': False,
            'message': 'Esta receta ha caducado'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if cancelled
    if prescription.prescription_status == 'cancelled':
        return Response({
            'success': False,
            'message': 'Esta receta está cancelada'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    prescription.mark_as_dispensed(user)
    
    return Response({
        'success': True,
        'message': 'Receta marcada como dispensada'
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_to_pharmacy(request, pk):
    """
    Send prescription to a specific pharmacy.
    Only doctors (owner) can send.
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    # Only doctors can send
    if role_name not in ['Administrador', 'Médico']:
        return Response({
            'success': False,
            'message': 'Solo médicos pueden enviar recetas a farmacias'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        prescription = Prescription.objects.get(pk=pk, status_id=1)
    except Prescription.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Receta no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Check if doctor is owner
    if role_name == 'Médico' and prescription.doctor_id != user.id:
        return Response({
            'success': False,
            'message': 'No puedes enviar recetas de otros médicos'
        }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    
    if not data.get('pharmacy_id'):
        return Response({
            'success': False,
            'message': 'Debes especificar una farmacia'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        pharmacy = Pharmacy.objects.get(id=data['pharmacy_id'], status_id=1)
    except Pharmacy.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Farmacia no válida'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    prescription.pharmacy = pharmacy
    prescription.save()
    
    pharmacy_name = pharmacy.data.name if hasattr(pharmacy, 'data') and pharmacy.data else ''
    
    return Response({
        'success': True,
        'message': f'Receta enviada a {pharmacy_name}'
    })
