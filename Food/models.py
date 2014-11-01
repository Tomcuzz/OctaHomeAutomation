from django.db import models

class Fridge(models.Model):
	Name = models.CharField(max_length=30)
	Room = models.ManyToManyField(Room, blank=True, null=True, related_name="%(app_label)s_%(class)s_Devices")
	Contents = models.ManyToManyField(Ingredents, blank=True, null=True, related_name="Fridge")
	
	class Meta:
		db_table = u'Fridge'


class Ingredients(models.Model):
	Name = models.CharField(max_length=30)
	Category = models.ManyToManyField(IngredentsCategory, blank=True, null=True, related_name="Ingredients")
	LocalAmount = models.IntegerField()
	MeasurementUnit = models.TextField(default="")
	
	class Meta:
		db_table = u'Ingredents'

class Recipes(models.Model):
	Name = models.CharField(max_length=30)
	Category = models.ManyToManyField(RecipesCategory, blank=True, null=True, related_name="Recipes")
	Ingredients = models.TextField(default="")
	Steps = models.TextField(default="")
	
	class Meta:
		db_table = u'Recipes'


class Category(models.Model):
	Name = models.CharField(max_length=30)
	
	class Meta:
		abstract = True

class IngredientsCategory(Category):
	class Meta:
		db_table = u'IngredentsCategory'

class RecipesCategory(Category):
	class Meta:
		db_table = u'IngredentsCategory'