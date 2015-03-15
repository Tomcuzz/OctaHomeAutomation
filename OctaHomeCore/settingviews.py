from django.conf import settings
import json

from OctaHomeCore.baseviews import *
from OctaHomeCore.basemodels import *
from OctaHomeCore.models import *
from OctaHomeCore.menumodels import *
from OctaHomeCore.weathermodels import *
from OctaHomeCore.helpers import *
from OctaHomeCore.authmodels import *
from OctaHomeCore.authviews import *
from OctaHomeAppInterface.models import *

class SettingsTopNavBarItem(TopNavBarItem):
	Priority = 90
	DisplayName = "Settings"
	
	@property
	def Link(self):
		return "/Settings/"


class SettingsSideNavBar(Menu):
	Name = "SettingsSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuArea/SideNavBar.html"

class SettingsSideNavBarItem(MenuItem):
	MenuName = "SettingsSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuItems/SideNavBarItem.html"


class SettingsPage(NamedSubclassableView):
	ViewPartial = ""
	ViewHandler = None
	
	def getViewParameters(self):
		return {}

class SettingsCommand(NamedSubclassableView):
	ViewHandler = None
	
	def RunCommand(self):
		return ""



class handleSettingsView(viewRequestHandler):
	SettingsPage = None
	def handleRequest(self):
		if self.securityFails():
			return self.handleAuthenticationFailue()
		
		templateExtension = self.Protocal
		
		if self.Kwarguments.has_key('page'):
			if self.Kwarguments['page'] == 'None':
				self.Page = "EditUser"
			else:
				self.Page = self.Kwarguments['page']
		else:
			self.Page = "EditUser"
		
		settingsPageClass = SettingsPage.getObjectForName(self.Page)
		if settingsPageClass is None:
			settingsPageClass = EditUserSettingsPage
		self.SettingsPage = settingsPageClass()
		self.SettingsPage.ViewHandler = self
		
		self.template = self.getTemplate()
		if self.template != "":
			self.template = self.template + "." + templateExtension
		
		content = self.getViewParameters()
		contentType = self.getContentType()
		return self.returnView(content, contentType)
	
	def getViewParameters(self):
		return self.SettingsPage.getViewParameters()
		
	def getTemplate(self):
		return self.SettingsPage.ViewPartial
	
	def getSideBarName(self):
		return "SettingsSideNavBar"

class handleSettingsCommand(commandRequestHandler):
	def runCommand(self):
		commandRunnerClass = SettingsCommand.getObjectForName(self.Command)
		if commandRunnerClass is not None:
			commandRunner = commandRunnerClass()
			commandRunner.ViewHandler = self
			return commandRunner.RunCommand()
		else:
			return self.handleUserError('Command Not Found')