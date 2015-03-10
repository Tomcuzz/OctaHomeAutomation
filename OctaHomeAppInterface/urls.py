from django.conf.urls import url
from views import *

urlpatterns = [
	url(r'^Auth/(?P<command>\w+)/$', handleDeviceLoginCommand.as_view(), name='DeviceLogin')
]
