from django.conf.urls import url
from messagecommands import *

urlpatterns = [
	url(r'^messages/(?P<command>\w+)/$', handleMessageCommand.as_view(), name='MessagesCommand'),
]
