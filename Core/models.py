from django.db import models
from django.contrib.contenttypes.generic import *
import json

##
# Location Types
##
class World(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Worlds'

class Country(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	World = models.ForeignKey(World, blank=True, null=True, related_name="Countrys")
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Country'


class Home(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Country = models.ForeignKey(Country, blank=True, null=True, related_name="Homes")
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Homes'

class Room(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Home = models.ForeignKey(Home, blank=True, null=True, related_name="Rooms")
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Rooms'


def getNonAbstractDeviceClasses(cls):
	classes = []
	for subclass in cls.__subclasses__():
		if subclass._meta.abstract:
			classes.extend(getNonAbstractDeviceClasses(subclass))
		else:
			classes.append(subclass)
	return classes

def getAllDeviceClasses(cls):
	classes = [cls]
	for subclass in cls.__subclasses__():
		classes.extend(getAllDeviceClasses(subclass))
	return classes

##
# Device Types
##
class Device(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Rooms = models.ManyToManyField(Room, blank=True, null=True, related_name="%(app_label)s_%(class)s_Devices")
	IpAddress = models.TextField()
	Port = models.IntegerField()
	
	#################
	# Class Methods #
	#################
	@classmethod
	def getDevices(cls, kwargs={}):
		devices = []
		
		for deviceClass in getNonAbstractDeviceClasses(cls):
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
		for deviceClass in getNonAbstractDeviceClasses(cls):
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
			for deviceClass in getNonAbstractDeviceClasses(cls):
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
		for deviceClass in getAllDeviceClasses(Device):
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
	########
	# Meta #
	########
	class Meta:
	 	abstract = True

class InputDevice(Device):
	##############
	# Parameters #
	##############
	events = models.ManyToManyField('Event', related_name="%(app_label)s_%(class)s_Devices")
	
	########
	# Meta #
	########
	class Meta:
		abstract = True	



##
# Input/Output
##
class Action(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Devices = GenericRelation(OutputDevice, related_query_name="Actions")
	Parameters = models.TextField()
	RunIsAsync = models.BooleanField(default=False)
	
	##################
	# Object Methods #
	##################
	def getParameters(self):
		return json.loads(self.parameters)
	
	def setParameters(self, array):
		self.parameters = json.dumps(array)
	
	def run(currentRunType = False):
		if self.RunIsAsync == False or self.RunIsAsync == currentRunType:
			for device in self.Devices:
				functionName = self.getParameters()[device.Name]['name']
				functionParameters = self.getParameters()[device.Name]['parameters']
				if functionName != '':
					device.handleAction(functionName, functionParameters)
		else:
			raise Exception('ASYNC NOT IMPLEMENTED')
	
	########
	# Meta #
	########
	class Meta:
		abstract = True


class Event(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Actions = GenericRelation(Action, related_query_name="Events")
	
	##################
	# Object Methods #
	##################
	def call():
		for action in self.actions:
			action.run()
	
	########
	# Meta #
	########
	class Meta:
		abstract = True


