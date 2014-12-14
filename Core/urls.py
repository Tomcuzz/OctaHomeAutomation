from django.conf.urls import url
from devicecommands import *

urlpatterns = [
	url(r'^command/device/single/(?P<command>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleSingleDeviceCommand.as_view(), name='SingleDeviceCommand'),
]
