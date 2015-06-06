from OctaHomeCore.OctaFiles.urls.base import *
from OctaHomeHome.views import *

class OctaHomeHomeOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^$', handleHomeView.as_view(), name='Home'),
		]
