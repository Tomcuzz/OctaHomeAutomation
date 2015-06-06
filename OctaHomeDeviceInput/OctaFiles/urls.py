from OctaHomeCore.OctaFiles.urls.base import *

class DeviceInputOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^DeviceInput/$', 'OctaHomeProxmox.views.ProxmoxMain', name='DeviceInput'),
		]
