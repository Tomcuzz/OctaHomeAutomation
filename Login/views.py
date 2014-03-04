# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.contrib.auth import authenticate, login
from django.shortcuts import redirect

def LoginMain(request):
	if request.POST.get('username', 'None') == 'None':
		return returnLogin(request)
	else:
		if request.POST.get('password', 'None') == 'None':
			return returnLogin(request)
		else:
			return checkLogin(request)

def returnLogin(request):
	nextPage = request.GET.get('next', 'Home')
	return render(request, 'pages/Login.html', {'nextPage': nextPage})

def checkLogin(request):
	username = request.POST.get('username', 'None')
	password = request.POST.get('password', 'None')
	user = authenticate(username=username, password=password)
	if user is not None:
		# the password verified for the user
		if user.is_active:
			login(request, user)
			nextPage = request.POST.get('next', 'Home')
			return redirect(nextPage)
			#print("User is valid, active and authenticated")
		else:
			return returnLogin(request)
			#print("The password is valid, but the account has been disabled!")
	else:
		return returnLogin(request)
		# the authentication system was unable to verify the username and password
		#print("The username and password were incorrect.")
