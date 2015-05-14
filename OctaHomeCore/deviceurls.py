from django.conf.urls import url
from devicecommands import *
from deviceviews import *

urlpatterns = [
	url(r'^Add/$', handleGenericAddDeviceView.as_view(), name='AddDeviceView'),
	url(r'^Add/(?P<slug>\w+)/$', handleGenericAddDeviceView.as_view(), name='AddDeviceView'),
	url(r'^AddComplete/$', handleAddDeviceCommand.as_view(), name='AddDeviceCommand'),
	url(r'^Command/device/single/(?P<command>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleSingleDeviceCommand.as_view(), name='SingleDeviceCommand'),
	url(r'^Display/$', handleGenericDeviceView.as_view(), name='GenericDeviceSection'),
	url(r'^Display/(?P<deviceType>\w+)/$', handleGenericDeviceView.as_view(), name='GenericDeviceSection'),
	url(r'^Display/(?P<deviceType>\w+)/(?P<house>\w+)/$', handleGenericDeviceView.as_view(), name='GenericDeviceSection'),
	url(r'^Display/(?P<deviceType>\w+)/(?P<house>\w+)/(?P<room>\w+)/$', handleGenericDeviceView.as_view(), name='GenericDeviceSection'),
]
