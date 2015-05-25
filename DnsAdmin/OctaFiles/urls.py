from OctaHomeCore.OctaFiles.urls.base import *
from DnsAdmin.views import *

class HomeStatsOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^DnsAdmin/$', handleDnsAdminView.as_view(), name='DnsAdmin'),
			url(r'^DnsAdmin/(?P<domain>\w+)/$', handleDnsAdminView.as_view(), name='DnsAdmin'),
		]
