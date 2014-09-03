from Account.models import *
from Weather.views import * 

updateLocations()

user = CustomUser.objects.create_user('admin@admin.com', 'N/A', 'N/A', 'Fish01')
user.username = 'admin@admin.com'
user.first_name = 'Thomas'
user.last_name = 'Cousin'
user.is_active = True
user.is_superuser = True
user.home_location = '352409'

user.save()