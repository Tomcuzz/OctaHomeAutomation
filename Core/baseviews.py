from django.http import HttpResponse, HttpResponseNotFound, HttpResponseForbidden, Http404
from django.views.generic import View
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.middleware.csrf import get_token
from models import *
import json

class requestHandler(View):
	Request = {}
	Get = {}
	Post = {}
	Protocal = 'html'
	isSecuredArea = True
	isUserAuthenticated = False
	Arguments = []
	Kwarguments = {}
	
	def get(self, request, *args, **kwargs):
		self.Request = request
		self.Arguments = args
		self.Kwarguments = kwargs
		self.Get = self.getGetVeriables()
		self.Protocal = self.getProtocol()
		self.isSecuredArea = self.isPageSecured()
		self.isUserAuthenticated = self.Request.user.is_authenticated()
		return self.handleRequest()
	
	def post(self, request, *args, **kwargs):
		self.Request = request
		self.arguments = args
		self.Kwarguments = kwargs
		self.Post = self.getPostVeriables()
		self.Protocal = self.getProtocol()
		self.isSecuredArea = self.isPageSecured()
		self.isUserAuthenticated = self.Request.user.is_authenticated()
		return self.handleRequest()
	
	##############################
	# Normal Overridable methods #
	##############################
	def getGetVeriables(self):
		return dict(zip(self.Request.GET.keys(), self.Request.GET.values()))
	
	def getPostVeriables(self):
		return dict(zip(self.Request.POST.keys(), self.Request.POST.values()))
	
	def handleRequest(self):
		pass
	
	def isPageSecured(self):			#Override to unsecure page
		if self.Protocal == 'cisco':
			return False
		else:
			return True
	
	def getProtocol(self):
		if self.Kwarguments.has_key('protocal'):
			return self.Kwarguments['protocal']
		else:
			return 'html'
	
	def handleAuthenticationFailue(self):
		pass
	
	####################
	# Security Methods #
	####################
	def securityFails(self):
		if self.isSecuredArea and not self.isUserAuthenticated:
			return True
		else:
			return False

class viewRequestHandler(requestHandler):
	template = ''
	Page = 'None'
	Redirect = ''
	
	##############################
	# Normal Overridable methods #
	##############################
	def getViewParameters(self):
		pass
	
	def getTemplate(self):
		pass
	
	def getSidebarUrlName(self):
		return ''
	
	def getContentType(self):
		if self.Protocal == 'cisco':
			return "text/xml"
		else:
			return None
	
	####################
	# Subclass methods #
	####################
	def handleRequest(self):
		if self.securityFails():
			return self.handleAuthenticationFailue()
			
		templateExtension = self.Protocal
		
		if self.Kwarguments.has_key('page'):
			self.Page = self.Kwarguments['page']
		
		self.template = self.getTemplate()
		if self.template != "":
			self.template = self.template + "." + templateExtension
		
		content = self.getViewParameters()
		contentType = self.getContentType()
		return self.returnView(content, contentType)
	
	def returnView(self, parameters={}, contentType=None):
		if self.Redirect != '':
			return redirect(self.Redirect)
		elif self.template != '':
			standardParams = {'csrfmiddlewaretoken':get_token(self.Request), 'room':self.Request.GET.get('room', 'All'), 'links': self.getSideBar()}
			standardParams.update(parameters)
			if contentType == None:
				return render(self.Request, self.template, standardParams)
			else:
				return render(self.Request, self.template, standardParams, content_type=contentType)
		else :
			raise Http404
	
	def redirect(self, path):
		self.Redirect = path
	
	def handleAuthenticationFailue(self):
		return redirect('/Login?next=%s' % self.Request.path)
	###################
	# Sidebar Methods #
	###################
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
	
	def redirect(self, path):
		return redirect(path)
	
	def handleUserError(self, errorMessage=''):
		return HttpResponse(errorMessage, status=400)
	
	def handleAuthenticationFailue(self):
		return HttpResponseForbidden()