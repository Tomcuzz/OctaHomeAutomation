from django.conf.urls import patterns, include, url
from OctaHomeCore.OctaFiles.urls import *

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = [
	url(r'^jsreverse/$', 'django_js_reverse.views.urls_js', name='js_reverse')
]

urlpatterns.extend(OctaUrls.getAllUrls())


handler404 = 'ErrorPages.views.Error404'
