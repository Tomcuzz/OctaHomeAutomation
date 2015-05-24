from OctaHomeCore.OctaFiles.urls.base import *
from HomeStats.views import *

class HomeStatsOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^HomeStats/$', handleHomeStatsView.as_view(), name='HomeStats'),
		]
