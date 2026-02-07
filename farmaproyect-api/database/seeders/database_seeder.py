"""
DatabaseSeeder
Main seeder class that calls all other seeders
"""
from database.seeders.seeder import Seeder
from database.seeders.common_status_seeder import CommonStatusSeeder
from database.seeders.user_role_seeder import UserRoleSeeder
from database.seeders.user_seeder import UserSeeder
from database.seeders.notification_type_seeder import NotificationTypeSeeder
from database.seeders.pharmacy_seeder import PharmacySeeder
from database.seeders.notification_seeder import NotificationSeeder


class DatabaseSeeder(Seeder):
    """Main database seeder"""
    
    def run(self):
        """Execute all seeders in the correct order"""
        print("\n🌱 Seeding database...")
        print("=" * 50)
        
        # Call seeders in dependency order
        self.call([
            CommonStatusSeeder,
            UserRoleSeeder,
            UserSeeder,
            NotificationTypeSeeder,
            PharmacySeeder,
            NotificationSeeder,
        ])
        
        print("=" * 50)
        print("✅ Database seeding completed!\n")
