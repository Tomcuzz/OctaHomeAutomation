import operator
from django.core.urlresolvers import reverse
from helpers import *

class Menu(object):
	Name = ""
	ViewPartial = ""
	
	def getAllItems(self):
		allMenuItems = getFinalSubClasses(MenuItem)
		
		menuItems = []
		
		for aMenuItem in allMenuItems:
			aMenuItemInst = aMenuItem()
			if aMenuItemInst.MenuName == self.Name and aMenuItemInst.isShown():
				menuItems.append(aMenuItemInst)
		
		return menuItems
	
	def buildMenu(self):
		items = self.getAllItems()
		menuItems = []
		for item in items:
			if item.ParentItem == "":
				menuItems.append(item.buildItemWithMenuItems(items))
		menuItems.sort(key=operator.itemgetter('priority'))
		return menuItems
	
	
	@classmethod
	def getMenuForName(cls, menuName):
		for aMenu in Menu.__subclasses__():
			if aMenu.Name == menuName:
				return aMenu
			else:
				return aMenu.getMenuSubclassesForName(menuName)
	@classmethod
	def getMenuSubclassesForName(cls, menuName):
		for aMenu in cls.__subclasses__():
			if aMenu.Name == menuName:
				return menuName
			else:
				return aMenu.getMenuSubclassesForName(menuName)

class TopNavBar(Menu):
	Name = "TopNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuArea/TopNavBar.html"



class MenuItem(object):
	MenuName = ""
	ParentItem = "" #Empty If On Top Level
	Priority = 0
	DisplayName = ""
	ViewPartial = ""
	
	@property
	def Link(self):
		return ""
	
	def isShown(self):
		return True
	
	def buildItemWithMenuItems(self, items):
		subItems = []
		for item in items:
			if item.ParentItem == self.DisplayName:
				subItems.append(item.buildItemWithMenuItems(items))
		subItems.sort(key=operator.itemgetter('priority'))
		return {'item':self, 'priority':self.Priority, 'subitems':subItems}


class TopNavBarItem(MenuItem):
	MenuName = "TopNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuItems/TopNavBarItem.html"











class HomeTopNavBarItem(TopNavBarItem):
	Priority = 10
	DisplayName = "Home"
	
	@property
	def Link(self):
		return reverse('Home')

class HomeStatsTopNavBarItem(TopNavBarItem):
	Priority = 20
	DisplayName = "Home Stats"
	
	@property
	def Link(self):
		return reverse('HomeStats')

class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class LightsTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 10
	DisplayName = "Lights"
	
	@property
	def Link(self):
		return reverse('Lights')

class AlarmTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 20
	DisplayName = "Alarm"
	
	@property
	def Link(self):
		return reverse('Alarm')

class SecurityTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 30
	DisplayName = "Security"
	
	@property
	def Link(self):
		return reverse('Security')

class CurtainsTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 40
	DisplayName = "Curtains"
	
	@property
	def Link(self):
		return reverse('Curtains')

class TempControlTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 50
	DisplayName = "Temperature"
	
	@property
	def Link(self):
		return reverse('TempControl')

class AudioVisualTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 60
	DisplayName = "Audio/Visual"
	
	@property
	def Link(self):
		return reverse('AudioVisual')

class FoodTopNavBarItem(TopNavBarItem):
	Priority = 40
	DisplayName = "Food"
	Link = "#"

class MealsTopNavBarItem(TopNavBarItem):
	ParentItem = "Food"
	Priority = 20
	DisplayName = "Meals"
	
	@property
	def Link(self):
		return reverse('Meals')

class RecipesTopNavBarItem(TopNavBarItem):
	ParentItem = "Food"
	Priority = 20
	DisplayName = "Recipes"
	
	@property
	def Link(self):
		return reverse('Recipes')

class FridgeTopNavBarItem(TopNavBarItem):
	ParentItem = "Food"
	Priority = 20
	DisplayName = "Fridge"
	
	@property
	def Link(self):
		return reverse('Fridge')

class NetworkingTopNavBarItem(TopNavBarItem):
	Priority = 50
	DisplayName = "Networking"
	Link = "#"

class ProxmoxTopNavBarItem(TopNavBarItem):
	ParentItem = "Networking"
	Priority = 10
	DisplayName = "Proxmox"
	
	@property
	def Link(self):
		return reverse('Proxmox')

class DnsAdminTopNavBarItem(TopNavBarItem):
	ParentItem = "Networking"
	Priority = 20
	DisplayName = "Dns Admin"
	
	@property
	def Link(self):
		return reverse('DnsAdmin')

class SettingsTopNavBarItem(TopNavBarItem):
	Priority = 90
	DisplayName = "Settings"
	
	@property
	def Link(self):
		return "/Settings/"
	