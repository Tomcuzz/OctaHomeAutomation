from django.http import HttpResponse, HttpResponseNotFound, HttpResponseForbidden, Http404
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
		self.Kwarguments = kwargs
		self.isSecuredArea = self.isPageSecured()
		self.isUserAuthenticated = self.Request.user.is_authenticated()
		return self.handleRequest()
	
	def post(self, request, *args, **kwargs):
		self.Request = request
		self.arguments = args
		self.Kwarguments = kwargs
		self.isSecuredArea = self.isPageSecured()
		self.isUserAuthenticated = self.Request.user.is_authenticated()
		return self.handleRequest()
	
	#Normal Overridable methods
	def handleRequest(self):
		pass
	
	def isPageSecured(self):			#Override to unsecure page
		if self.Kwarguments.has_key('protocal'):
			if self.Kwarguments['protocal'] == 'cisco':
				return False
		
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
	template = ''
	
	#Normal Overridable methods
	def getViewParameters(self):
		pass
	
	def getTemplate(self):
		pass
	
	def getSidebarUrlName(self):
		pass
	
	def getContentType(self):
		if self.Kwarguments.has_key('protocal'):
			if self.Kwarguments['protocal'] == 'cisco':
				return "text/xml"
		
		return None
	
	#Subclass methods
	def handleRequest(self):
		if self.securityFails():
			return self.handleAuthenticationFailue()
			
		if self.Kwarguments.has_key('protocal'):
			templateExtension = self.Kwarguments['protocal']
		else:
			templateExtension = 'html'
		
		self.template = self.getTemplate()
		if self.template != "":
			self.template = self.template + "." + templateExtension
		
		content = self.getViewParameters()
		contentType = self.getContentType()
		return self.returnView(content, contentType)
	
	def returnView(self, parameters={}, contentType=None):
		if self.template != '':
			standardParams = {'csrfmiddlewaretoken':get_token(self.Request), 'room':self.Request.GET.get('room', 'All'), 'links': self.getSideBar()}
			parameters = dict(standardParams.items() + parameters.items())
			if contentType == None:
				return render(self.Request, self.template, parameters)
			else:
				return render(self.Request, self.template, parameters, content_type=contentType)
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
		
		if self.Kwarguments.has_key('command'):
			self.Command = self.Kwarguments['command']
		else:
			return self.handleUserError('No Command Given')
		
		return self.runCommand()
	
	def returnOk(self):
		return HttpResponse('Ok')
	
	def handleUserError(self, errorMessage=''):
		return HttpResponse(errorMessage, status=400)
	
	def handleAuthenticationFailue(self):
		return HttpResponseForbidden()