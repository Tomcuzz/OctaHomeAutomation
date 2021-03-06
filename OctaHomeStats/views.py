# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect

from OctaHomeDeviceInput.models import *
from OctaHomeCore.views.base import *
from OctaHomeCore.models import *

from OctaHomeLights.models import *
from OctaHomeTempControl.models import *

class handleHomeStatsView(viewRequestHandler):
	def getViewParameters(self):
		allDevices = Device.getDevices()
		lights = LightDevice.getDevices()
		fans = Fan.getDevices()
		
		numDevices = len(allDevices)
		numLights = len(lights)
		numFans = len(fans)
		
		devicesOn = 0
		
		lightsOn = 0
		for light in lights:
			if light.IsOn:
				lightsOn = lightsOn + 1
				devicesOn = devicesOn + 1
		
		fansOn = 0
		for fan in fans:
			if fan.MaxFanSpeed > 0:
				fansOn = fansOn + 1
				devicesOn = devicesOn + 1
		
		stats = {
				'numDevices':numDevices,
				'numLights':numLights,
				'numFans':numFans,
				
				'devicesOn':devicesOn,
				'lightsOn':lightsOn,
				'fansOn':fansOn,
			}
		
		paramerters = {'Stats':stats}
		
		return paramerters
		
		return None
	
	def getTemplate(self):
		return 'OctaHomeHomeStats/HomeStats'
	
	def getSidebarUrlName(self):
		return 'Home'
