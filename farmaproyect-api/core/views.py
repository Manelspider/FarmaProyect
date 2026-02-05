from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    """Health check endpoint"""
    return Response({
        'status': 'ok',
        'message': 'API is healthy'
    }, status=status.HTTP_200_OK)


class StatusViewSet(viewsets.ViewSet):
    """API status endpoint"""
    
    def list(self, request):
        return Response({
            'status': 'ok',
            'message': 'API is running'
        }, status=status.HTTP_200_OK)
