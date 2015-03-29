import operator
from django.core.urlresolvers import reverse
from helpers import *

class Menu(object):
	Name = ""
	ViewPartial = ""
	
	def getAllItems(self):
		allMenuItems = getFinalSubClasses(MenuItem)
		
		menuItems = []
		menuItemNames = []
		
		for aMenuItem in allMenuItems:
			aMenuItemInst = aMenuItem()
			if aMenuItemInst.MenuName == self.Name and aMenuItemInst.isShown() and aMenuItemInst.DisplayName not in menuItemNames and aMenuItemInst.DisplayName != "":
				menuItems.append(aMenuItemInst)
				menuItemNames.append(aMenuItemInst.DisplayName)
		
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
				toCheck = aMenu.getMenuSubclassesForName(menuName)
				if toCheck != None:
					return toCheck
	@classmethod
	def getMenuSubclassesForName(cls, menuName):
		for aMenu in cls.__subclasses__():
			if aMenu.Name == menuName:
				return menuName
			else:
				toCheck = aMenu.getMenuSubclassesForName(menuName)
				if toCheck != None:
					return toCheck

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
	
	@property
	def OnClickLink(self):
		return ""
	
	@property
	def LinkId(self):
		return ""
	
	def isShown(self):
		return True
	
	def isActive(self):
		return False
	
	def buildItemWithMenuItems(self, items):
		subItems = []
		subItemNames = []
		for item in items:
			if item.ParentItem == self.DisplayName and item.DisplayName not in subItemNames:
				subItems.append(item.buildItemWithMenuItems(items))
				subItemNames.append(item.DisplayName)
		subItems.sort(key=operator.itemgetter('priority'))
		return {'item':self, 'priority':self.Priority, 'subitems':subItems}


class TopNavBarItem(MenuItem):
	MenuName = "TopNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuItems/TopNavBarItem.html"

















	