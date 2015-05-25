from django.contrib.auth import authenticate, login, logout
from OctaHomeCore.views import *
from OctaHomeCore.models import *

class handleLoginView(viewRequestHandler):
	loginToken = ''
	
	def handleRequest(self):
		if self.Request.user.is_authenticated():
			return super(handleLoginView, self).handleRequest()
			
		if self.Post.has_key('username') and self.Post.has_key('password'):
			user = authenticate(username=self.Post['username'], password=self.Post['password'])
			if user is not None and user.authy_id != "":
				self.loginToken = user.get_login_token()
			elif user is not None:
				login(self.Request, user)
		elif self.Post.has_key('authytoken') and self.Post.has_key('logintoken'):
			user = CustomUser().objects.authyCheck(self.Post['username'], self.Post['logintoken'], self.Post['authytoken'])
			if user is not None:
				login(self.Request, user)
		
		return super(handleLoginView, self).handleRequest()
	
	def getTemplate(self):
		if self.Request.user != None and self.Request.user.is_authenticated():
			if self.Post.has_key('next') and self.Post['next'] != '':
				self.redirect(self.Post['next'])
			else:
				self.redirect(reverse('Home'))
			return ''
		if self.loginToken:
			return 'OctaHomeCore/pages/Account/AuthyLogin'
		else:
			return 'OctaHomeCore/pages/Account/Login'
	
	def getViewParameters(self):
		parameters = {}
		if self.Post.has_key('next'):
			parameters.update({ 'next':self.Post['next'] })
		
		if self.loginToken != '' and self.Post.has_key('username'):
			parameters.update({ 'username':self.Post['username'], 'logintoken':self.loginToken })
		
		return parameters
	
	def getSideBar(self):
		return []
	
	def getSidebarUrlName(self):
		return ''
	
	def isPageSecured(self):
		return False

class handleLogOutView(viewRequestHandler):
	def handleRequest(self):
		logout(self.Request)
		return redirect(reverse('Home'))