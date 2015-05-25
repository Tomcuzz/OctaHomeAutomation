from OctaHomeCore.OctaFiles.menus.base import *

###################
# Device Side Bar #
###################
class DeviceSideBarMenuObjectProvider(RoomClassMenuObjectProvider):
	def getPreItems(self):
		allObject = DynamicMenuItem()
		allObject.DisplayName = "All"
		
		if self.SectionName != "":
			allObject.LinkValue = reverse('GenericDeviceSection', kwargs={'deviceType':self.SectionName})
		else:
			allObject.LinkValue = reverse('GenericDeviceSection', kwargs={'deviceType':'All'})
		
		allObject.ViewPartial = self.ItemPartial
		allObject.Request = self.Request
		return [allObject]
	
	def getPostItems(self):
		allObject = DynamicMenuItem()
		allObject.DisplayName = "Add New Device"
		
		if self.SectionName != "":
			allObject.LinkValue = reverse('AddDeviceView', kwargs={'slug':self.SectionName})
		else:
			allObject.LinkValue = reverse('AddDeviceView', kwargs={'slug':'All'})
		
		allObject.ViewPartial = self.ItemPartial
		allObject.Request = self.Request
		return [allObject]
	
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