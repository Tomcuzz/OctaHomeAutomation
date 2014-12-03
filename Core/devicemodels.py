from django.db import models
from Core.locationmodels import *
from helpers import *

################
# Device Types #
################
class Device(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Rooms = models.ManyToManyField('Room', blank=True, null=True, related_name="%(app_label)s_%(class)s_Devices")
	IpAddress = models.TextField()
	Port = models.IntegerField()
	
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
	def getClassNames(cls):
		classNames = []
		for deviceClass in getNonAbstractSubClasses(cls):
			classNames.append(deviceClass.__name__)
		return classNames
	
	@classmethod
	def create(cls, className, kwargs={}):
		if cls.__name__ == className:
			if kwargs.has_key('name'):
				device = cls(Name = kwargs['name'])
			else:
				return None
		else:
			device = None
			for deviceClass in getNonAbstractSubClasses(cls):
				if cls.__name__ == className:
					device = deviceClass(kwargs)
					break
			if device == None:
				return None
			
		if kwargs.has_key('room'):
			room = Room.objects.get(pk=kwargs['room'])
			device.Rooms.add(room)
		if kwargs.has_key('ipaddress'):
			device.IpAddress = kwargs['ipaddress']
		if kwargs.has_key('port'):
			device.Port = kwargs['port']
		return device
	
	def getSuperClassNames(self):
		name = []
		for deviceClass in getAllSubClasses(Device):
			if issubclass(self.__class__, deviceClass):
				name.append(deviceClass.__name__)
		return name
				
	
	def getState(self):
		return {}
	
	########
	# Meta #
	########
	class Meta:
		abstract = True

class OutputDevice(Device):
	##############
	# Parameters #
	##############
	Actions = models.ManyToManyField('Action', blank=True, null=True, related_name="%(app_label)s_%(class)s_Devices")
	
	########
	# Meta #
	########
	class Meta:
	 	abstract = True

class InputDevice(Device):
	##############
	# Parameters #
	##############
	events = models.ManyToManyField('TriggerEvent', related_name="%(app_label)s_%(class)s_Devices")
	
	########
	# Meta #
	########
	class Meta:
		abstract = True	