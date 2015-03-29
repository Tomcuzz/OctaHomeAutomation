from django.conf.urls import url
from views import *

urlpatterns = [
    url(r'^AudioVisual$', 'Proxmox.views.ProxmoxMain', name='AudioVisual'),
]