from OctaHomeCore.OctaFiles.urls.base import *
from OctaHomeCore.views.auth import *

class AuthOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^Auth/Login/', handleLoginView.as_view(), name='Login'),
			url(r'^Auth/LogOut/', handleLogOutView.as_view(), name='LogOut'),
		]
