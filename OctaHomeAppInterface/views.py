from django.contrib.auth import login
from OctaHomeCore.baseviews import *
from OctaHomeCore.models import *
from models import *

class handleDeviceLoginView(viewRequestHandler):
	def handleRequest(self):
		if self.Request.user.is_authenticated():
			return super(handleDeviceLoginView, self).handleRequest()
			
		if self.Post.has_key('loginToken'):
			loginItems = self.Post['loginToken'].split(":")
			if len(loginItems) == 2:
				device = DeviceUser.objects.get(pk=int(loginItems[0]))
				if device is not None and device.User is not None and device.checkToken(loginItems[1]):
					print device.User.email
					device.User.backend = 'django.contrib.auth.backends.ModelBackend'
					login(self.Request, device.User)
		
		return super(handleDeviceLoginView, self).handleRequest()
		
	
	def returnView(self, parameters={}, contentType=None):
		if self.Request.user != None and self.Request.user.is_authenticated():
			return HttpResponse("{ 'status':'ok', 'error':'None' }", content_type="application/json")
		else:
			return HttpResponse("{ 'status':'error', 'error':'LoginFail' }", content_type="application/json")
	
	def getTemplate(self):
		return ''
	
	def getViewParameters(self):
		parameters = {}
		return parameters
	
	def getSideBar(self):
		return []
	
	def getSidebarUrlName(self):
		return ''
	
	def isPageSecured(self):
		return False
