from OctaHomeCore.OctaFiles.menus.base import *

#Nav Bar Item
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class LightsTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 10
	DisplayName = "Lights"
	
	@property
	def Link(self):
		return reverse('GenericDeviceSection', kwargs={'deviceType':'Lights'})