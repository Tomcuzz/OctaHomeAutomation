from OctaHomeCore.OctaFiles.menus import *

class DeviceUsersSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 60
	DisplayName = "Device Logins"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'DeviceUsers'})