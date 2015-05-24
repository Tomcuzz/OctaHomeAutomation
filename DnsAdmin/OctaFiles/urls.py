from OctaHomeCore.OctaFiles.urls.base import *
from DnsAdmin.views import *

class HomeStatsOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^DnsAdmin/', 'DnsAdmin.views.DnsAdminMain', name='DnsAdmin'),
		]
