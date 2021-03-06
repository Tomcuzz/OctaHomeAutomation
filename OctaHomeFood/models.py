from django.db import models
from OctaHomeCore.models import *

class Fridge(Device):
	
	class Meta:
		db_table = u'Fridges'


class Ingredients(OctaBaseModel):
	Category = models.ManyToManyField('IngredientsCategory', blank=True, null=True, related_name="Ingredients")
	FullAmount = models.IntegerField()
	MeasurementUnit = models.TextField(default="")
	
	class Meta:
		db_table = u'Ingredients'

class FridgeIngredientStockLevel(OctaBaseModel):
	Ingredient = models.ManyToManyField('Ingredients', blank=True, null=True, related_name="FridgeStockLevel")
	Fridge = models.ManyToManyField('Fridge', blank=True, null=True, related_name="Contents")
	StockLevel = models.DecimalField(default=0, decimal_places=5, max_digits=65)
	ExpirationDate = models.DateTimeField()
	
	class Meta:
		db_table = u'FridgeIngredientStock'


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