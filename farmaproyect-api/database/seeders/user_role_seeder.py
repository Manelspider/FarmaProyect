"""
UserRoleSeeder
Seeds the tbl_user_roles table
"""
from database.seeders.seeder import Seeder
from core.models import UserRole, CommonStatus


class UserRoleSeeder(Seeder):
    """Seed user roles"""
    
    def run(self):
        """Execute the seeder"""
        active_status = CommonStatus.objects.get(id=1)
        
        roles = [
            {
                'name': 'Administrador',
                'description': 'Rol con acceso completo al sistema',
                'status': active_status
            },
            {
                'name': 'Médico',
                'description': 'Rol para médicos con acceso a prescripciones',
                'status': active_status
            },
            {
                'name': 'Farmacéutico',
                'description': 'Rol para farmacéuticos con acceso a dispensación',
                'status': active_status
            },
        ]
        
        created_count = 0
        for role_data in roles:
            role, created = UserRole.objects.get_or_create(
                name=role_data['name'],
                defaults={
                    'description': role_data['description'],
                    'status': role_data['status']
                }
            )
            if created:
                created_count += 1
        
        print(f"  ✓ Created {created_count} roles (total: {len(roles)})")
