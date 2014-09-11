from django.conf.urls import url
from views import *

urlpatterns = [
	url(r'^$', handleHomeView.as_view(), name='Home'),
	url(r'^(?P<house>\w+)/$', handleHomeView.as_view(), name='Home'),
	url(r'^(?P<house>\w+)/(?P<room>\w+)/$', handleHomeView.as_view(), name='Home'),
	
	url(r'^command/(?P<command>\w+)/$', handleHomeCommand.as_view(), name='HomeCommand'),
]