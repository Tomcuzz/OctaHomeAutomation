from OctaHomeCore.OctaFiles.urls.base import *
from TempControl.views import *

class TempControlOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^TempControl/command/(?P<command>\w+)/$', handleTempCommand.as_view(), name='TempControlCommandWithOutDevice'),
			url(r'^TempControl/command/(?P<command>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleTempCommand.as_view(), name='TempControlCommand'),
			url(r'^TempControl/command/(?P<command>\w+)/(?P<house>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleTempCommand.as_view(), name='TempControlCommand'),
			url(r'^TempControl/command/(?P<command>\w+)/(?P<house>\w+)/(?P<room>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleTempCommand.as_view(), name='TempControlCommand'),
			
			url(r'^TempControl/page/(?P<page>\w+)/$', handleTempView.as_view(), name='TempControlPage'),
			url(r'^TempControl/page/(?P<page>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleTempCommand.as_view(), name='TempControlPage'),
			url(r'^TempControl/page/(?P<house>\w+)/(?P<page>\w+)/$', handleTempView.as_view(), name='TempControlPage'),
			url(r'^TempControl/page/(?P<house>\w+)/(?P<room>\w+)/(?P<page>\w+)/$', handleTempView.as_view(), name='TempControlPage'),
			
			url(r'^TempControl/$', handleTempView.as_view(), name='TempControl'),
			url(r'^TempControl/(?P<house>\w+)/$', handleTempView.as_view(), name='TempControl'),
			url(r'^TempControl/(?P<house>\w+)/(?P<room>\w+)/$', handleTempView.as_view(), name='TempControl'),
			url(r'^TempControl/(?P<house>\w+)/(?P<room>\w+)/(?P<deviceType>\w+)/(?P<deviceId>\d+)/$', handleTempView.as_view(), name='TempControl'),
		]
