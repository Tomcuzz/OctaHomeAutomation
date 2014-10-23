# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect

from Lights.models import *
from DeviceInput.models import *
from Core.views import *
from Core.models import *

class handleHomeStatsView(viewRequestHandler):
	def getViewParameters(self):
		lights = LightDevice.getDevices()
		
		paramerters = {'Lights':lights}
		
		return paramerters
	
	def getContentType(self):
		if self.Kwarguments.has_key('protocal'):
			if self.Kwarguments['protocal'] == 'cisco':
				return "text/xml"
		
		return None
	
	def getTemplate(self):
		return 'pages/HomeStats/HomeStats'
	
	def getSidebarUrlName(self):
		return 'Home'
