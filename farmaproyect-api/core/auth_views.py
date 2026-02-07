"""
LEGACY FILE - Auth views ahora en app/Http/Controllers/AuthController.py
Mantiene compatibilidad con código antiguo
"""
from app.Http.Controllers.AuthController import (
    login,
    logout,
    me,
    change_password,
    refresh_token,
    verify_token
)

__all__ = [
    'login',
    'logout',
    'me',
    'change_password',
    'refresh_token',
    'verify_token',
]
