from OctaHomeCore.baseviews import *
from OctaHomeCore.devicemodels import *
from Lights.models import *
import json
from OctaHomeCore.menumodels import *

#Nav Bar Item
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class DeviceTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 0
	DisplayName = "All"
	
	@property
	def Link(self):
		return reverse('GenericDeviceSection', kwargs={'deviceType':'All'})


#View Object
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
	
	def getSidebarUrlName(self):
		return 'GenericDeviceSection'
		if self.Kwarguments.has_key('DeviceType'):
			return self.Kwarguments['DeviceType']
		else:
			return 'All'

class handleGenericAddDeviceView(viewRequestHandler):
	def getViewParameters(self):
		return {}
	
	def getTemplate(self):
		return 'OctaHomeCore/pages/Device/Add'
	
	def getSideBar(self):
		return []