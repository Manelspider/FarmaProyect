"""
Base Seeder class
Similar to Laravel's Seeder base class
"""
from abc import ABC, abstractmethod


class Seeder(ABC):
    """Abstract base class for seeders"""
    
    @abstractmethod
    def run(self):
        """Run the seeder"""
        pass
    
    def call(self, seeders):
        """Call multiple seeders"""
        for seeder_class in seeders:
            seeder = seeder_class()
            print(f"\n→ Running {seeder_class.__name__}...")
            seeder.run()
