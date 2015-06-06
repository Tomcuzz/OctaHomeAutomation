from django.db import models
from OctaHomeCore.models import *

class Fridge(Device):
	Contents = models.ManyToManyField('Ingredients', blank=True, null=True, related_name="Fridge")
	
	class Meta:
		db_table = u'Fridges'


class Ingredients(OctaBaseModel):
	Category = models.ManyToManyField('IngredientsCategory', blank=True, null=True, related_name="Ingredients")
	FullAmount = models.IntegerField()
	MeasurementUnit = models.TextField(default="")
	
	class Meta:
		db_table = u'Ingredients'

class FridgeIngredientStockLevel(OctaBaseModel):
	Ingredient = models.ManyToManyField('Ingredient', blank=True, null=True, related_name="FridgeStockLevel")
	Fridge = models.ManyToManyField('Fridge', blank=True, null=True, related_name="IngredientStock")
	StockLevel = models.DecimalField(default=0)
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