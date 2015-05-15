from OctaHomeCore.baseviews import *

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