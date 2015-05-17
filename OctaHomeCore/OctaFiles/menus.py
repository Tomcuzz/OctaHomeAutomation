from OctaHomeCore.menumodels import *
from OctaHomeCore.settingviews import *

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

###################
# Device Side Bar #
###################
class DeviceSideBarMenuObjectProvider(RoomClassMenuObjectProvider):
	def getPreItems(self):
		allObject = DynamicMenuItem()
		allObject.DisplayName = "All"
		
		if self.SectionName != "":
			allObject.LinkValue = reverse('GenericDeviceSection', kwargs={'deviceType':self.SectionName})
		else:
			allObject.LinkValue = reverse('GenericDeviceSection', kwargs={'deviceType':'All'})
		
		allObject.ViewPartial = self.ItemPartial
		allObject.Request = self.Request
		return [allObject]
	
	def getPostItems(self):
		allObject = DynamicMenuItem()
		allObject.DisplayName = "Add New Device"
		
		if self.SectionName != "":
			allObject.LinkValue = reverse('AddDeviceView', kwargs={'slug':self.SectionName})
		else:
			allObject.LinkValue = reverse('AddDeviceView', kwargs={'slug':'All'})
		
		allObject.ViewPartial = self.ItemPartial
		allObject.Request = self.Request
		return [allObject]
	
	def getUrlForHouse(self, house):
		if self.SectionName != "":
			return reverse('GenericDeviceSection', kwargs={'deviceType':self.SectionName, 'house':house.pk})
		else:
			return reverse('GenericDeviceSection', kwargs={'deviceType':'All', 'house':house.pk})
	
	def getUrlForRoom(self, room):
		if self.SectionName != "":
			return reverse('GenericDeviceSection', kwargs={'deviceType':self.SectionName, 'house':room.Home.pk, 'room':room.pk})
		else:
			return reverse('GenericDeviceSection', kwargs={'deviceType':'All', 'house':room.Home.pk, 'room':room.pk})

class DeviceSideBarMenu(Menu):
	Name = "DeviceSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuArea/SideNavBar.html"
	MenuObjectProvider = DeviceSideBarMenuObjectProvider()

#####################
# Settings Side Bar #
#####################
class SettingsSideNavBar(Menu):
	Name = "SettingsSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuArea/SideNavBar.html"

class SettingsSideNavBarItem(MenuItem):
	MenuName = "SettingsSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuItems/SideNavBarItem.html"

class AccountSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 10
	DisplayName = "Account"
	
	@property
	def Link(self):
		return reverse('Settings')

class EventsSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 20
	DisplayName = "Events"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'Events'})

class ActionGroupsSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 30
	DisplayName = "Action Groups"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'ActionGroups'})

class AGConditionsSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 40
	DisplayName = "Action Group Conditions"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'AGConditions'})

class ActionsSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 50
	DisplayName = "Actions"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'Actions'})

class EditUsersSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 70
	DisplayName = "Edit Users"
	def isShown(self):
		if self.Request != None:
			return self.Request.user.is_superuser
		return True
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'EditUsers'})

class AddUserSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 80
	DisplayName = "Add User"
	def isShown(self):
		if self.Request != None:
			return self.Request.user.is_superuser
		return True
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'AddUser'})

class LogOutSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 90
	DisplayName = "Log Out"
	
	@property
	def Link(self):
		return reverse('LogOut')