from OctaHomeCore.OctaFiles.menus.base import *

#Nav Bar Item
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class SecurityTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 30
	DisplayName = "Security"
	
	@property
	def Link(self):
		return reverse('GenericDeviceSection', kwargs={'deviceType':'Security'})