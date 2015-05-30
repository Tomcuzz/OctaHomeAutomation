from OctaHomeCore.OctaFiles.menus.base import *

#Nav Bar Item
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class AudioVisualTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 60
	DisplayName = "Audio/Visual"
	
	@property
	def Link(self):
		return reverse('GenericDeviceSection', kwargs={'deviceType':'AudioVisual'})