from OctaHomeCore.views.settings import *
from OctaHomeCore.models.message import *

class LogsSettingsPage(SettingsPage):
	Name = "Logs"
	ViewPartial = "OctaHomeCore/Settings/Logs"
	
	def getViewParameters(self):
		return {'logs': LogItem.objects.order_by('-Date').all()}

class NotificationSettingsPage(SettingsPage):
	Name = "Notifications"
	ViewPartial = "OctaHomeCore/Settings/Notifications"
	
	def getViewParameters(self):
		return {'notifications': NotificationMessage.objects.order_by('-Date').all()}

class WarningsSettingsPage(SettingsPage):
	Name = "Warnings"
	ViewPartial = "OctaHomeCore/Settings/Warnings"
	
	def getViewParameters(self):
		return {'warnings': WarningMessage.objects.order_by('-Date').all()}

class ErrorsSettingsPage(SettingsPage):
	Name = "Errors"
	ViewPartial = "OctaHomeCore/Settings/Errors"
	
	def getViewParameters(self):
		return {'errors': ErrorMessage.objects.order_by('-Date').all()}