"""
PharmacySeeder
Seeds the pharmacy and pharmacy_data tables with real Canary Islands pharmacies
"""
from decimal import Decimal
from database.seeders.seeder import Seeder
from core.models import Pharmacy, PharmacyData, PharmacyUser, User, CommonStatus


class PharmacySeeder(Seeder):
    """Seed pharmacies with real data from Canary Islands"""
    
    def run(self):
        """Execute the seeder"""
        active_status = CommonStatus.objects.get(id=1)
        
        pharmacies_data = [
            # TENERIFE
            {
                'code': 'FARM-TF-001',
                'name': 'Farmacia Central Santa Cruz',
                'logo': None,
                'address': 'Calle del Castillo, 45',
                'city': 'Santa Cruz de Tenerife',
                'state': 'Santa Cruz de Tenerife',
                'postal_code': '38003',
                'country': 'España',
                'phone': '+34 922 123 456',
                'email': 'central.santacruz@farmaproject.es',
                'license_number': 'TF-2024-0001',
                'latitude': Decimal('28.4682025'),
                'longitude': Decimal('-16.2546063'),
            },
            {
                'code': 'FARM-TF-002',
                'name': 'Farmacia Plaza Weyler',
                'logo': None,
                'address': 'Plaza de Weyler, 12',
                'city': 'Santa Cruz de Tenerife',
                'state': 'Santa Cruz de Tenerife',
                'postal_code': '38003',
                'country': 'España',
                'phone': '+34 922 234 567',
                'email': 'weyler@farmaproject.es',
                'license_number': 'TF-2024-0002',
                'latitude': Decimal('28.4636100'),
                'longitude': Decimal('-16.2518700'),
            },
            {
                'code': 'FARM-TF-003',
                'name': 'Farmacia La Laguna Centro',
                'logo': None,
                'address': 'Calle San Agustín, 28',
                'city': 'San Cristóbal de La Laguna',
                'state': 'Santa Cruz de Tenerife',
                'postal_code': '38201',
                'country': 'España',
                'phone': '+34 922 256 789',
                'email': 'laguna.centro@farmaproject.es',
                'license_number': 'TF-2024-0003',
                'latitude': Decimal('28.4858400'),
                'longitude': Decimal('-16.3159500'),
            },
            {
                'code': 'FARM-TF-004',
                'name': 'Farmacia La Orotava',
                'logo': None,
                'address': 'Calle Carrera, 15',
                'city': 'La Orotava',
                'state': 'Santa Cruz de Tenerife',
                'postal_code': '38300',
                'country': 'España',
                'phone': '+34 922 330 123',
                'email': 'orotava@farmaproject.es',
                'license_number': 'TF-2024-0004',
                'latitude': Decimal('28.3905700'),
                'longitude': Decimal('-16.5231200'),
            },
            # GRAN CANARIA
            {
                'code': 'FARM-GC-001',
                'name': 'Farmacia Las Canteras',
                'logo': None,
                'address': 'Paseo de Las Canteras, 78',
                'city': 'Las Palmas de Gran Canaria',
                'state': 'Las Palmas',
                'postal_code': '35010',
                'country': 'España',
                'phone': '+34 928 345 678',
                'email': 'canteras@farmaproject.es',
                'license_number': 'GC-2024-0001',
                'latitude': Decimal('28.1374900'),
                'longitude': Decimal('-15.4362100'),
            },
            {
                'code': 'FARM-GC-002',
                'name': 'Farmacia Triana',
                'logo': None,
                'address': 'Calle Mayor de Triana, 55',
                'city': 'Las Palmas de Gran Canaria',
                'state': 'Las Palmas',
                'postal_code': '35002',
                'country': 'España',
                'phone': '+34 928 456 789',
                'email': 'triana@farmaproject.es',
                'license_number': 'GC-2024-0002',
                'latitude': Decimal('28.1028400'),
                'longitude': Decimal('-15.4161300'),
            },
        ]
        
        created_count = 0
        pharmacies_list = []
        
        for ph_data in pharmacies_data:
            code = ph_data.pop('code')
            
            pharmacy, created = Pharmacy.objects.get_or_create(
                code=code,
                defaults={'status': active_status}
            )
            
            pharmacies_list.append(pharmacy)
            
            if created:
                created_count += 1
                print(f"  → Created pharmacy: {code}")
            
            PharmacyData.objects.update_or_create(
                pharmacy=pharmacy,
                defaults={
                    **ph_data,
                    'status': active_status
                }
            )
        
        # Assign pharmacists to pharmacies
        farmaceuticos = User.objects.filter(role__name='Farmacéutico').order_by('id')
        for i, farmaceutico in enumerate(farmaceuticos):
            if i < len(pharmacies_list):
                pharmacy = pharmacies_list[i]
                PharmacyUser.objects.get_or_create(
                    pharmacy=pharmacy,
                    user=farmaceutico,
                    defaults={
                        'is_manager': True,
                        'status': active_status
                    }
                )
                print(f"  → Assigned {farmaceutico.email} to {pharmacy.code}")
        
        print(f"  ✓ Created {created_count} pharmacies (total: {len(pharmacies_data)})")
