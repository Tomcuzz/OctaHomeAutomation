from django.core.management.base import NoArgsCommand, make_option

from Account.models import *
from Weather.views import * 

class SetUpDatabase(NoArgsCommand):

    help = "This initialises a user account and weather locations"

    option_list = NoArgsCommand.option_list + (
        make_option('--verbose', action='store_true'),
    )

    def handle_noargs(self, **options):
		updateLocations()
		
		user = CustomUser.objects.create_user('admin@admin.com', 'N/A', 'N/A', 'Fish01')
		user.username = 'admin@admin.com'
		user.first_name = 'N/A'
		user.last_name = 'N/A'
		user.is_active = True
		user.is_superuser = True
		user.home_location = '352409'
		
		user.save()