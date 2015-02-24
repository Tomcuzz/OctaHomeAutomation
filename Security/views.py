from OctaHomeCore.menumodels import *

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
		return reverse('Security')