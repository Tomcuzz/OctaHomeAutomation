from OctaHomeCore.OctaFiles.urls.base import *
from OctaHomeCore.settingviews import *

class SettingsOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
			url(r'^Settings/command/(?P<command>\w+)/$', handleSettingsCommand.as_view(), name='SettingsCommand'),
			url(r'^Settings/command/(?P<command>\w+)/(?P<SettingsType>\w+)/(?P<SettingsId>\d+)/$', handleSettingsCommand.as_view(), name='SettingsCommand'),
			
			url(r'^Settings/page/(?P<page>\w+)/$', handleSettingsView.as_view(), name='SettingsPage'),
			url(r'^Settings/page/(?P<house>\w+)/(?P<page>\w+)/$', handleSettingsView.as_view(), name='SettingsPage'),
			url(r'^Settings/page/(?P<house>\w+)/(?P<room>\w+)/(?P<page>\w+)/$', handleSettingsView.as_view(), name='SettingsPage'),
			
			url(r'^Settings/$', handleSettingsView.as_view(), name='Settings'),
			url(r'^Settings/(?P<house>\w+)/$', handleSettingsView.as_view(), name='Settings'),
			url(r'^Settings/(?P<house>\w+)/(?P<room>\w+)/$', handleSettingsView.as_view(), name='Settings'),
			url(r'^Settings/(?P<house>\w+)/(?P<room>\w+)/(?P<SettingsType>\w+)/(?P<SettingsId>\d+)/$', handleSettingsView.as_view(), name='Settings'),
		]
