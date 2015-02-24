from django.conf.urls import url
from views import *

urlpatterns = [
	url(r'^Recipes/$', handleRecipesView.as_view(), name='Recipes'),
	url(r'^Meals/$', handleMealsView.as_view(), name='Meals'),
	url(r'^Fridge/$', handleFridgeView.as_view(), name='Fridge'),
]
