from OctaHomeCore.OctaFiles.menus.base import *

#Nav Bar Item
class FoodTopNavBarItem(TopNavBarItem):
	Priority = 40
	DisplayName = "Food"
	Link = "#"

class MealsTopNavBarItem(TopNavBarItem):
	ParentItem = "Food"
	Priority = 20
	DisplayName = "Meals"
	
	@property
	def Link(self):
		return reverse('Meals')

class RecipesTopNavBarItem(TopNavBarItem):
	ParentItem = "Food"
	Priority = 20
	DisplayName = "Recipes"
	
	@property
	def Link(self):
		return reverse('Recipes')

class FridgeTopNavBarItem(TopNavBarItem):
	ParentItem = "Food"
	Priority = 20
	DisplayName = "Fridge"
	
	@property
	def Link(self):
		return reverse('Fridge')