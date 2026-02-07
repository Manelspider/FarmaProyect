"""
UserSeeder
Seeds the users and user_data tables
"""
from database.seeders.seeder import Seeder
from core.models import User, UserData, UserRole, CommonStatus


class UserSeeder(Seeder):
    """Seed users and their data"""
    
    def run(self):
        """Execute the seeder"""
        active_status = CommonStatus.objects.get(id=1)
        
        # Get roles
        admin_role = UserRole.objects.get(name='Administrador')
        medico_role = UserRole.objects.get(name='Médico')
        farmaceutico_role = UserRole.objects.get(name='Farmacéutico')
        
        users_data = [
            {
                'email': 'admin_farmaproject@mailinator.com',
                'password': 'FarmaAdmin2026!',
                'role': admin_role,
                'is_staff': True,
                'is_superuser': True,
                'first_name': 'Administrador',
                'last_name': 'FarmaProject',
                'phone': '+34 600 000 001',
                'city': 'Madrid',
                'country': 'España'
            },
            {
                'email': 'medico_farmaproject@mailinator.com',
                'password': 'FarmaMedico2026!',
                'role': medico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'Dr. Juan',
                'last_name': 'Médico',
                'phone': '+34 600 000 002',
                'city': 'Barcelona',
                'country': 'España'
            },
            {
                'email': 'farmaceutico_farmaproject@mailinator.com',
                'password': 'FarmaFarmaceutico2026!',
                'role': farmaceutico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'María',
                'last_name': 'Farmacéutica',
                'phone': '+34 600 000 003',
                'city': 'Valencia',
                'country': 'España'
            },
        ]
        
        created_count = 0
        for user_data in users_data:
            # Extract user data fields
            first_name = user_data.pop('first_name')
            last_name = user_data.pop('last_name')
            phone = user_data.pop('phone')
            city = user_data.pop('city')
            country = user_data.pop('country')
            password = user_data.pop('password')
            is_staff = user_data.pop('is_staff', False)
            is_superuser = user_data.pop('is_superuser', False)
            
            # Create or get user
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults={
                    'role': user_data['role'],
                    'status': active_status,
                    'is_staff': is_staff,
                    'is_superuser': is_superuser,
                    'is_active': True
                }
            )
            
            if created or not user.password:
                user.set_password(password)
                if not created:
                    user.is_staff = is_staff
                    user.is_superuser = is_superuser
                user.save()
            
            # Create or update user data
            UserData.objects.update_or_create(
                user=user,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                    'phone': phone,
                    'city': city,
                    'country': country,
                    'status': active_status
                }
            )
            
            if created:
                created_count += 1
                print(f"  → Created user: {user.email}")
        
        print(f"  ✓ Created {created_count} users (total: {len(users_data)})")
