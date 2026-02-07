"""
PharmacyController
Endpoints for pharmacy management
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.models import Pharmacy, PharmacyData, PharmacyUser, CommonStatus
from app.Http.Serializers import PharmacySerializer, PharmacyListSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_pharmacies(request):
    """
    List pharmacies based on user role:
    - Admins/Médicos: All pharmacies
    - Farmacéuticos: Only assigned pharmacies
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    if role_name in ['Administrador', 'Médico']:
        pharmacies = Pharmacy.objects.filter(status_id=1).select_related('data')
    else:
        pharmacy_ids = PharmacyUser.objects.filter(
            user=user, 
            status_id=1
        ).values_list('pharmacy_id', flat=True)
        pharmacies = Pharmacy.objects.filter(
            id__in=pharmacy_ids, 
            status_id=1
        ).select_related('data')
    
    serializer = PharmacyListSerializer(pharmacies, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data,
        'can_switch': role_name in ['Administrador', 'Médico'],
        'total': len(serializer.data)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_pharmacy(request, pk):
    """Get single pharmacy details"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    try:
        pharmacy = Pharmacy.objects.select_related('data').get(pk=pk)
        
        # Check permission
        if role_name not in ['Administrador', 'Médico']:
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
        
        serializer = PharmacySerializer(pharmacy)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
        
    except Pharmacy.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Farmacia no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_pharmacies(request):
    """Get pharmacies assigned to current user (for pharmacists)"""
    user = request.user
    
    pharmacy_users = PharmacyUser.objects.filter(
        user=user, 
        status_id=1
    ).select_related('pharmacy', 'pharmacy__data')
    
    pharmacies = [pu.pharmacy for pu in pharmacy_users]
    serializer = PharmacyListSerializer(pharmacies, many=True)
    
    # Add is_manager flag
    data = serializer.data
    for i, pu in enumerate(pharmacy_users):
        if i < len(data):
            data[i]['is_manager'] = pu.is_manager
    
    return Response({
        'success': True,
        'data': data,
        'total': len(data)
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_pharmacy(request):
    """Create a new pharmacy (Admin only)"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    if role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'Solo administradores pueden crear farmacias'
        }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    
    # Validate required fields
    required_fields = ['code', 'name', 'address', 'city']
    for field in required_fields:
        if not data.get(field):
            return Response({
                'success': False,
                'message': f'Campo requerido: {field}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if code already exists
    if Pharmacy.objects.filter(code=data['code']).exists():
        return Response({
            'success': False,
            'message': 'Ya existe una farmacia con este código'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        active_status = CommonStatus.objects.get(id=1)
        
        # Create pharmacy
        pharmacy = Pharmacy.objects.create(
            code=data['code'],
            status=active_status
        )
        
        # Create pharmacy data
        # Generate license number if not provided
        license_number = data.get('license_number') or f"LIC-{pharmacy.code}"
        
        PharmacyData.objects.create(
            pharmacy=pharmacy,
            name=data['name'],
            address=data['address'],
            city=data['city'],
            postal_code=data.get('postal_code', ''),
            phone=data.get('phone', ''),
            email=data.get('email') or None,
            license_number=license_number,
            latitude=data.get('latitude') or None,
            longitude=data.get('longitude') or None,
            status=active_status
        )
        
        serializer = PharmacySerializer(pharmacy)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Farmacia creada correctamente'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_pharmacy(request, pk):
    """Update pharmacy (Admin only)"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    if role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'Solo administradores pueden editar farmacias'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        pharmacy = Pharmacy.objects.select_related('data').get(pk=pk)
    except Pharmacy.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Farmacia no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data
    
    # Update code if provided
    if data.get('code') and data['code'] != pharmacy.code:
        if Pharmacy.objects.filter(code=data['code']).exclude(pk=pk).exists():
            return Response({
                'success': False,
                'message': 'Ya existe una farmacia con este código'
            }, status=status.HTTP_400_BAD_REQUEST)
        pharmacy.code = data['code']
        pharmacy.save()
    
    # Update pharmacy data
    pharmacy_data = pharmacy.data
    if pharmacy_data:
        pharmacy_data.name = data.get('name', pharmacy_data.name)
        pharmacy_data.address = data.get('address', pharmacy_data.address)
        pharmacy_data.city = data.get('city', pharmacy_data.city)
        pharmacy_data.postal_code = data.get('postal_code', pharmacy_data.postal_code)
        pharmacy_data.phone = data.get('phone', pharmacy_data.phone)
        pharmacy_data.email = data.get('email', pharmacy_data.email)
        
        if data.get('latitude'):
            pharmacy_data.latitude = data['latitude']
        if data.get('longitude'):
            pharmacy_data.longitude = data['longitude']
        
        pharmacy_data.save()
    
    serializer = PharmacySerializer(pharmacy)
    
    return Response({
        'success': True,
        'data': serializer.data,
        'message': 'Farmacia actualizada correctamente'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_pharmacy(request, pk):
    """Delete pharmacy (Admin only) - soft delete"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    if role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'Solo administradores pueden eliminar farmacias'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        pharmacy = Pharmacy.objects.get(pk=pk)
    except Pharmacy.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Farmacia no encontrada'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Soft delete - set status to deleted (id=3)
    try:
        deleted_status = CommonStatus.objects.get(id=3)
        pharmacy.status = deleted_status
        pharmacy.save()
        
        # Also mark pharmacy data as deleted
        if hasattr(pharmacy, 'data') and pharmacy.data:
            pharmacy.data.status = deleted_status
            pharmacy.data.save()
        
        return Response({
            'success': True,
            'message': 'Farmacia eliminada correctamente'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
