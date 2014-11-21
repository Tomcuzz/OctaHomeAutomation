from django.db import models

##################
# Location Types #
##################
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
