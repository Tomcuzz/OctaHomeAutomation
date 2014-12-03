from django.contrib.auth import authenticate, login, logout
from Core.baseviews import *
from Core.models import *

class handleLoginView(viewRequestHandler):
	loginToken = ''
	
	def handleRequest(self):
		if self.Request.user.is_authenticated():
			return super(handleLoginView, self).handleRequest()
			
		if self.Post.has_key('username') and self.Post.has_key('password'):
			user = authenticate(username=self.Post['username'], password=self.Post['password'])
			if user is not None:
				login(self.Request, user)
			else:
				self.loginToken = CustomBeckends().first_step(username=self.Post['username'], password=self.Post['password'])
		elif self.Post.has_key('authytoken') and self.Post.has_key('logintoken'):
			user = authenticate(username=self.Post['username'], password=None, authy_token=self.Post['authytoken'], login_token=self.Post['logintoken'])
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
			return 'pages/Core/Account/AuthyLogin'
		else:
			return 'pages/Core/Account/Login'
	
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