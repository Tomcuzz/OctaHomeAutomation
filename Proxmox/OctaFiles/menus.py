from OctaHomeCore.menumodels import *

#Nav Bar Item
class NetworkingTopNavBarItem(TopNavBarItem):
	Priority = 50
	DisplayName = "Networking"
	Link = "#"

class ProxmoxTopNavBarItem(TopNavBarItem):
	ParentItem = "Networking"
	Priority = 10
	DisplayName = "Proxmox"
	
	@property
	def Link(self):
		return reverse('Proxmox')