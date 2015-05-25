from OctaHomeCore.OctaFiles.menus.base import *

class HomeTopNavBarItem(TopNavBarItem):
	Priority = 10
	DisplayName = "Home"
	
	def isActive(self):
		if self.Link == self.Request.path:
			return True
		return False
	
	@property
	def Link(self):
		return reverse('Home')