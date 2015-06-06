from OctaHomeCore.OctaFiles.urls.base import *
from OctaHomeFood.views import *

class FoodOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^Food/Recipes/$', handleRecipesView.as_view(), name='Recipes'),
			url(r'^Food/Meals/$', handleMealsView.as_view(), name='Meals'),
			url(r'^Food/Fridge/$', handleFridgeView.as_view(), name='Fridge'),
		]
