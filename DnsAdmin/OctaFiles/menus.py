from OctaHomeCore.OctaFiles.menus.base import *
from django.db import connections

################
# Nav Bar Item #
################
class NetworkingTopNavBarItem(TopNavBarItem):
	Priority = 50
	DisplayName = "Networking"
	Link = "#"

class DnsAdminTopNavBarItem(TopNavBarItem):
	ParentItem = "Networking"
	Priority = 20
	DisplayName = "Dns Admin"
	
	@property
	def Link(self):
		return reverse('DnsAdmin')

############
# Side Bar #
############
class DnsMenuObjectProvider(BaseMenuObjectProvider):
	ItemPartial = "OctaHomeCore/Partials/Menu/MenuItems/SideNavBarItem.html"
	
	def getAllItems(self):
		ZoneObject = AllObject = DynamicMenuItem()
		ZoneObject.DisplayName = 'Zones'
		ZoneObject.LinkValue = reverse('DnsAdmin')
		ZoneObject.ViewPartial = self.ItemPartial
		ZoneObject.Request = self.Request
		
		zones = []
		
		AllObject = DynamicMenuItem()
		AllObject.DisplayName = 'All Domains'
		AllObject.LinkValue = reverse('DnsAdmin')
		AllObject.ViewPartial = self.ItemPartial
		AllObject.Request = self.Request
		zones.append(AllObject)
		
		cursor = connections['dns'].cursor()
		cursor.execute("SHOW TABLES")
		tables = cursor.fetchall()
		
		tablesArray = []
		
		for x in tables:
			for table in x:
				aZoneObject = AllObject = DynamicMenuItem()
				aZoneObject.DisplayName = str(table)
				aZoneObject.LinkValue = reverse('DnsAdmin', kwargs={'domain':str(table)})
				aZoneObject.ViewPartial = self.ItemPartial
				aZoneObject.Request = self.Request
				zones.append(aZoneObject)
		
		ZoneObject.SubItems = zones
		
		return [ZoneObject]

class DnsAdminSideBarMenu(Menu):
	Name = "DnsAdminSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuArea/SideNavBar.html"
	MenuObjectProvider = DnsMenuObjectProvider()