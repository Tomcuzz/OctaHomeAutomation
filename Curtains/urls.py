from django.conf.urls import url
from views import *

urlpatterns = [
    url(r'^$', 'Proxmox.views.ProxmoxMain', name='Curtains'),
]