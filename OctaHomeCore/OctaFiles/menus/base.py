import operator
from django.core.urlresolvers import reverse
from OctaHomeCore.models import *
from OctaHomeCore.helpers import *
from django.conf import settings
from django.utils import importlib

class BaseMenuObjectProvider(object):
	MenuName = ""
	SectionName = ""
	Request = None #Django request object
	
	def AllItems(self, menuName):
		self.MenuName = menuName
		return self.getAllItems()
	
	def getAllItems(self):
		pass

class StaticClassMenuObjectProvider(BaseMenuObjectProvider):
	def getAllItems(self):
		allMenuItems = getFinalSubClasses(MenuItem)
		
		menuItems = []
		menuItemNames = []
		
		for aMenuItem in allMenuItems:
			aMenuItemInst = aMenuItem()
			aMenuItemInst.Request = self.Request
			if aMenuItemInst.MenuName == self.MenuName and aMenuItemInst.isShown() and aMenuItemInst.DisplayName not in menuItemNames and aMenuItemInst.DisplayName != "":
				menuItems.append(aMenuItemInst)
				menuItemNames.append(aMenuItemInst.DisplayName)
		
		return menuItems

class RoomClassMenuObjectProvider(BaseMenuObjectProvider):
	ItemPartial = "OctaHomeCore/Partials/Menu/MenuItems/SideNavBarItem.html"
	
	def getAllItems(self):
		allItems = []
		allItems.extend(self.getPreItems())
		allItems.extend(self.getRoomItems())
		allItems.extend(self.getPostItems())
		return allItems
	
	def getPreItems(self):
		return []
	
	def getRoomItems(self):
		allRoomItems = []
		
		for house in Home.objects.all():
			houseObject = DynamicMenuItem()
			houseObject.DisplayName = house.Name
			houseObject.LinkValue = self.getUrlForHouse(house)
			houseObject.ViewPartial = self.ItemPartial
			houseObject.Request = self.Request
			
			sideBarRooms = []
			for room in house.Rooms.all():
				roomObject = DynamicMenuItem()
				roomObject.DisplayName = room.Name
				roomObject.LinkValue = self.getUrlForRoom(room)
				roomObject.ViewPartial = self.ItemPartial
				roomObject.Request = self.Request
				sideBarRooms.append(roomObject)
			
			houseObject.SubItems = sideBarRooms
			
			allRoomItems.append(houseObject)
		
		return allRoomItems
	
	def getPostItems(self):
		return []
	
	def getUrlForHouse(self, house):
		return ""
	
	def getUrlForRoom(self, room):
		return ""
	


class Menu(object):
	Name = ""
	ViewPartial = ""
	Request = None #Django request object
	
	MenuObjectProvider = StaticClassMenuObjectProvider()
	
	
	def buildMenu(self):
		self.MenuObjectProvider.Request = self.Request
		items = self.MenuObjectProvider.AllItems(self.Name)
		menuItems = []
		for item in items:
			if item.ParentItem == "":
				menuItems.append(item.buildItemWithMenuItems(items))
		menuItems.sort(key=operator.itemgetter('priority'))
		return menuItems
	
	
	@classmethod
	def getMenuForName(cls, menuName):
		#Import All Url files so that they appear
		for app in settings.INSTALLED_APPS:
			try:
				importlib.import_module(app + ".OctaFiles.menus")
			except: 
				pass
		
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
	Request = None #Django request object
	
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
		if self.Link == self.Request.get_full_path():
			return True
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


class DynamicMenuItem(MenuItem):
	LinkValue = ""
	OnClickLinkValue = ""
	LinkIdValue = ""
	IsShownValue = True
	SubItems = []
	
	@property
	def Link(self):
		return self.LinkValue
	
	@property
	def OnClickLink(self):
		return self.OnClickLinkValue
	
	@property
	def LinkId(self):
		return self.LinkIdValue
	
	def isShown(self):
		return self.IsShownValue
	
	def buildItemWithMenuItems(self, items):
		subItems = []
		for item in self.SubItems:
			subItems.append(item.buildItemWithMenuItems(items))
		subItems.sort(key=operator.itemgetter('priority'))
		return {'item':self, 'priority':self.Priority, 'subitems':subItems}

class TopNavBarItem(MenuItem):
	MenuName = "TopNavBar"
	ViewPartial = "OctaHomeCore/Partials/Menu/MenuItems/TopNavBarItem.html"
	
	def isActive(self):
		if self.Request.path.startswith(self.Link):
			return True
		return False
