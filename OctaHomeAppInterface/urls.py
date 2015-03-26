from django.conf.urls import url
from authviews import *
from mainviews import *

urlpatterns = [
	url(r'^Auth/(?P<command>\w+)/$', handleDeviceLoginCommand.as_view(), name='DeviceLogin'),
	url(r'^Command/(?P<command>\w+)/$', handleAppCommandCommand.as_view(), name='AppCommand')
]
