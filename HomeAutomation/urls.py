from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

modulePatterns = [
	#url(r'^HomeStats/', 'HomeStats.views.HomeStatsMain', name='HomeStats'),
    #url(r'^Security/', 'Security.views.SecurityMain', name='Security'),
    #url(r'^Lights/', 'Lights.views.LightsMain', name='Lights'),
	url(r'^Lights/', include('Lights.urls')),
    #url(r'^Alarm/', 'Alarm.views.AlarmMain', name='Alarm'),
    #url(r'^Curtains/', 'Curtains.views.CurtainsMain', name='Curtains'),
    #url(r'^TempControl/', 'TempControl.views.TempControlMain', name='TempControl'),
    #url(r'^AudioVisual/', 'AudioVisual.views.AudioVisualMain', name='AudioVisual'),
    #url(r'^Meals/', 'Food.views.MealsMain', name='Meals'),
    #url(r'^Recipes/', 'Food.views.RecipesMain', name='Recipes'),
    #url(r'^Fridge/', 'Food.views.FridgeMain', name='Fridge'),
    #url(r'^DeviceInput/', 'DeviceInput.views.DeviceInputMain', name='DeviceInput'),
    url(r'^Proxmox/', 'Proxmox.views.ProxmoxMain', name='Proxmox'),
    url(r'^DnsAdmin/', 'DnsAdmin.views.DnsAdminMain', name='DnsAdmin'),
    url(r'^account/', 'Account.views.AccountMain', name='Account'),
    url(r'^Login', 'Account.views.LoginMain', name='Login'),
    #url(r'^api', 'Api.views.ApiMain', name='Api'),
    
    #Old Holders
    url(r'^HomeStats$', 'HomeStats.views.HomeStatsMain', name='HomeStats'),
    url(r'^Security$', 'HomeStats.views.HomeStatsMain', name='Security'),
    url(r'^Alarm$', 'HomeStats.views.HomeStatsMain', name='Alarm'),
    url(r'^Curtains$', 'HomeStats.views.HomeStatsMain', name='Curtains'),
    url(r'^TempControl$', 'HomeStats.views.HomeStatsMain', name='TempControl'),
    url(r'^AudioVisual$', 'HomeStats.views.HomeStatsMain', name='AudioVisual'),
    url(r'^Meals$', 'HomeStats.views.HomeStatsMain', name='Meals'),
    url(r'^Recipes$', 'HomeStats.views.HomeStatsMain', name='Recipes'),
    url(r'^Fridge$', 'HomeStats.views.HomeStatsMain', name='Fridge'),
    url(r'^DeviceInput$', 'HomeStats.views.HomeStatsMain', name='DeviceInput'),
    url(r'^api$', 'HomeStats.views.HomeStatsMain', name='Api'),
    
    url(r'^', include('Home.urls')),
]

urlpatterns = patterns('',
    url(r'^(?P<protocal>(html|xml|json|cisco)+)/', include(modulePatterns)),
    url(r'^', include(modulePatterns)),
)

handler404 = 'ErrorPages.views.Error404'
