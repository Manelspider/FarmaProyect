"""
Script para limpiar la base de datos y ejecutar seeders con datos de prueba
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from database.seeders.database_seeder import DatabaseSeeder


def clean_database():
    """Limpia los datos de las tablas (mantiene estructura)"""
    print("\n🗑️  Limpiando base de datos...")
    print("=" * 50)
    
    # Orden de limpieza (respetando foreign keys)
    tables_to_clean = [
        'tbl_notification_messages',
        'tbl_notifications',
        'tbl_prescriptions',
        'tbl_pharmacy_users',
        'tbl_pharmacy_data',
        'tbl_pharmacy',
        'tbl_user_data',
        'tbl_users',
        'tbl_notification_types',
        'tbl_user_roles',
        'tbl_common_status',
    ]
    
    with connection.cursor() as cursor:
        # Disable foreign key checks temporarily
        cursor.execute("SET session_replication_role = replica;")
        
        for table in tables_to_clean:
            try:
                cursor.execute(f"DELETE FROM {table};")
                # Reset sequence
                cursor.execute(f"ALTER SEQUENCE IF EXISTS {table}_id_seq RESTART WITH 1;")
                print(f"  ✓ Limpiada tabla: {table}")
            except Exception as e:
                print(f"  ⚠ Error en {table}: {str(e)}")
        
        # Re-enable foreign key checks
        cursor.execute("SET session_replication_role = DEFAULT;")
    
    print("=" * 50)
    print("✅ Limpieza completada!\n")


if __name__ == '__main__':
    clean_database()
    
    # Run seeders
    seeder = DatabaseSeeder()
    seeder.run()
