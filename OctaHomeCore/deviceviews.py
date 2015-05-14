from OctaHomeCore.baseviews import *
from OctaHomeCore.devicemodels import *
from OctaHomeCore.locationmodels import *
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

#Side Bar Menu
class DeviceSideBarMenuObjectProvider(RoomClassMenuObjectProvider):
	def getUrlForHouse(self, house):
		if self.SectionName != "":
			return reverse('GenericDeviceSection', kwargs={'deviceType':self.SectionName, 'house':house.pk})
		else:
			return reverse('GenericDeviceSection', kwargs={'deviceType':'All', 'house':house.pk})
	
	def getUrlForRoom(self, room):
		if self.SectionName != "":
			return reverse('GenericDeviceSection', kwargs={'deviceType':self.SectionName, 'house':room.Home.pk, 'room':room.pk})
		else:
			return reverse('GenericDeviceSection', kwargs={'deviceType':'All', 'house':room.Home.pk, 'room':room.pk})

class DeviceSideBarMenu(Menu):
	Name = "DeviceSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuArea/SideNavBar.html"
	MenuObjectProvider = DeviceSideBarMenuObjectProvider()


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
	
	def getSideBarName(self):
		if self.Kwarguments.has_key('deviceType'):
			return self.Kwarguments['deviceType']
		else:
			return 'All'

class handleGenericAddDeviceView(viewRequestHandler):
	def getViewParameters(self):
		return {}
	
	def getTemplate(self):
		return 'OctaHomeCore/pages/Device/Add'
	
	def getSideBar(self):
		return []