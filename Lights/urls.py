from django.conf.urls import url
from . import views

urlpatterns = [
	url(r'^$', views.requestHandler, name='Lights'),
	url(r'^(?P<page>\w+)/$', views.requestHandler, name='LightsPage'),
	url(r'^command/', views.CurtainsMain, name='LightCommand'),
]