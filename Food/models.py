from django.db import models

class Ingredents(models.Model):
	Name = models.TextField(default="")
	Category = models.TextField(default="")
	LocalAmount = models.IntegerField()
	MeasurementUnit = models.TextField(default="")
	
	class Meta:
		db_table = u'Ingredents'

class Recipes(models.Model):
	Name = models.TextField(default="")
	Category = models.TextField(default="")
	Ingredients = models.TextField(default="")
	Steps = models.TextField(default="")
	
	class Meta:
		db_table = u'Recipes'