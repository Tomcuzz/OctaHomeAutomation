from django.conf.urls import url
from messagecommands import *
from inputoutputviews import *

urlpatterns = [
	url(r'^messages/(?P<command>\w+)/$', handleMessageCommand.as_view(), name='MessagesCommand'),
]
