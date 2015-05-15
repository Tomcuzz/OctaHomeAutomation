from OctaHomeCore.menumodels import *

#Nav Bar Item
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class TempControlTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 50
	DisplayName = "Temperature"
	
	@property
	def Link(self):
		return reverse('TempControl')