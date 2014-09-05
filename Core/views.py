from django.http import HttpResponse, HttpResponseNotFound, HttpResponseForbidden, Http404
from django.views.generic import View
from django.shortcuts import render, redirect
from django.middleware.csrf import get_token
from models import *

class requestHandler(View):
	request = ''
	isSecuredArea = True
	isUserAuthenticated = False
	
	def get(self, request, *args, **kwargs):
		protocal='html'
		page='home'
		return self.handleRequest(request)
	
	#Normal Overridable methods
	
	def handleRequest(self, request):
		pass
	
	def isPageSecured(self):			#Override to unsecure page
		self.isSecuredArea = True
	
	
	def handleAuthenticationFailue(self):
		pass
	
	#Request Life Cycle Methods
	def setUpHandler(self, request):
		self.request = request
		self.isSecuredArea = self.isPageSecured()
		self.isUserAuthenticated = request.user.is_authenticated()
	
	#Security Methods
	def securityFails(self):
		if not self.isUserAuthenticated and self.isSecuredArea:
			return True
		else:
			return False

class viewRequestHandler(requestHandler):
	protocal = 'html'
	template = ''
	
	#Normal Overridable methods
	
	def getViewParameters(self):
		pass
	
	
	def getTemplate(self):
		pass
	
	#Subclass methods
	def handleRequest(self, request, protocal="html"):
		self.setUpHandler(request)
		
		if self.securityFails():
			return self.handleAuthenticationFailue()
		
		self.template = self.getTemplate()
		if self.template != "":
			self.template = self.template + "." + protocal
		
		content = self.getViewParameters()
		return self.returnView(content)
	
	def returnView(self, parameters={}):
		if self.template != '':
			standardParams = {'csrfmiddlewaretoken':get_token(self.request), 'room':self.request.GET.get('room', 'All'), 'links': self.getSideBar()}
			parameters = dict(standardParams.items() + parameters.items())
			return render(self.request, self.template, parameters)
		else :
			raise Http404
	
	def handleAuthenticationFailue(self):
		return redirect('/Login?next=%s' % request.path)
	
	#Sidebar Methods
	def getSideBar(self):
		currentRoom = self.getCurrentRoom()
		
		links = [{'title': 'All Rooms', 'address': '?', 'active': self.getSideBarActiveState(None, currentRoom)}]
		
		for room in []:#Rooms.objects.all():
			address = '?room=' + room.Name
			sidebarItem = {'title': room.Name.replace("_", " ") , 'address': address , 'active':getSideBarActiveState(room, currentRoom)}
			links.append(sidebarItem)
		
		return links
	
	def getSideBarActiveState(self, sidebarItem, currentPage):
		if sidebarItem == currentPage:
			return 'active'
		else:
			return ''
	
	#Get Room Method
	def getCurrentRoom(self):
		roomString = self.request.GET.get('room', 'All')
		if roomString != 'All':
			return Rooms.object.filter(id=roomString)
		else:
			return None

class commandRequestHandler(requestHandler):
	#Normal Overridable methods
	
	def runCommand(self, command):
		pass
	
	#Subclass methods
	def handleRequest(self, request):
		self.setUpHandler(request)
		
		if self.securityFails():
			return self.handleAuthenticationFailue()
		
		return self.runCommand(getCommand(self))
	
	def returnOk(self):
		return HttpResponse()
	
	def handleUserError(self, errorMessage=''):
		return HttpResponse(errorMessage, status=400)
	
	def handleAuthenticationFailue(self):
		return HttpResponseForbidden()
		
	#supporting functions
	def getCommand(self):
		return self.request.GET.get('command', 'None')