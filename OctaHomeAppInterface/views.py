from django.contrib.auth import login
from OctaHomeCore.baseviews import *
from OctaHomeCore.models import *
from models import *

class handleDeviceLoginCommand(commandRequestHandler):
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
				elif user is not None:
					return self.returnJSONResult({ 'status':'error', 'error':'LoginFail' })
			else:
				return self.returnJSONResult({ 'status':'error', 'error':'NoCredentials' })
		
		else:
			return self.returnJSONResult({ 'status':'error', 'error':'CommandNotFound' })
