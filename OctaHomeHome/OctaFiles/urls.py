from OctaHomeCore.OctaFiles.urls.base import *
from Home.views import *

class HomeOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^$', handleHomeView.as_view(), name='Home'),
		]
