from OctaHomeCore.menumodels import *

class SettingsTopNavBarItem(TopNavBarItem):
	Priority = 90
	DisplayName = "Settings"
	
	@property
	def Link(self):
		return "/Settings/"