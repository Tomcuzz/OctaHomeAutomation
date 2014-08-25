from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.shortcuts import render, redirect
from django.middleware.csrf import get_token
from models import *

class view():
	request = ''
	template = ''
	isSecuredArea = True
	isUserAuthenticated = False
	
	
	#Normal Overridable methods
	@abstractmethod
	def getView():
		pass
	
	@abstractmethod
	def getTemplate():
		pass
	
	def isPageSecured():			#Override to unsecure page
		self.isSecuredArea = True
	
	
	
	
	#Request Life Cycle Methods
	def handleRequest(request):
		self.setUpView(request)
		
		if securityFails():
			return self.handleAuthenticationFailue()
		
		self.getTemplate()
		
		content = getView()
		return returnView(content)
	
	
	def setUpView(request):
		self.request = request
		self.isSecuredArea = isPageSecured()
		self.isUserAuthenticated = request.user.is_authenticated()
	
	def returnView(parameters={}):
		if self.template != '':
			return render(self.request, self.template, {'csrfmiddlewaretoken':get_token(request), 'room':room, 'links': links})
		else :
			raise Http404
	
	
	#Security Methods
	def securityFails():
		if not self.isUserAuthenticated and self.isSecuredArea:
			return True
		else:
			return False
	
	def handleAuthenticationFailue():
		return redirect('/Login?next=%s' % request.path)
	
	#Get Room Method
	def getCurrentRoom():
		roomString = self.request.GET.get('room', 'All')
		if roomString != 'All':
			return Rooms.object.filter(id=roomString)
		else return null;
	
	#Sidebar Methods
	def getSideBar():
		currentRoom = getCurrentRoom()
		
		links = [{'title': 'All Rooms', 'address': '?', 'active': getSideBarActiveState(null, currentRoom)}]
		
		for room in Rooms.objects.all():
			address = '?room=' + room.Name
			sidebarItem = {'title': room.Name.replace("_", " ") , 'address': address , 'active':getSideBarActiveState(room, currentRoom)}
			links.append(sidebarItem)
		
		return links
	
	def getSideBarActiveState(sidebarItem, currentPage):
		if sidebarItem == currentPage:
			return 'active'
		else:
			return ''