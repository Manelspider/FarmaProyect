"""
LEGACY FILE - Modelos ahora en app/Models/
Mantiene compatibilidad con Django ORM
"""

# Importar todos los modelos desde app
from app.Models import *

# Django busca automáticamente models.py en las apps registradas
# Este archivo mantiene compatibilidad importando todo desde app/Models/
