from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect

from OctaHomeCore.views.base import *
from models import *

#View Object
class handleTempView(viewRequestHandler):
	def getTemplate(self):
		if self.Kwarguments.has_key('page'):
			if self.Kwarguments['page'] == 'CentralHeating':
				return 'OctaHomeTempControl/CentralHeating'
			elif self.Kwarguments['page'] == 'Fan':
				return 'OctaHomeTempControl/Fan'
			else:
				raise Http404
		else:
			return 'OctaHomeTempControl/CentralHeating'
	
	def getViewParameters(self):
		parameters = {'device':self.getDevice()}
		
		return parameters
	
	def getSideBar(self):
		
		currentRoom = self.getCurrentRoom()
		
		linkName = self.getSidebarUrlName()
		
		address = reverse('TempControlPage', kwargs={'page':'CentralHeating'})
		links = [{'title': 'Central Heating', 'address': address, 'active': self.getSideBarActiveState('CentralHeating', currentRoom)}]
		
		supersSideBar = super(handleTempView, self).getSideBar()
		
		links = links + supersSideBar
		
		return links
	
	def getSidebarUrlName(self):
		return 'TempControl'
	
	def getDevice(self):
		device = None
		if self.Kwarguments.has_key('deviceType') and self.Kwarguments.has_key('deviceId'):
			for aDevice in Device.getDevices(self.Kwarguments, self.Kwarguments['deviceType']):
				if str(aDevice.id) == str(self.Kwarguments['deviceId']):
					device = aDevice
		return device

class handleTempCommand(commandRequestHandler):
	def runCommand(self):
		return self.handleUserError('Command Not Recognised')
