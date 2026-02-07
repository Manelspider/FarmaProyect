"""
CommonStatusSeeder
Seeds the tbl_common_status table
"""
from database.seeders.seeder import Seeder
from core.models import CommonStatus


class CommonStatusSeeder(Seeder):
    """Seed common status records"""
    
    def run(self):
        """Execute the seeder"""
        statuses = [
            {'id': 1, 'name': 'active'},
            {'id': 2, 'name': 'inactive'},
            {'id': 3, 'name': 'deleted'},
            {'id': 4, 'name': 'sended'},
            {'id': 5, 'name': 'received'},
        ]
        
        created_count = 0
        for status_data in statuses:
            status, created = CommonStatus.objects.get_or_create(
                id=status_data['id'],
                defaults={'name': status_data['name']}
            )
            if created:
                created_count += 1
        
        print(f"  ✓ Created {created_count} statuses (total: {len(statuses)})")
