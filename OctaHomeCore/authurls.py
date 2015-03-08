from django.conf.urls import url
from OctaHomeCore.authviews import *

urlpatterns = [
    url(r'^Login/', handleLoginView.as_view(), name='Login'),
    url(r'^LogOut/', handleLogOutView.as_view(), name='LogOut')
]
