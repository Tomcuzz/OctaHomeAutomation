from django.contrib.auth import authenticate, login
from OctaHomeCore.baseviews import *
from OctaHomeCore.models import *
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
