from django.conf.urls import url
from views import *

urlpatterns = [
	url(r'^$', handleLightView.as_view(), name='Lights'),
	url(r'^(?P<house>\w+)/$', handleLightView.as_view(), name='Lights'),
	url(r'^(?P<house>\w+)/(?P<room>\w+)/$', handleLightView.as_view(), name='Lights'),
	
	url(r'^(?P<page>\w+)/$', handleLightView.as_view(), name='LightPage'),
	url(r'^(?P<house>\w+)/(?P<page>\w+)/$', handleLightView.as_view(), name='LightPage'),
	url(r'^(?P<house>\w+)/(?P<room>\w+)/(?P<page>\w+)/$', handleLightView.as_view(), name='LightPage'),
	
	url(r'^command/(?P<command>\w+)/$', handleLightCommand.as_view(), name='LightCommandWithOutLight'),
	url(r'^command/(?P<command>\w+)/(?P<lightType>\w+)/(?P<lightId>\d+)/$', handleLightCommand.as_view(), name='LightCommand'),
	url(r'^command/(?P<command>\w+)/(?P<house>\w+)/(?P<lightType>\w+)/(?P<lightId>\d+)/$', handleLightCommand.as_view(), name='LightCommand'),
	url(r'^command/(?P<command>\w+)/(?P<house>\w+)/(?P<room>\w+)/(?P<lightType>\w+)/(?P<lightId>\d+)/$', handleLightCommand.as_view(), name='LightCommand'),
]
