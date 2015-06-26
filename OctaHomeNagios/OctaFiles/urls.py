from OctaHomeCore.OctaFiles.urls.base import *
from OctaHomeNagios.views import *

class NagiosOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^Nagios/$', handleNagiosView.as_view(), name='Nagios'),
			url(r'^Nagios/Service/(?P<service>\w+)/$', handleNagiosView.as_view(), name='Nagios'),
			url(r'^Nagios/Servers/$', handleNagiosView.as_view(), name='NagiosServer'),
			url(r'^Nagios/Server/(?P<server>\w+)/$', handleNagiosView.as_view(), name='NagiosServer'),
		]
