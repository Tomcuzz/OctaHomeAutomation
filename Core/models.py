from django.db import models
from django.contrib.contenttypes.generic import *
import json

##
# Location Types
##
class World(models.Model):
	Name = models.CharField(max_length=30)
	class Meta:
		db_table = u'Worlds'

class Country(models.Model):
	Name = models.CharField(max_length=30)
	World = models.ForeignKey(World, blank=True, null=True, related_name="Countrys")
	class Meta:
		db_table = u'Country'


class Home(models.Model):
	Name = models.CharField(max_length=30)
	Country = models.ForeignKey(Country, blank=True, null=True, related_name="Homes")
	class Meta:
		db_table = u'Homes'

class Room(models.Model):
	Name = models.CharField(max_length=30)
	Home = models.ForeignKey(Home, blank=True, null=True, related_name="Rooms")
	class Meta:
		db_table = u'Rooms'

##
# Device Types
##
class Device(models.Model):
	Name = models.CharField(max_length=30)
	Room = models.ForeignKey(Room, blank=True, null=True, related_name="Devices")
	IpAddress = models.TextField()
	Port = models.IntegerField()
	
	@staticmethod
	def getDevices(kwargs={}, deviceType=''):
		devices = []
		
		if kwargs.has_key('house') and kwargs['house'] != 'all':
			if kwargs.has_key('room') and kwargs['room'] != 'all':
				rooms = Room.objects.filter(id=kwargs['room'])
			else:
				house = Home.objects.filter(id=kwargs['house'])
				rooms = Room.objects.filter(Home=house)
		else:
			rooms = Room.objects.all()
		
		for room in rooms:
			for device in room.Devices.all():
				if deviceType != '' and deviceType in device.getObjectType():
					devices.append(device)
				else:
					devices.append(device)
		
		return devices
	
	def getObjectType(self):
		return ['Device']
	
	class Meta:
		abstract = True

class OutputDevice(Device):
	def listActions(self):
		pass
	
	def	handleAction(self, function, parameters):
		pass
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'OutputDevice')
	
	def getObjectType(self):
		supersType = super(OutputDevice, self).getObjectType()
		return supersType + ["OutputDevice"]
	
	class Meta:
	 	abstract = True

class InputDevice(Device):
	#events = models.ManyToManyField(Event, related_name="inputDevice")
	
	def getObjectType(self):
		supersType = super(InputDevice, self).getObjectType()
		return supersType + ["InputDevice"]
	
	@staticmethod
	def getDevices(kwargs={}):
		return Device.getDevices(kwargs, 'InputDevice')
	
	class Meta:
		abstract = True	



##
# Input/Output
##
class Action(models.Model):
	Name = models.CharField(max_length=30)
	Devices = GenericRelation(OutputDevice, related_query_name="Actions")
	Parameters = models.TextField()
	
	def getParameters(self):
		return json.loads(self.parameters)
	
	def setParameters(self, array):
		self.parameters = json.dumps(array)
	
	def run():
		for device in self.Devices:
			functionName = parameters[device.Name]['name']
			functionParameters = parameters[device.Name]['parameters']
			if functionName != '':
				device.handleAction(functionName, functionParameters)
	
	class Meta:
		abstract = True


class Event(models.Model):
	Name = models.CharField(max_length=30)
	Actions = GenericRelation(Action, related_query_name="Events")
	
	def call():
		for action in self.actions:
			action.run()
	
	class Meta:
		abstract = True


