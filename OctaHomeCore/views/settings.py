from django.conf import settings
from django.utils import importlib
import json

from OctaHomeCore.views import *
from OctaHomeCore.models import *
from OctaHomeCore.helpers import *

class SettingsPage(NamedSubclassableView):
	ViewPartial = ""
	ViewHandler = None
	
	
	@classmethod
	def imports(cls):
		for app in settings.INSTALLED_APPS:
			try:
				importlib.import_module(app + ".OctaFiles.settings")
			except: 
				pass
	
	def hasAuthorisation(self):
		return True
	
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
		
		if self.Kwarguments.has_key('page'):
			if self.Kwarguments['page'] == 'None':
				self.Page = "EditUser"
			else:
				self.Page = self.Kwarguments['page']
		else:
			self.Page = "EditUser"
		
		settingsPageClass = SettingsPage.getObjectForName(self.Page)
		if settingsPageClass is None:
			settingsPageClass = SettingsPage.getObjectForName("EditUser")
		self.SettingsPage = settingsPageClass()
		self.SettingsPage.ViewHandler = self
		
		if self.SettingsPage.hasAuthorisation() == False:
			self.template = "OctaHomeCore/Settings/AuthorisationFailure.html"
			contentType = self.getContentType()
			return self.returnView({}, contentType)
		
		self.template = self.getTemplate()
		if self.template != "":
			self.template = self.template + ".html"
		
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