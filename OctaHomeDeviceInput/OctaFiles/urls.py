from OctaHomeCore.OctaFiles.urls.base import *

class DeviceInputOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^DeviceInput/$', 'Proxmox.views.ProxmoxMain', name='DeviceInput'),
		]
