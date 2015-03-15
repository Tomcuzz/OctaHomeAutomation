from django.http import HttpResponse, HttpResponseNotFound, HttpResponseForbidden, Http404
from django.views.generic import View
from django.core.urlresolvers import reverse
from django.shortcuts import render, redirect
from django.middleware.csrf import get_token
from models import *
from OctaHomeCore.locationmodels import *
import django.core.serializers
import json

class NamedSubclassableView(object):
	Name = ""
	
	@classmethod
	def getObjectForName(cls, className):
		for aClass in cls.__subclasses__():
			if aClass.Name == className:
				return aClass
			else:
				toCheck = aClass.getObjectSubclassesForName(className)
				if toCheck is not None:
					return toCheck
	
	@classmethod
	def getObjectSubclassesForName(cls, className):
		for aClass in cls.__subclasses__():
			if aClass.Name == className:
				return aClass
			else:
				toCheck = aClass.getObjectSubclassesForName(className)
				if toCheck is not None:
					return toCheck

class requestHandler(View):
	Request = {}
	Get = {}
	Post = {}
	AllRequestParams = {}
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
		self.AllRequestParams = self.getAllRequestParams()
		self.Protocal = self.getProtocol()
		self.isSecuredArea = self.isPageSecured()
		self.isUserAuthenticated = self.Request.user.is_authenticated()
		return self.handleRequest()
	
	def post(self, request, *args, **kwargs):
		self.Request = request
		self.arguments = args
		self.Kwarguments = kwargs
		self.Get = self.getGetVeriables()
		self.Post = self.getPostVeriables()
		self.AllRequestParams = self.getAllRequestParams()
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
	
	def getAllRequestParams(self):
		get = self.getGetVeriables()
		post = self.getPostVeriables()
		get.update(post)
		return get
	
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
			standardParams = {'csrfmiddlewaretoken':get_token(self.Request), 'room':self.Request.GET.get('room', 'All'), 'sideBarName': self.getSideBarName()}
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
		return redirect(reverse('Login') + '?next=' + self.Request.path)
	###################
	# Sidebar Methods #
	###################
	def getSideBarName(self):
		return ""
	
	def getSideBar(self):
		currentRoom = self.getCurrentRoom()
		currentHouse = self.getCurrentHome()
		
		linkName = self.getSidebarUrlName()
		
		address = reverse(linkName)
		links = [{'title': 'All Rooms', 'address': address, 'active': self.getSideBarActiveState([None, None], [currentRoom, currentHouse])}]
		
		for house in Home.objects.all():
			roomItems = []
			for room in house.Rooms.all():
				address = reverse(linkName, kwargs={'house':house.id, 'room':room.id})
				sidebarSubItem = {'title': room.Name.replace("_", " ") , 'address': address , 'active':self.getSideBarActiveState(room, currentRoom)}
				roomItems.append(sidebarSubItem)
			
			address = reverse(linkName, kwargs={'house':house.id})
			sidebarItem = {'title': house.Name.replace("_", " ") , 'address': address , 'active':self.getSideBarActiveState(house, currentHouse), 'sublinks':roomItems}
			links.append(sidebarItem)
		
		return links
	
	def getSideBarActiveState(self, sidebarItem, currentPage):
		if sidebarItem == currentPage:
			return 'active'
		else:
			return ''
	
	#Get Room Method
	def getCurrentRoom(self):
		if not self.Kwarguments.has_key('room'):
			return None
		elif self.Kwarguments['room'] != 'All':
			return Room.objects.get(id=self.Kwarguments['room'])
		else:
			return None
	
	#Get Home Method
	def getCurrentHome(self):
		if not self.Kwarguments.has_key('house'):
			return None
		elif self.Kwarguments['house'] != 'All':
			return Home.objects.get(id=self.Kwarguments['house'])
		else:
			return None

class commandRequestHandler(requestHandler):
	Command = ''
	#Normal Overridable methods
	def commandNeeded(self):
		return True
	
	def runCommand(self):
		pass
	
	#Subclass methods
	def handleRequest(self):
		if self.securityFails():
			return self.handleAuthenticationFailue()
		
		if self.commandNeeded() == False and not self.Kwarguments.has_key('command'):
			self.Command = "NotGiven"
		elif self.Kwarguments.has_key('command'):
			self.Command = self.Kwarguments['command']
		else:
			return self.handleUserError('No Command Given')
		
		return self.runCommand()
	
	def returnOk(self):
		return HttpResponse('Ok')
	
	def returnResult(self, result):
		return HttpResponse(result)
	
	def returnJSONResult(self, result):
		try:
			return HttpResponse(django.core.serializers.serialize('json', result), content_type="application/json")
		except Exception as e:
			return HttpResponse(json.dumps(result), content_type="application/json")
	
	def redirect(self, path):
		return redirect(path)
	
	def handleUserError(self, errorMessage=''):
		return HttpResponse(errorMessage, status=400)
	
	def handleAuthenticationFailue(self):
		return HttpResponseForbidden()