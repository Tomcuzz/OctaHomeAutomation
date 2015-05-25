from OctaHomeCore.OctaFiles.menus.base import *
from OctaHomeCore.views.settings import *

############
# Top Menu #
############
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"
	
	def isActive(self):
		if self.Request.path.startswith("/Device/Display/"):
			return True
		return False

class DeviceTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 0
	DisplayName = "All"
	
	@property
	def Link(self):
		return reverse('GenericDeviceSection', kwargs={'deviceType':'All'})	

class SettingsTopNavBarItem(TopNavBarItem):
	Priority = 90
	DisplayName = "Settings"
	
	@property
	def Link(self):
		return reverse('Settings')
