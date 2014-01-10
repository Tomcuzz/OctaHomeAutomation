from django.conf.urls import patterns, include, url

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'HomeAutomation.views.home', name='home'),
    # url(r'^HomeAutomation/', include('HomeAutomation.foo.urls')),
    url(r'^$', 'Home.views.HomeMain', name='Home'),
    url(r'^HomeStats/', 'HomeStats.views.HomeStatsMain', name='HomeStats'),
    url(r'^Security/', 'Security.views.SecurityMain', name='Security'),
    url(r'^Lights/', 'Lights.views.LightsMain', name='Lights'),
    url(r'^Alarm/', 'Alarm.views.AlarmMain', name='Alarm'),
    url(r'^Curtains/', 'Curtains.views.CurtainsMain', name='Curtains'),
    url(r'^TempControl/', 'TempControl.views.TempControlMain', name='TempControl'),
    url(r'^AudioVisual/', 'AudioVisual.views.AudioVisualMain', name='AudioVisual'),
    url(r'^Meals/', 'Meals.views.MealsMain', name='Meals'),
    url(r'^Recipes/', 'Recipes.views.RecipesMain', name='Recipes'),
    url(r'^DeviceInput/', 'DeviceInput.views.DeviceInputMain', name='DeviceInput'),
    url(r'^Proxmox/', 'Proxmox.views.ProxmoxMain', name='Proxmox'),
    url(r'^account/', 'Account.views.AccountMain', name='Account'),
    url(r'^Login', 'Login.views.LoginMain', name='Login'),
    url(r'^api', 'Api.views.ApiMain', name='Api'),
    
    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    
    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)

handler404 = 'ErrorPages.views.Error404'
