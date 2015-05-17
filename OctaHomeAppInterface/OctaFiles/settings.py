from OctaHomeCore.settingviews import *

class DeviceUsersSettingsPage(SettingsPage):
	Name = "DeviceUsers"
	ViewPartial = "OctaHomeAppInterface/Settings/DeviceUsers"
	def getViewParameters(self):
		return {'devices':DeviceUser.objects.filter(User=self.ViewHandler.Request.user)}

class AddDeviceUsersSettingsPage(SettingsPage):
	Name = "AddDeviceUsers"
	ViewPartial = "OctaHomeAppInterface/Settings/AddDeviceUsers"
	def getViewParameters(self):
		return {}

class AddDeviceUsersCompleteSettingsPage(SettingsPage):
	Name = "AddDeviceUsersComplete"
	ViewPartial = "OctaHomeAppInterface/Settings/SetupDeviceUsersComplete"
	def getViewParameters(self):
		if self.ViewHandler.Post.has_key('name'):
			device = DeviceUser.objects.create(Name=self.ViewHandler.Post['name'], User=self.ViewHandler.Request.user)
			if self.ViewHandler.Request.is_secure():
				host = 'https://' + self.ViewHandler.Request.get_host() + "/"
			else:
				host = 'http://' + self.ViewHandler.Request.get_host() + "/"
			items = device.createDeviceSetupToken(host)
			return {'title':'Add', 'credentials':items, 'deviceToken':json.dumps(items)}
		else:
			return {}

class ResetDeviceUsersSettingsPage(SettingsPage):
	Name = "ResetDeviceUsers"
	ViewPartial = "OctaHomeAppInterface/Settings/SetupDeviceUsersComplete"
	def getViewParameters(self):
		if self.ViewHandler.Post.has_key('deviceId') and self.ViewHandler.Post['deviceId'] != '':
			device = DeviceUser.objects.get(pk=self.ViewHandler.Post['deviceId'])
			if device.User == self.ViewHandler.Request.user or self.ViewHandler.Request.user.is_superuser:
				if self.ViewHandler.Request.is_secure():
					host = 'https://' + self.ViewHandler.Request.get_host() + "/"
				else:
					host = 'http://' + self.ViewHandler.Request.get_host() + "/"
				items = device.createDeviceSetupToken(host)
				return {'title':'Reset', 'credentials':items, 'deviceToken':json.dumps(items)}
			else:
				return {'title':'Reset'}
		else:
			return {}

class DeleteDeviceUsersSettingsCommand(SettingsCommand):
	Name = "DeleteDeviceUsers"
	def RunCommand(self):
		if self.ViewHandler.Post.has_key('deviceId') and self.ViewHandler.Post['deviceId'] != '':
			device = DeviceUser.objects.get(pk=self.ViewHandler.Post['deviceId'])
			if device.User == self.ViewHandler.Request.user or self.ViewHandler.Request.user.is_superuser:
				device.delete()
				return self.ViewHandler.redirect(reverse('SettingsPage', kwargs={'page':'DeviceUsers'}))
			else:
				return self.ViewHandler.handleUserError('Permissions Denied')
		else:
			return self.ViewHandler.handleUserError('Device Not Given')