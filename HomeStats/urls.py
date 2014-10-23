from django.conf.urls import url
from views import *

urlpatterns = [
	url(r'^$', handleHomeStatsView.as_view(), name='HomeStats'),
]