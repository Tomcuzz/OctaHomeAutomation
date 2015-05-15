from django.conf.urls import patterns, include, url

#from *.OctaFiles.Menus import *

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = [
	url(r'^jsreverse/$', 'django_js_reverse.views.urls_js', name='js_reverse'),
	
    url(r'^Auth/', include('OctaHomeCore.authurls')),
    url(r'^App/', include('OctaHomeAppInterface.urls')),
    url(r'^Core/', include('OctaHomeCore.coreurls')),
    url(r'^Device/', include('OctaHomeCore.deviceurls')),
    
    url(r'^HomeStats/', include('HomeStats.urls')),
    url(r'^Alarm/', include('Alarm.urls')),
    url(r'^TempControl/', include('TempControl.urls')),
    url(r'^Food/', include('Food.urls')),
    url(r'^Proxmox/', 'Proxmox.views.ProxmoxMain', name='Proxmox'),
    url(r'^DnsAdmin/', 'DnsAdmin.views.DnsAdminMain', name='DnsAdmin'),
    url(r'^Settings/', include('OctaHomeCore.settingsurls')),
    
    #Old Holders
    url(r'^DeviceInput$', 'Proxmox.views.ProxmoxMain', name='DeviceInput'),
    url(r'^api$', 'Proxmox.views.ProxmoxMain', name='Api'),
    
    url(r'^', include('Home.urls')),
]

handler404 = 'ErrorPages.views.Error404'
