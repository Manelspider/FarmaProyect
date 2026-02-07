"""
UserController
Endpoints for user management
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from core.models import User, UserData, UserRole, CommonStatus
from app.Http.Serializers import UserSerializer, UserListSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_users(request):
    """
    List users filtered by role
    Query params: role_id (optional)
    """
    user = request.user
    role_name = user.role.name if user.role else None
    
    # Only admins can list users
    if role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'No tienes permisos para listar usuarios'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Get role filter from query params
    role_id = request.GET.get('role_id', None)
    
    # Base query - only active users
    users_query = User.objects.filter(status_id=1).select_related('data', 'role')
    
    # Filter by role if specified
    if role_id:
        users_query = users_query.filter(role_id=role_id)
    
    serializer = UserListSerializer(users_query, many=True)
    
    return Response({
        'success': True,
        'data': serializer.data,
        'total': len(serializer.data)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, pk):
    """Get single user details"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    # Only admins can view user details
    if role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'No tienes permisos para ver detalles de usuarios'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        target_user = User.objects.select_related('data', 'role').get(pk=pk)
        serializer = UserSerializer(target_user)
        
        return Response({
            'success': True,
            'data': serializer.data
        })
        
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_user(request):
    """Create a new user (Admin only)"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    if role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'Solo administradores pueden crear usuarios'
        }, status=status.HTTP_403_FORBIDDEN)
    
    data = request.data
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name', 'role_id']
    for field in required_fields:
        if not data.get(field):
            return Response({
                'success': False,
                'message': f'Campo requerido: {field}'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if email already exists
    if User.objects.filter(email=data['email']).exists():
        return Response({
            'success': False,
            'message': 'Ya existe un usuario con este email'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate role exists
    try:
        user_role = UserRole.objects.get(id=data['role_id'])
    except UserRole.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Rol no válido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        active_status = CommonStatus.objects.get(id=1)
        
        # Create user
        new_user = User.objects.create_user(
            email=data['email'],
            password=data['password'],
            role=user_role,
            status=active_status,
            is_active=True
        )
        
        # Create user data
        UserData.objects.create(
            user=new_user,
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone', ''),
            address=data.get('address', ''),
            city=data.get('city', ''),
            country=data.get('country', 'España'),
            status=active_status
        )
        
        serializer = UserSerializer(new_user)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Usuario creado correctamente'
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user(request, pk):
    """Update user (Admin only)"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    if role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'Solo administradores pueden editar usuarios'
        }, status=status.HTTP_403_FORBIDDEN)
    
    try:
        target_user = User.objects.select_related('data').get(pk=pk)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    data = request.data
    
    # Update email if provided and different
    if data.get('email') and data['email'] != target_user.email:
        if User.objects.filter(email=data['email']).exclude(pk=pk).exists():
            return Response({
                'success': False,
                'message': 'Ya existe un usuario con este email'
            }, status=status.HTTP_400_BAD_REQUEST)
        target_user.email = data['email']
    
    # Update password if provided
    if data.get('password'):
        target_user.set_password(data['password'])
    
    # Update role if provided
    if data.get('role_id'):
        try:
            user_role = UserRole.objects.get(id=data['role_id'])
            target_user.role = user_role
        except UserRole.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Rol no válido'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    target_user.save()
    
    # Update user data
    user_data = target_user.data
    if user_data:
        user_data.first_name = data.get('first_name', user_data.first_name)
        user_data.last_name = data.get('last_name', user_data.last_name)
        user_data.phone = data.get('phone', user_data.phone)
        user_data.address = data.get('address', user_data.address)
        user_data.city = data.get('city', user_data.city)
        user_data.country = data.get('country', user_data.country)
        user_data.save()
    
    serializer = UserSerializer(target_user)
    
    return Response({
        'success': True,
        'data': serializer.data,
        'message': 'Usuario actualizado correctamente'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, pk):
    """Delete user (Admin only) - soft delete"""
    user = request.user
    role_name = user.role.name if user.role else None
    
    if role_name != 'Administrador':
        return Response({
            'success': False,
            'message': 'Solo administradores pueden eliminar usuarios'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Prevent self-deletion
    if user.id == pk:
        return Response({
            'success': False,
            'message': 'No puedes eliminar tu propio usuario'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        target_user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    
    # Soft delete - set status to deleted (id=3)
    try:
        deleted_status = CommonStatus.objects.get(id=3)
        target_user.status = deleted_status
        target_user.is_active = False
        target_user.save()
        
        # Also mark user data as deleted
        if hasattr(target_user, 'data') and target_user.data:
            target_user.data.status = deleted_status
            target_user.data.save()
        
        return Response({
            'success': True,
            'message': 'Usuario eliminado correctamente'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_roles(request):
    """List available user roles"""
    roles = UserRole.objects.filter(status_id=1)
    
    data = []
    for role in roles:
        data.append({
            'id': role.id,
            'name': role.name,
            'description': role.description
        })
    
    return Response({
        'success': True,
        'data': data
    })
