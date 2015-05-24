from OctaHomeCore.OctaFiles.urls.base import *
from OctaHomeCore.devicecommands import *
from OctaHomeCore.deviceviews import *

class DeviceOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^Device/Add/$', handleGenericAddDeviceView.as_view(), name='AddDeviceView'),
			url(r'^Device/Add/(?P<slug>\w+)/$', handleGenericAddDeviceView.as_view(), name='AddDeviceView'),
			url(r'^Device/AddComplete/$', handleAddDeviceCommand.as_view(), name='AddDeviceCommand'),
			url(r'^Device/Command/device/single/(?P<command>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleSingleDeviceCommand.as_view(), name='SingleDeviceCommand'),
			url(r'^Device/Display/$', handleGenericDeviceView.as_view(), name='GenericDeviceSection'),
			url(r'^Device/Display/(?P<deviceType>\w+)/$', handleGenericDeviceView.as_view(), name='GenericDeviceSection'),
			url(r'^Device/Display/(?P<deviceType>\w+)/(?P<house>\w+)/$', handleGenericDeviceView.as_view(), name='GenericDeviceSection'),
			url(r'^Device/Display/(?P<deviceType>\w+)/(?P<house>\w+)/(?P<room>\w+)/$', handleGenericDeviceView.as_view(), name='GenericDeviceSection'),
		]
