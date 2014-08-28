from django.db import models

##
# Location Types
##
class World(models.Model):
	name = models.CharField(max_length=30)
	class Meta:
		db_table = u'Worlds'

class Country(models.Model):
	name = models.CharField(max_length=30)
	world = models.ForeignKey(World, related_name="countrys")
	class Meta:
		db_table = u'Country'


class Home(models.Model):
	name = models.CharField(max_length=30)
	country = models.ForeignKey(World, related_name="homes")
	class Meta:
		db_table = u'Homes'

class Room(models.Model):
	name = models.CharField(max_length=30)
	home = models.ForeignKey(Home, related_name="rooms")
	class Meta:
		db_table = u'Rooms'

##
# Device Types
##
class Device(models.Model):
	name = models.CharField(max_length=30)
	room = models.ManyToManyField(Room, related_name="devices")
	ipAddress = models.TextField()
	port = models.IntegerField()
	
	class Meta:
		abstract = True

class OutputDevice(Device):
	class Meta:
	 	abstract = True

class InputDevice(Device):
	events = models.ManyToManyField(Event, related_name="inputDevice")
	class Meta:
		abstract = True	



##
# Input/Output
##
class Action(models.Model):
	name = models.CharField(max_length=30)
	device = models.ManyToManyField(Action, related_name="actions")
	
	@abstractmethod
	def run():
		pass
	
	class Meta:
		abstract = True


class Event(models.Model):
	name = models.CharField(max_length=30)
	actions = models.ManyToMany(Action, related_name="events")
	
	def call():
		for (action in self.actions):
			action.run()
	
	class Meta:
		abstract = True


