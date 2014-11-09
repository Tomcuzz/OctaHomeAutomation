from django.contrib.auth import authenticate, login, logout
from Core.baseviews import *

class handleLoginView(viewRequestHandler):
	def handleRequest(self):
		if self.Post.has_key('username') and self.Post.has_key('password'):
			user = authenticate(username=self.Post['username'], password=self.Post['password'])
			if user is not None:
				if user.is_active:
					login(self.Request, user)
		elif self.Post.has_key('authytoken'):
			self.Request.user.handle_authy_token(self.Post['authytoken'])
		
		return super(handleLoginView, self).handleRequest()
	
	def getTemplate(self):
		if self.Request.user == None or self.Request.user.is_anonymous():
			return 'pages/Core/Account/Login'
		elif not self.Request.user.is_authenticated():
			return 'pages/Core/Account/AuthyLogin'
		else:
			if self.Post.has_key('next') and self.Post['next'] != '':
				self.redirect(self.Post['next'])
			else:
				self.redirect(reverse('Home'))
			return ''
	
	def getViewParameters(self):
		if self.Post.has_key('next'):
			return { 'next':self.Post['next'] }
		else:
			return {}
	
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