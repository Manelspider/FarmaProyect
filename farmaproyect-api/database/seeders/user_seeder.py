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
            # === ADMINISTRADORES ===
            {
                'email': 'manuelglezpersonal@gmail.com',
                'password': 'Pantalla1*',
                'role': admin_role,
                'is_staff': True,
                'is_superuser': True,
                'first_name': 'Manuel',
                'last_name': 'González',
                'phone': '+34 600 100 001',
                'city': 'Santa Cruz de Tenerife',
                'country': 'España'
            },
            {
                'email': 'FarmaAdmin@mailinator.com',
                'password': 'Pantalla1*',
                'role': admin_role,
                'is_staff': True,
                'is_superuser': True,
                'first_name': 'Carlos',
                'last_name': 'Administrador',
                'phone': '+34 600 100 002',
                'city': 'Las Palmas de Gran Canaria',
                'country': 'España'
            },
            # === MÉDICOS ===
            {
                'email': 'dr.rodriguez@farmaproject.es',
                'password': 'Pantalla1*',
                'role': medico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'Antonio',
                'last_name': 'Rodríguez García',
                'phone': '+34 600 200 001',
                'city': 'Santa Cruz de Tenerife',
                'country': 'España'
            },
            {
                'email': 'dra.martinez@farmaproject.es',
                'password': 'Pantalla1*',
                'role': medico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'Laura',
                'last_name': 'Martínez López',
                'phone': '+34 600 200 002',
                'city': 'La Laguna',
                'country': 'España'
            },
            {
                'email': 'dr.sanchez@farmaproject.es',
                'password': 'Pantalla1*',
                'role': medico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'Pedro',
                'last_name': 'Sánchez Hernández',
                'phone': '+34 600 200 003',
                'city': 'Las Palmas de Gran Canaria',
                'country': 'España'
            },
            # === FARMACÉUTICOS ===
            {
                'email': 'maria.farmacia@farmaproject.es',
                'password': 'Pantalla1*',
                'role': farmaceutico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'María',
                'last_name': 'Pérez Alonso',
                'phone': '+34 600 300 001',
                'city': 'Santa Cruz de Tenerife',
                'country': 'España',
                'pharmacy_index': 0
            },
            {
                'email': 'juan.farmacia@farmaproject.es',
                'password': 'Pantalla1*',
                'role': farmaceutico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'Juan',
                'last_name': 'García Morales',
                'phone': '+34 600 300 002',
                'city': 'Santa Cruz de Tenerife',
                'country': 'España',
                'pharmacy_index': 1
            },
            {
                'email': 'carmen.farmacia@farmaproject.es',
                'password': 'Pantalla1*',
                'role': farmaceutico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'Carmen',
                'last_name': 'Díaz Rodríguez',
                'phone': '+34 600 300 003',
                'city': 'Las Palmas de Gran Canaria',
                'country': 'España',
                'pharmacy_index': 2
            },
            {
                'email': 'david.farmacia@farmaproject.es',
                'password': 'Pantalla1*',
                'role': farmaceutico_role,
                'is_staff': False,
                'is_superuser': False,
                'first_name': 'David',
                'last_name': 'Suárez Medina',
                'phone': '+34 600 300 004',
                'city': 'La Orotava',
                'country': 'España',
                'pharmacy_index': 3
            },
        ]
        
        created_count = 0
        for user_data in users_data:
            first_name = user_data.pop('first_name')
            last_name = user_data.pop('last_name')
            phone = user_data.pop('phone')
            city = user_data.pop('city')
            country = user_data.pop('country')
            password = user_data.pop('password')
            is_staff = user_data.pop('is_staff', False)
            is_superuser = user_data.pop('is_superuser', False)
            user_data.pop('pharmacy_index', None)
            
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
