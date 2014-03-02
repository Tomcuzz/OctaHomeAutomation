from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, Http404

# Create your views here.

def DnsAdminMain(request):
	links = [{'title': 'Zones', 'address': '', 'active': ''}]
	return render(request, 'pages/DnsAdmin/Settings.html', {'links': links})