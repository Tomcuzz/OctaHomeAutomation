from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, Http404

from OctaHomeCore.views.base import *

#View Object
class handleNagiosView(viewRequestHandler):
	def getTemplate(self):
		if reverse('NagiosServer'):
			return 'OctaHomeNagios/Main'
		else:
			return 'OctaHomeNagios/Main'
	
	def getViewParameters(self):
		if True:
			parameters = {'services':[]}
		else:
			parameters = {'servers':[]}
		
		return parameters
	
	def getSideBarName(self):
		return "NagiosSideNavBar"
