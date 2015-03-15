from django.conf.urls import url
from settingviews import *
from inputoutputviews import *

urlpatterns = [
	url(r'^command/(?P<command>\w+)/$', handleSettingsCommand.as_view(), name='SettingsCommand'),
	url(r'^command/(?P<command>\w+)/(?P<SettingsType>\w+)/(?P<SettingsId>\d+)/$', handleSettingsCommand.as_view(), name='SettingsCommand'),
	
	url(r'^page/(?P<page>\w+)/$', handleSettingsView.as_view(), name='SettingsPage'),
	url(r'^page/(?P<house>\w+)/(?P<page>\w+)/$', handleSettingsView.as_view(), name='SettingsPage'),
	url(r'^page/(?P<house>\w+)/(?P<room>\w+)/(?P<page>\w+)/$', handleSettingsView.as_view(), name='SettingsPage'),
	
	url(r'^$', handleSettingsView.as_view(), name='Settings'),
	url(r'^(?P<house>\w+)/$', handleSettingsView.as_view(), name='Settings'),
	url(r'^(?P<house>\w+)/(?P<room>\w+)/$', handleSettingsView.as_view(), name='Settings'),
	url(r'^(?P<house>\w+)/(?P<room>\w+)/(?P<SettingsType>\w+)/(?P<SettingsId>\d+)/$', handleSettingsView.as_view(), name='Settings'),
]
