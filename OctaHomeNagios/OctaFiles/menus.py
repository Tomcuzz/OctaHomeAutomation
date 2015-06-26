################
# Nav Bar Item #
################
class NetworkingTopNavBarItem(TopNavBarItem):
	Priority = 50
	DisplayName = "Networking"
	Link = "#"

class OctaHomeNagiosTopNavBarItem(TopNavBarItem):
	ParentItem = "Networking"
	Priority = 20
	DisplayName = "Nagios"
	
	@property
	def Link(self):
		return reverse('Nagios')

############
# Side Bar #
############
class NagiosSideBarMenu(Menu):
	Name = "NagiosSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuArea/SideNavBar.html"

class NagiosSideNavBarItem(MenuItem):
	MenuName = "NagiosSideNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuItems/SideNavBarItem.html"

class ServicesNagiosNavBarItem(NagiosSideBarMenu):
	Priority = 10
	DisplayName = "Services"
	
	@property
	def Link(self):
		return reverse('Nagios')

class ServersNagiosNavBarItem(NagiosSideBarMenu):
	Priority = 20
	DisplayName = "Servers"
	
	@property
	def Link(self):
		return reverse('NagiosServer')