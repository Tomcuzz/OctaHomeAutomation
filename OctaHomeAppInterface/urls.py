from django.conf.urls import url
from views import *

urlpatterns = [
    url(r'^Auth/', handleDeviceLoginView.as_view(), name='DeviceLogin')
]
