from OctaHomeCore.OctaFiles.menus.base import *

class HomeStatsTopNavBarItem(TopNavBarItem):
	Priority = 20
	DisplayName = "Home Stats"
	
	@property
	def Link(self):
		return reverse('HomeStats')