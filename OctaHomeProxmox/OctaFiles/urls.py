from OctaHomeCore.OctaFiles.urls.base import *

class OctaHomeProxmoxOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^Proxmox/', 'OctaHomeProxmox.views.ProxmoxMain', name='Proxmox'),
		]