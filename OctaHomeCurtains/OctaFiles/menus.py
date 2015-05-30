from OctaHomeCore.OctaFiles.menus.base import *

#Nav Bar Item
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class CurtainsTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 40
	DisplayName = "Curtains"
	
	@property
	def Link(self):
		return reverse('GenericDeviceSection', kwargs={'deviceType':'Curtains'})