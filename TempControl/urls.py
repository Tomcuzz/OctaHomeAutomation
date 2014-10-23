from django.conf.urls import url
from views import *

urlpatterns = [
	url(r'^command/(?P<command>\w+)/$', handleTempCommand.as_view(), name='TempControlCommandWithOutDevice'),
	url(r'^command/(?P<command>\w+)/(?P<lightType>\w+)/(?P<lightId>\d+)/$', handleTempCommand.as_view(), name='TempControlCommand'),
	url(r'^command/(?P<command>\w+)/(?P<house>\w+)/(?P<lightType>\w+)/(?P<lightId>\d+)/$', handleTempCommand.as_view(), name='TempControlCommand'),
	url(r'^command/(?P<command>\w+)/(?P<house>\w+)/(?P<room>\w+)/(?P<lightType>\w+)/(?P<lightId>\d+)/$', handleTempCommand.as_view(), name='TempControlCommand'),
	
	url(r'^page/(?P<page>\w+)/$', handleTempView.as_view(), name='TempControlPage'),
	url(r'^page/(?P<house>\w+)/(?P<page>\w+)/$', handleTempView.as_view(), name='TempControlPage'),
	url(r'^page/(?P<house>\w+)/(?P<room>\w+)/(?P<page>\w+)/$', handleTempView.as_view(), name='TempControlPage'),
	
	url(r'^$', handleTempView.as_view(), name='TempControl'),
	url(r'^(?P<house>\w+)/$', handleTempView.as_view(), name='TempControl'),
	url(r'^(?P<house>\w+)/(?P<room>\w+)/$', handleTempView.as_view(), name='TempControl'),
	url(r'^(?P<house>\w+)/(?P<room>\w+)/(?P<lightType>\w+)/(?P<lightId>\d+)/$', handleTempView.as_view(), name='TempControl'),
]
