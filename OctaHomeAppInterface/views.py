from django.contrib.auth import authenticate, login
from OctaHomeCore.baseviews import *
from OctaHomeCore.models import *
from OctaHomeCore.menumodels import *
from Settings.settingviews import *
from models import *
import json

class handleDeviceLoginCommand(commandRequestHandler):
	def isPageSecured(self):
		return False
	
	def runCommand(self):
		if self.Command == 'Login':
			if self.Post.has_key('loginToken'):
				loginItems = self.Post['loginToken'].split(":")
				if len(loginItems) == 2:
					device = DeviceUser.objects.get(pk=int(loginItems[0]))
					if device is not None and device.User is not None and device.checkToken(loginItems[1]):
						device.User.backend = 'django.contrib.auth.backends.ModelBackend'
						login(self.Request, device.User)
			if self.Request.user != None and self.Request.user.is_authenticated():
				return self.returnJSONResult({ 'status':'ok', 'error':'None' })
			else:
				return self.returnJSONResult({ 'status':'error', 'error':'LoginFail' })
		
		
		elif self.Command == 'DevicesForUser':
			if self.Post.has_key('username') and self.Post.has_key('password'):
				user = authenticate(username=self.Post['username'], password=self.Post['password'])
				if user is not None:
					devices = DeviceUser.objects.filter(User=user)
					returnDevices = []
					for device in devices:
						returnDevices.append({'id':device.id, 'name':device.Name})
					return self.returnJSONResult({ 'status':'ok', 'error':'None', 'devices':returnDevices })
				else:
					return self.returnJSONResult({ 'status':'error', 'error':'LoginFail' })
			else:
				return self.returnJSONResult({ 'status':'error', 'error':'NoCredentials' })
		
		
		elif self.Command == 'NewDeviceForUser':
			if self.Post.has_key('username') and self.Post.has_key('password') and (self.Post.has_key('deviceId') or self.Post.has_key('deviceName')):
				user = authenticate(username=self.Post['username'], password=self.Post['password'])
				if user is not None:
					if self.Post.has_key('deviceId'):
						device = DeviceUser.objects.get(pk=self.Post['deviceId'])
					else:
						device = DeviceUser.objects.create(Name=self.Post['name'], User=self.Request.user)
					
					if device.User == user or user.is_superuser:
						if self.Request.is_secure():
							host = 'https://' + self.Request.get_host() + "/"
						else:
							host = 'http://' + self.Request.get_host() + "/"
						items = device.createDeviceSetupToken(host)
						return self.returnJSONResult({ 'status':'ok', 'error':'None', 'host':items['host'], 'user':items['user'], 'password':items['password']})
					else:
						return self.returnJSONResult({ 'status':'error', 'error':'LoginFail' })
				else:
					return self.returnJSONResult({ 'status':'error', 'error':'LoginFail' })
			else:
				return self.returnJSONResult({ 'status':'error', 'error':'NoCredentials' })
		
		
		else:
			return self.returnJSONResult({ 'status':'error', 'error':'CommandNotFound' })

######################
#  Settings Pannels  #
######################
class DeviceUsersSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 60
	DisplayName = "Device Logins"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'DeviceUsers'})

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