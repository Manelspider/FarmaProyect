"""
Seed command
Runs database seeders similar to Laravel's php artisan db:seed
"""
from django.core.management.base import BaseCommand
from database.seeders.database_seeder import DatabaseSeeder
import os
import django


class Command(BaseCommand):
    help = 'Seed the database with initial data'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--class',
            type=str,
            help='Specific seeder class to run',
        )
    
    def handle(self, *args, **options):
        """Execute the seed command"""
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
        django.setup()
        
        seeder_class = options.get('class')
        
        if seeder_class:
            # Run specific seeder
            try:
                module_path = f"database.seeders.{seeder_class.lower()}"
                module = __import__(module_path, fromlist=[seeder_class])
                seeder = getattr(module, seeder_class)()
                self.stdout.write(self.style.SUCCESS(f'\n🌱 Running {seeder_class}...'))
                seeder.run()
                self.stdout.write(self.style.SUCCESS(f'✅ {seeder_class} completed!\n'))
            except (ImportError, AttributeError) as e:
                self.stdout.write(self.style.ERROR(f'❌ Seeder class not found: {seeder_class}'))
                self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
        else:
            # Run all seeders via DatabaseSeeder
            seeder = DatabaseSeeder()
            seeder.run()
