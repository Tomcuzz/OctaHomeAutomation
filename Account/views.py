# Create your views here
from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import logout
from django.contrib.auth.forms import UserCreationForm
from django.middleware.csrf import get_token

from models import *
from Weather.models import *

from commands import *
from sideBar import *

def AccountMain(request):
	if not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	elif request.GET.get('command', '') != '':
		return AccountCommand(request)
	else:
		page = request.GET.get('page', 'editPersonalDetails')
		links = getSideBar(request.GET.get(page), request)
		
		if page == "editPersonalDetails":
			return render(request, 'pages/Account/EditUser.html', {'csrfToken':get_token(request), 'username':AccountModel().getUserName(request), 'firstname':AccountModel().getName(request), 'surname':AccountModel().getSurName(request), 'email':AccountModel().getEmail(request), 'isAdmin':AccountModel().isAdmin(request), 'location':AccountModel().getWeatherLocation(request), 'links': links})
		elif page == "EditUsers":
			return render(request, 'pages/Account/EditUsers.html', {'csrfToken':get_token(request), 'users':AccountModel().getAllUsers(), 'links': links})
		elif page == "AddUser":
			locations = WeatherLocations.objects.order_by('name').all()
			return render(request, 'pages/Account/AddUser.html', {'csrfToken':get_token(request), 'links': links, 'locations': locations})
		elif page == "LogOut":
			logout(request)
			return redirect('/Login')
		else:
			raise Http404
