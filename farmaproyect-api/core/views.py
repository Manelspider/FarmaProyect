"""
LEGACY FILE - Views ahora en app/Http/Controllers/
Mantiene compatibilidad con código antiguo
"""
from app.Http.Controllers.ApiController import (
    health,
    StatusViewSet
)

__all__ = [
    'health',
    'StatusViewSet',
]
