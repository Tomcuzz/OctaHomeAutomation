from django.http import HttpResponse, HttpResponseNotFound, HttpResponseForbidden, Http404
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.generic import View
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.middleware.csrf import get_token
from models import *
import json

class requestHandler(View):
	Request = {}
	isSecuredArea = True
	isUserAuthenticated = False
	Arguments = []
	Kwarguments = {}
	
	def get(self, request, *args, **kwargs):
		self.Request = request
		self.Arguments = args
		self.Kearguments = kwargs
		self.isSecuredArea = self.isPageSecured()
		self.isUserAuthenticated = self.Request.user.is_authenticated()
		return self.handleRequest()
	
	@ensure_csrf_cookie
	def post(self, request, *args, **kwargs):
		self.Request = request
		self.arguments = args
		self.kearguments = kwargs
		self.isSecuredArea = self.isPageSecured()
		self.isUserAuthenticated = self.Request.user.is_authenticated()
		return self.handleRequest()
	
	#Normal Overridable methods
	def handleRequest(self):
		pass
	
	def isPageSecured(self):			#Override to unsecure page
		return True
		
	
	
	def handleAuthenticationFailue(self):
		pass
	
	#Security Methods
	def securityFails(self):
		if self.isSecuredArea and not self.isUserAuthenticated:
			return True
		else:
			return False

class viewRequestHandler(requestHandler):
	Protocal = 'html'
	template = ''
	
	#Normal Overridable methods
	def getViewParameters(self):
		pass
	
	def getTemplate(self):
		pass
	
	def getSidebarUrlName(self):
		pass
	
	#Subclass methods
	def handleRequest(self, protocal="html"):
		if self.securityFails():
			return self.handleAuthenticationFailue()
		
		self.template = self.getTemplate()
		if self.template != "":
			self.template = self.template + "." + protocal
		
		content = self.getViewParameters()
		return self.returnView(content)
	
	def returnView(self, parameters={}):
		if self.template != '':
			standardParams = {'csrfmiddlewaretoken':get_token(self.Request), 'room':self.Request.GET.get('room', 'All'), 'links': self.getSideBar()}
			parameters = dict(standardParams.items() + parameters.items())
			return render(self.Request, self.template, parameters)
		else :
			raise Http404
	
	def handleAuthenticationFailue(self):
		return redirect('/Login?next=%s' % self.Request.path)
	
	#Sidebar Methods
	def getSideBar(self):
		currentRoom = self.getCurrentRoom()
		
		linkName = self.getSidebarUrlName()
		
		address = reverse(linkName)
		links = [{'title': 'All Rooms', 'address': address, 'active': self.getSideBarActiveState(None, currentRoom)}]
		
		for house in Home.objects.all():
			roomItems = []
			for room in house.Rooms.all():
				address = reverse(linkName, kwargs={'house':house.id, 'room':room.id})
				sidebarSubItem = {'title': room.Name.replace("_", " ") , 'address': address , 'active':self.getSideBarActiveState(room, currentRoom)}
				roomItems.append(sidebarSubItem)
			
			address = reverse(linkName, kwargs={'house':house.id})
			sidebarItem = {'title': house.Name.replace("_", " ") , 'address': address , 'active':self.getSideBarActiveState(house, currentRoom), 'sublinks':roomItems}
			links.append(sidebarItem)
		
		return links
	
	def getSideBarActiveState(self, sidebarItem, currentPage):
		if sidebarItem == currentPage:
			return 'active'
		else:
			return ''
	
	#Get Room Method
	def getCurrentRoom(self):
		roomString = self.Request.GET.get('room', 'All')
		if roomString != 'All':
			return Rooms.object.filter(id=roomString)
		else:
			return None

class commandRequestHandler(requestHandler):
	Command = ''
	#Normal Overridable methods
	
	def runCommand(self, command):
		pass
	
	#Subclass methods
	def handleRequest(self):
		if self.securityFails():
			return self.handleAuthenticationFailue()
		
		if items.has_key('command'):
			self.Command = items['command']
		else:
			return self.handleUserError('No Command Given')
		
		return self.runCommand()
	
	def returnOk(self):
		return HttpResponse('Ok')
	
	def handleUserError(self, errorMessage=''):
		return HttpResponse(errorMessage, status=400)
	
	def handleAuthenticationFailue(self):
		return HttpResponseForbidden()