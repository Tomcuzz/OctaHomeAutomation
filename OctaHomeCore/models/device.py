from django.db import models
from OctaHomeCore.models import *
from OctaHomeCore.models.location import *
from OctaHomeCore.helpers import *

class DeviceGroup(OctaBaseModel):
	Devices = models.ManyToManyField('Device', blank=True, null=True)
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'DeviceGroups'


################
# Device Types #
################
class Device(OctaSubclassableModel):
	##############
	# Parameters #
	##############
	Rooms = models.ManyToManyField('Room', blank=True, null=True, related_name="%(app_label)s_%(class)s_Devices")
	IsOn = models.BooleanField(default=False)
	Logs = models.ManyToManyField('LogItem', blank=True, null=True, related_name="%(app_label)s_%(class)s_Devices")
	IpAddress = models.TextField()
	Port = models.IntegerField(default=0)
	
	##################
	# Object Methods #
	##################
	def listActions(self):
		return ["getState", "setName", "addRoomById", "removeRoomById", "setIsOn", "setIpAddress", "setPort"]
	
	def	handleAction(self, action, parameters):
		if action == "getState":
			return self.getState()
		elif parameters.has_key('value') and action in ["setName", "addRoomById", "removeRoomById", "setIsOn", "setIpAddress", "setPort"]:
			if action == "setName":
				return self.setName(parameters['value'])
			elif action == "addRoomById":
				return self.addRoomById(parameters['value'])
			elif action == "removeRoomById":
				return self.removeRoomById(parameters['value'])
			elif action == "setIsOn":
				return self.setIsOn(parameters['value'])
			elif action == "setIpAddress":
				return self.setIpAddress(parameters['value'])
			elif action == "setPort":
				return self.setPort(parameters['value'])
			else:
				return False
		else:
			return False
	
	def getState(self):
		return {"Id":self.id, "Name":self.Name, "Type":self.__class__.__name__, "Sections":self.__class__.getSectionNameArray(), "Rooms":self.getRoomIds(), "IsOn":{"DisplayName":"On/Off", "Type":"Bool", "value":self.IsOn}}
	
	def setName(self, name):
		self.Name = name
		self.save()
		return True
	
	def getRoomIds(self):
		rooms = []
		for room in self.Rooms.all():
			rooms.append(room.id)
		return rooms
	
	def addRoomById(self, roomId):
		room = Room.objects.get(pk=roomId)
		self.Rooms.add(room)
		self.save()
		return True
	
	def removeRoomById(self, roomId):
		room = Room.objects.get(pk=roomId)
		self.Rooms.remove(room)
		self.save()
		return True
	
	def setIsOn(self, setOn):
		pass
	
	def setIpAddress(self, ipAddress):
		self.IpAddress = ipAddress
		self.save()
		return True
	
	def setPort(self, port):
		self.Port = port
		self.save()
		return True
		
	
	#################
	# Class Methods #
	#################
	@classmethod
	def getDevices(cls, kwargs={}):
		devices = []
		
		for deviceClass in getNonAbstractSubClasses(cls):
			devices.extend(deviceClass.objects.all())
		
		returnDevices = []
		
		if (kwargs.has_key('room') and kwargs['room'] != 'all') or (kwargs.has_key('house') and kwargs['house'] != 'all'):
			if kwargs.has_key('room') and kwargs['room'] != 'all':
				rooms = Room.objects.filter(id=kwargs['room'])
			elif kwargs.has_key('house') and kwargs['house'] != 'all':
				house = Home.objects.filter(id=kwargs['house'])
				rooms = Room.objects.filter(Home=house)
			else:
				room = []
			
			for device in devices:
				for room in rooms:
					if device.__class__.objects.filter(pk=device.id, Rooms__in=[room]).exists():
						returnDevices.append(device)
						break
		else:
			returnDevices = devices
		
		return returnDevices
	
	@classmethod
	def getDevice(cls, deviceType, deviceId):
		device = None
		for aDevice in Device.getDevices():
			if str(aDevice.id) == str(deviceId) and (aDevice.__class__.__name__ == str(deviceType)):
				device = aDevice
		return device
	
	@classmethod
	def getSectionName(cls):
		return 'All Devices'
	
	@classmethod
	def getSuperClasses(cls):
		c = list(cls.__bases__)
		for base in c:
			if base.__name__ == 'Device':
				break
			c.extend(base.getSuperClasses())
		return c
	
	@classmethod
	def getSectionNameArray(cls):
		nameArray = []
		for aClass in cls.getSuperClasses():
			if aClass.getSectionName() not in nameArray:
				nameArray.append(aClass.getSectionName())
			if aClass.getSectionName() == 'All Devices':
				break
		return nameArray
	
	@classmethod
	def getSectionSlug(cls):
		return 'All'
	
	@classmethod
	def getDevicesWithTypeSlug(cls, typeSlug, kwargs={}):
		objects = []
		
		if typeSlug == cls.getSectionSlug():
			objects.extend(cls.getDevices(kwargs))
		else:
			for aClass in cls.__subclasses__():
				objects.extend(aClass.getDevicesWithTypeSlug(typeSlug, kwargs))
		
		return objects
	
	@classmethod
	def getSectionNameForSlug(cls, typeSlug):
		if typeSlug == cls.getSectionSlug():
			return cls.getSectionName()
		else:
			for aClass in cls.__subclasses__():
				title = aClass.getSectionNameForSlug(typeSlug)
				if title != '':
					return title
			return ''
		
	
	@classmethod
	def getClassNames(cls):
		classNames = []
		for deviceClass in getNonAbstractSubClasses(cls):
			classNames.append(deviceClass.__name__)
		return classNames
	
	@classmethod
	def createDevice(cls, className, kwargs={}):
		if cls.__name__ == className:
			if kwargs.has_key('name'):
				device = cls(Name = kwargs['name'])
			else:
				return None
		else:
			device = None
			for deviceClass in getNonAbstractSubClasses(cls):
				if deviceClass.__name__ == className:
					device = deviceClass(Name = kwargs['name'])
					break
			if device == None:
				return None
			device.save()
			device.setup(kwargs)
			device.save()
			return device
	
	def setup(self, kwargs={}):
		if kwargs.has_key('room'):
			room = Room.objects.get(pk=kwargs['room'])
			self.Rooms.add(room)
		if kwargs.has_key('ipaddress'):
			self.IpAddress = kwargs['ipaddress']
		if kwargs.has_key('port'):
			self.Port = int(kwargs['port'])
		return self
	
	def getSuperClassNames(self):
		name = []
		for deviceClass in getAllSubClasses(Device):
			if issubclass(self.__class__, deviceClass):
				name.append(deviceClass.__name__)
		return name
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'BaseDevices'

class OutputDevice(Device):
	########
	# Meta #
	########
	class Meta:
	 	abstract = True

class InputDevice(Device):
	########
	# Meta #
	########
	class Meta:
		abstract = True


################
# Device Modes #
################
class DeviceMode(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.TextField()
	
	#################
	# Class Methods #
	#################
	@classmethod
	def getDeviceModeNames(cls, kwargs={}):
		modeNames = []
		for mode in cls.objects.all():
			modeNames.extend(mode.Name)
		return modeNames
	
	########
	# Meta #
	########
	class Meta:
		abstract = True