from OctaHomeCore.OctaFiles.urls.base import *
from OctaHomeAppInterface.authviews import *
from OctaHomeAppInterface.mainviews import *

class AppOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^App/Device/Command/Single/(?P<command>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleAppSingleDeviceCommand.as_view(), name='AppDeviceCommand'),
			url(r'^App/Auth/(?P<command>\w+)/$', handleDeviceLoginCommand.as_view(), name='DeviceLogin'),
			url(r'^App/Command/(?P<command>\w+)/$', handleAppCommandCommand.as_view(), name='AppCommand')
		]
