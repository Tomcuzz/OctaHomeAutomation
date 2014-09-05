from django.conf.urls import url
from views import *

urlpatterns = [
	url(r'^$', handleLightView.as_view(), name='Lights'),
	url(r'^(?P<page>\w+)/$', requestHandler.as_view(), name='LightsPage'),
	#url(r'^command/', views.CurtainsMain, name='LightCommand'),
]