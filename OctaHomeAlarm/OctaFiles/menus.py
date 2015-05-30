from OctaHomeCore.OctaFiles.menus.base import *

#Nav Bar Item
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class AlarmTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 20
	DisplayName = "Alarm"
	
	@property
	def Link(self):
		return reverse('Alarm')