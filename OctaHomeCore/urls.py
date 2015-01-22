from django.conf.urls import url
from devicecommands import *
from messagecommands import *

urlpatterns = [
	url(r'^command/device/Add/$', handleAddDeviceCommand.as_view(), name='AddDeviceCommand'),
	url(r'^command/device/single/(?P<command>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleSingleDeviceCommand.as_view(), name='SingleDeviceCommand'),
	
	url(r'^messages/(?P<command>\w+)/$', handleMessageCommand.as_view(), name='MessagesCommand'),
]
