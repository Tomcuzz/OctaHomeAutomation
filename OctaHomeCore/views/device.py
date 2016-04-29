from OctaHomeCore.views import *
from OctaHomeCore.models import *
from OctaHomeCore.helpers import *
import json

from OctaHomeLights.models import *
###############
# View Object #
###############
class handleGenericDeviceView(viewRequestHandler):
	def getViewParameters(self):
		if self.Kwarguments.has_key('deviceType'):
			slug = self.Kwarguments['deviceType']
		else:
			slug = "All"
		
		devices = Device.getDevicesWithTypeSlug(slug, self.Kwarguments)
		
		parameters = {'devices':devices, 'title':Device.getSectionNameForSlug(slug), 'slug':slug}
		
		if self.Kwarguments.has_key('house'):
			if self.Kwarguments['house'] == 'all':
				houseId = 'all'
			else:
				houseId = int(self.Kwarguments['house'])
			parameters.update({'house':houseId})
		else:
			parameters.update({'houses':Home.objects.all()})
		
		if self.Kwarguments.has_key('room'):
			parameters.update({'rooms':self.Kwarguments['room']})
		else:
			parameters.update({'rooms':Room.objects.all()})
		
		return parameters
	
	def getTemplate(self):
		return 'OctaHomeCore/pages/Device/Main'
	
	def getSideBarName(self):
		if self.Kwarguments.has_key('deviceType'):
			return self.Kwarguments['deviceType']
		else:
			return 'All'

class handleGenericAddDeviceView(viewRequestHandler):
	def getViewParameters(self):
		return {'types':getNonAbstractSubClasses(Device)}
	
	def getTemplate(self):
		return 'OctaHomeCore/pages/Device/Add'
	
	def getSideBar(self):
		return []


###################
# Commands Object #
###################
class handleSingleDeviceCommand(commandRequestHandler):
	def runCommand(self):
		if self.Kwarguments.has_key('deviceType') and self.Kwarguments.has_key('deviceId'):
			device = Device.getDevice(self.Kwarguments['deviceType'], self.Kwarguments['deviceId'])
			if device != None:
				if self.Command in device.listActions():
					result = device.handleAction(self.Command, self.AllRequestParams)
					if isinstance(result, dict) or isinstance(result, list):
						return self.returnJSONResult(result)
					elif isinstance(result, str):
						return self.returnResult(result)
					elif result == True:
						return self.returnOk()
					elif result != False and result != None:
						return self.returnJSONResult(result)
					else:
						return self.handleUserError('Command Error')
				else:
					return self.handleUserError('Command Not Found')
			else:
				return self.handleUserError('Device Not Found')
		else:
			return self.handleUserError('Device Not Specified')

class handleMultiDeviceCommand(commandRequestHandler):
	def runCommand(self):
		return self.handleUserError('Not Yet Implemented')


class handleAddDeviceCommand(commandRequestHandler):
	def commandNeeded(self):
		return False
	
	def runCommand(self):
		if self.Post.has_key('devicetype'):
			newDevice = Device.createDevice(self.Post['devicetype'], self.Post)
			if newDevice != None:
				newDevice.save()
				if self.Post.has_key('next'):
					return self.redirect(self.Post['next'])
				else:
					return self.redirect(reverse('GenericDeviceSection'))
			else:
				return self.handleUserError('Error In Creation')
		else:
			return self.handleUserError('Type Not Given')
