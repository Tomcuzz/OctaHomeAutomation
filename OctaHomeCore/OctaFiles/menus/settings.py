from OctaHomeCore.OctaFiles.menus.base import *

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