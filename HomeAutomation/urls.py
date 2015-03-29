from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

modulePatterns = [
    url(r'^Auth/', include('OctaHomeCore.authurls')),
    url(r'^App/', include('OctaHomeAppInterface.urls')),
    url(r'^Core/', include('OctaHomeCore.coreurls')),
    url(r'^Device/', include('OctaHomeCore.deviceurls')),
    
    url(r'^HomeStats/', include('HomeStats.urls')),
	url(r'^Lights/', include('Lights.urls')),
    url(r'^Alarm/', include('Alarm.urls')),
    url(r'^Security/', include('Security.urls')),
    url(r'^Curtains/', include('Curtains.urls')),
    url(r'^TempControl/', include('TempControl.urls')),
    url(r'^AudioVisual/', include('AudioVisual.urls')),
    url(r'^Food/', include('Food.urls')),
    url(r'^Proxmox/', 'Proxmox.views.ProxmoxMain', name='Proxmox'),
    url(r'^DnsAdmin/', 'DnsAdmin.views.DnsAdminMain', name='DnsAdmin'),
    url(r'^Settings/', include('OctaHomeCore.settingsurls')),
    
    #Old Holders
    url(r'^DeviceInput$', 'Proxmox.views.ProxmoxMain', name='DeviceInput'),
    url(r'^api$', 'Proxmox.views.ProxmoxMain', name='Api'),
    
    url(r'^', include('Home.urls')),
]

urlpatterns = patterns('',
	url(r'^jsreverse/$', 'django_js_reverse.views.urls_js', name='js_reverse'),
    url(r'^(?P<protocal>(html|xml|json|cisco)+)/', include(modulePatterns)),
    url(r'^', include(modulePatterns)),
)

handler404 = 'ErrorPages.views.Error404'
