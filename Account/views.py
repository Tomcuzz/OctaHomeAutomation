# Create your views here
from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.contrib.auth import authenticate, login
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import logout
from django.contrib.auth.forms import UserCreationForm
from django.middleware.csrf import get_token
from django.conf import settings

from authy.api import AuthyApiClient

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
		links = getSideBar(page, request)
		
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


def LoginMain(request):
	if request.POST.get('command', 'None') == 'sendsms':
		username = request.POST.get('username', 'None')
		if username == 'None':
			aUser = CustomUser.objects.get(username=username)
			
			authy_api = AuthyApiClient(settings.AUTHY_API_KEY)
			sms = authy_api.users.request_sms(aUser.authy_id, {"force": True})
			if sms.ok():
				return HttpResponse("Token Sent")
			else:
				return HttpResponse(sms.errors())
		else:
			return HttpResponse("No Username")
	if request.POST.get('username', 'None') == 'None':
		return returnLogin(request)
	else:
		if request.POST.get('password', 'None') == 'None':
			return returnLogin(request)
		else:
			return checkLogin(request)

def returnLogin(request, sencondAttempt=False):
	nextPage = request.GET.get('next', 'Home')
	return render(request, 'pages/Account/Login.html', {'nextPage': nextPage, 'sencondattempt':sencondAttempt})
	
def returnAuthyCheckPage(request, sencondAttempt=False):
	nextPage = request.GET.get('next', 'Home')
	username = request.POST.get('username', 'None')
	password = request.POST.get('password', 'None')
	return render(request, 'pages/Account/AuthyLogin.html', {'nextPage': nextPage, 'username':username, 'password':password, 'sencondattempt':sencondAttempt})

def checkLogin(request):
	username = request.POST.get('username', 'None')
	password = request.POST.get('password', 'None')
	authyToken = request.POST.get('authytoken', '')
	user = authenticate(username=username, password=password)
	if user is not None:
		# the password verified for the user
		if user.is_active:
			if user.authy_id != '':
				if authyToken != '':
					if checkAuthy(authyToken, user.authy_id):
						login(request, user)
						nextPage = request.POST.get('next', 'Home')
						return redirect(nextPage)
					else:
						return returnAuthyCheckPage(request, sencondAttempt=True)
				else:
					return returnAuthyCheckPage(request)
			else:
				login(request, user)
				nextPage = request.POST.get('next', 'Home')
				return redirect(nextPage, sencondAttempt=True)
				#print("User is valid, active and authenticated")
		else:
			return returnLogin(request, sencondAttempt=True)
			#print("The password is valid, but the account has been disabled!")
	else:
		return returnLogin(request, sencondAttempt=True)
		# the authentication system was unable to verify the username and password
		#print("The username and password were incorrect.")

def checkAuthy(token, authyId):
	authy_api = AuthyApiClient(settings.AUTHY_API_KEY)
	verification = authy_api.tokens.verify(authyId, token)
	if verification.ok():
		return True
	else:
		return False