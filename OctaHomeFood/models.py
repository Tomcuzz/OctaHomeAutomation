from django.db import models
from OctaHomeCore.models import *

class Fridge(Device):
	Contents = models.ManyToManyField('Ingredients', blank=True, null=True, related_name="Fridge")
	
	class Meta:
		db_table = u'Fridge'


class Ingredients(OctaBaseModel):
	Category = models.ManyToManyField('IngredientsCategory', blank=True, null=True, related_name="Ingredients")
	LocalAmount = models.IntegerField()
	MeasurementUnit = models.TextField(default="")
	
	class Meta:
		db_table = u'Ingredients'

class Recipes(OctaBaseModel):
	Category = models.ManyToManyField('RecipesCategory', blank=True, null=True, related_name="Recipes")
	Ingredients = models.TextField(default="")
	Steps = models.TextField(default="")
	
	class Meta:
		db_table = u'Recipes'


class Category(OctaBaseModel):
	class Meta:
		abstract = True

class IngredientsCategory(Category):
	class Meta:
		db_table = u'IngredientsCategory'

class RecipesCategory(Category):
	class Meta:
		db_table = u'RecipesCategory'