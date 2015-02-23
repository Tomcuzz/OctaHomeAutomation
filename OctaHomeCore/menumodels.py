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

class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 20
	DisplayName = "Core Systems"
	Link = "#"

class LightsTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 20
	DisplayName = "Lights"
	
	@property
	def Link(self):
		return reverse('Lights')


class SettingsTopNavBarItem(TopNavBarItem):
	Priority = 90
	DisplayName = "Settings"
	
	@property
	def Link(self):
		return "/Settings/"
	