from django.conf.urls import url
from views import *

urlpatterns = [
	url(r'^$', handleLightView.as_view(), name='Lights'),
	url(r'^(?P<page>\w+)/$', handleLightView.as_view(), name='LightPage'),
	url(r'^command/(?P<command>\w+)/(?P<lightName>\d+)/$', handleLightCommand.as_view(), name='LightCommand'),
]