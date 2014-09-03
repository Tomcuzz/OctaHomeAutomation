from django.core.management.base import BaseCommand, CommandError

from Account.models import *
from Weather.views import * 

class SetUpDatabase(BaseCommand):

    help = "This initialises a user account and weather locations"

    def add_arguments(self, parser):
        parser.add_argument('Setup', nargs='+', type=int)

    def handle(self, *args, **options):
		updateLocations()
		
		user = CustomUser.objects.create_user('admin@admin.com', 'N/A', 'N/A', 'Fish01')
		user.username = 'admin@admin.com'
		user.first_name = 'N/A'
		user.last_name = 'N/A'
		user.is_active = True
		user.is_superuser = True
		user.home_location = '352409'
		
		user.save()