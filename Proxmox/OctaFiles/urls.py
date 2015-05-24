from OctaHomeCore.OctaFiles.urls.base import *

class ProxmoxOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^Proxmox/', 'Proxmox.views.ProxmoxMain', name='Proxmox'),
		]