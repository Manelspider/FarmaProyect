"""
API Views para autenticación con JWT
Laravel-style Controller
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.views.decorators.http import require_http_methods

from app.Models import User
from app.Http.Serializers import UserSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
@require_http_methods(['POST'])
def login(request):
    """
    Endpoint de login con JWT
    Parámetros requeridos: email, password
    Retorna: access_token, refresh_token, user data
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Validar campos requeridos
    if not email or not password:
        return Response(
            {
                'success': False,
                'message': 'Email y contraseña son requeridos'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Buscar usuario por email
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {
                'success': False,
                'message': 'Usuario o contraseña incorrectos'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verificar contraseña
    if not user.check_password(password):
        return Response(
            {
                'success': False,
                'message': 'Usuario o contraseña incorrectos'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Verificar que el usuario esté activo
    if not user.is_active:
        return Response(
            {
                'success': False,
                'message': 'Usuario inactivo. Contacta con administración'
            },
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Actualizar last_login
    user.update_last_login()
    
    # Generar tokens JWT
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    # Serializar usuario
    user_serializer = UserSerializer(user)
    
    return Response(
        {
            'success': True,
            'message': 'Inicio de sesión exitoso',
            'user': user_serializer.data,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer'
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
@require_http_methods(['POST'])
def refresh_token(request):
    """
    Refrescar access token usando refresh token
    Parámetros requeridos: refresh_token
    Retorna: nuevo access_token y refresh_token
    """
    refresh_token = request.data.get('refresh_token')
    
    if not refresh_token:
        return Response(
            {
                'success': False,
                'message': 'Refresh token requerido'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Validar refresh token y generar nuevos tokens
        refresh = RefreshToken(refresh_token)
        
        # Obtener usuario del token
        user_id = refresh.get('user_id')
        user = User.objects.get(id=user_id)
        
        # Generar nuevos tokens
        new_refresh = RefreshToken.for_user(user)
        access_token = str(new_refresh.access_token)
        new_refresh_token = str(new_refresh)
        
        return Response(
            {
                'success': True,
                'message': 'Token refrescado exitosamente',
                'access_token': access_token,
                'refresh_token': new_refresh_token,
                'token_type': 'Bearer'
            },
            status=status.HTTP_200_OK
        )
    
    except (TokenError, InvalidToken) as e:
        return Response(
            {
                'success': False,
                'message': 'Token inválido o expirado'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )
    except User.DoesNotExist:
        return Response(
            {
                'success': False,
                'message': 'Usuario no encontrado'
            },
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@require_http_methods(['POST'])
def logout(request):
    """
    Endpoint de logout con JWT
    Invalida el refresh token (blacklist)
    Parámetros opcionales: refresh_token
    """
    try:
        refresh_token = request.data.get('refresh_token')
        
        if refresh_token:
            # Blacklist el refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()
        
        return Response(
            {
                'success': True,
                'message': 'Sesión cerrada correctamente'
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        # Aunque falle el blacklist, consideramos el logout exitoso
        return Response(
            {
                'success': True,
                'message': 'Sesión cerrada correctamente'
            },
            status=status.HTTP_200_OK
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    Obtener datos del usuario autenticado via JWT
    """
    user_serializer = UserSerializer(request.user)
    return Response(
        {
            'success': True,
            'user': user_serializer.data
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@require_http_methods(['POST'])
def change_password(request):
    """
    Cambiar contraseña del usuario autenticado
    Parámetros requeridos: current_password, new_password
    Invalida todos los tokens anteriores
    """
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    # Validar campos requeridos
    if not current_password or not new_password:
        return Response(
            {
                'success': False,
                'message': 'Contraseña actual y nueva son requeridas'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validar longitud de nueva contraseña
    if len(new_password) < 8:
        return Response(
            {
                'success': False,
                'message': 'La nueva contraseña debe tener al menos 8 caracteres'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verificar contraseña actual
    if not request.user.check_password(current_password):
        return Response(
            {
                'success': False,
                'message': 'Contraseña actual incorrecta'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Establecer nueva contraseña
    request.user.set_password(new_password)
    request.user.save()
    
    # Generar nuevos tokens JWT
    refresh = RefreshToken.for_user(request.user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    return Response(
        {
            'success': True,
            'message': 'Contraseña cambiada exitosamente',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer'
        },
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
@require_http_methods(['POST'])
def verify_token(request):
    """
    Verificar si un access token es válido
    Parámetros requeridos: token
    """
    token = request.data.get('token')
    
    if not token:
        return Response(
            {
                'success': False,
                'message': 'Token requerido'
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        
        # Validar token
        AccessToken(token)
        
        return Response(
            {
                'success': True,
                'message': 'Token válido'
            },
            status=status.HTTP_200_OK
        )
    
    except (TokenError, InvalidToken):
        return Response(
            {
                'success': False,
                'message': 'Token inválido o expirado'
            },
            status=status.HTTP_401_UNAUTHORIZED
        )
