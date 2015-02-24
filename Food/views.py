from OctaHomeCore.baseviews import *
from OctaHomeCore.menumodels import *

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


#View Object
class handleRecipesView(viewRequestHandler):
	def getViewParameters(self):
		title = "Under Construction"
		stuff = "This Page Is Currently Under Construction"
		return {'PageAreaTitle':title, 'PageAreaContent': stuff}
	
	def getTemplate(self):
		return 'OctaHomeFood/Recipes'
	
	def getSidebarUrlName(self):
		return 'Recipes'

class handleMealsView(viewRequestHandler):
	def getViewParameters(self):
		title = "Under Construction"
		stuff = "This Page Is Currently Under Construction"
		return {'PageAreaTitle':title, 'PageAreaContent': stuff}
	
	def getTemplate(self):
		return 'OctaHomeFood/Meals'
	
	def getSidebarUrlName(self):
		return 'Meals'

class handleFridgeView(viewRequestHandler):
	def getViewParameters(self):
		title = "Under Construction"
		stuff = "This Page Is Currently Under Construction"
		return {'PageAreaTitle':title, 'PageAreaContent': stuff}
	
	def getTemplate(self):
		return 'OctaHomeFood/Meals'
	
	def getSidebarUrlName(self):
		return 'Fridge'