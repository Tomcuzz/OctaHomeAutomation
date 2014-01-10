# Create your views here
from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth import logout
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

from models import *

def AccountCommand(request):
	if request.GET.get('command', 'editPersonalDetails') == 'LogOut':
		logout(request)
		return redirect('/Login')
	elif request.GET.get('command', 'editPersonalDetails') == 'addUserComplete':
		if request.user.is_superuser:
			username = request.POST.get('username', '')
			password = request.POST.get('password', '')
			email = request.POST.get('email', '')
			firstName = request.POST.get('firstName', '')
			surname = request.POST.get('surname', '')
			activeState = request.POST.get('activeState', '')
			userLevel = request.POST.get('userLevel', '')
			
			user = CustomUser.objects.create_user(email, firstName, surname, password)
			user.username = username
			user.first_name = firstName
			user.last_name = surname
			if activeState == "Active":
				user.is_active = True
			else:
				user.is_active = False
			if userLevel == "Admin":
				user.is_superuser = True
			else:
				user.is_superuser = False
			user.save()
			return redirect('/account/?page=EditUsers')
		else:
			links = getSideBar(request.GET.get('command', 'editPersonalDetails'), request)
			return render(request, 'pages/Account.html', {'PageAreaTitle': "Add User", 'PageAreaContent': "Privilege Authentication Failure", 'links': links})
	elif request.GET.get('command', 'editPersonalDetails') == 'deleteUser':
		if request.user.is_superuser:
			username = request.GET.get('user', '')
			if username != '':
				u = CustomUser.objects.get(username__exact=username)
				u.delete()
				return HttpResponse("Ok")
			else:
				return HttpResponse("An Error Has Occured, Please Try Again Later", status=400)
			return HttpResponse("Ok")
		else:
			return HttpResponse("Authentication Error", status=400)
	elif request.GET.get('command', 'editPersonalDetails') == 'changeUsername':
		newUsername = request.POST.get('value','')
		if newUsername == "":
			return HttpResponse("No Email Entered", status=400)
		if request.GET.get('editCurrentUser', '') == '':
			if request.user.is_superuser:
				username = request.GET.get('user', '')
				if username != '':
					u = CustomUser.objects.get(username__exact=username)
					u.username = newUsername
					u.save()
					return HttpResponse("Ok")
				else:
					return HttpResponse("An Error Has Occured, Please Try Again Later", status=400)
			else:
				return HttpResponse("Authentication Error", status=400)
		else:
			u = request.user
			u.username = newUsername
			u.save()
			return HttpResponse("Ok")
	elif request.GET.get('command', 'editPersonalDetails') == 'changePassword':
		newPassword = request.POST.get('value','')
		if newPassword == "":
			return HttpResponse("No Password Entered", status=400)
		if request.GET.get('editCurrentUser', '') == '':
			if request.user.is_superuser:
				username = request.GET.get('user', '')
				if username != '':
					u = CustomUser.objects.get(username__exact=username)
					u.set_password(newPassword)
					u.save()
					return HttpResponse("Ok")
				else:
					return HttpResponse("An Error Has Occured, Please Try Again Later", status=400)
			else:
				return HttpResponse("Authentication Error", status=400)
		else:
			u = request.user
			u.set_password(newPassword)
			u.save()
			return HttpResponse("Ok")
	elif request.GET.get('command', 'editPersonalDetails') == 'changeFirstName':
		newFirstName = request.POST.get('value','')
		if newFirstName == "":
			return HttpResponse("No Name Entered", status=400)
		if request.GET.get('editCurrentUser', '') == '':
			if request.user.is_superuser:
				username = request.GET.get('user', '')
				if username != '':
					u = CustomUser.objects.get(username__exact=username)
					u.first_name = newFirstName
					u.save()
					return HttpResponse("Ok")
				else:
					return HttpResponse("An Error Has Occured, Please Try Again Later", status=400)
			else:
				return HttpResponse("Authentication Error", status=400)
		else:
			u = request.user
			u.first_name = newFirstName
			u.save()
			return HttpResponse("Ok")
	elif request.GET.get('command', 'editPersonalDetails') == 'changeSecondName':
		newSecondName = request.POST.get('value','')
		if newSecondName == "":
			return HttpResponse("No Name Entered", status=400)
		if request.GET.get('editCurrentUser', '') == '':	
			if request.user.is_superuser:
				username = request.GET.get('user', '')
				if username != '':
					u = CustomUser.objects.get(username__exact=username)
					u.last_name = newSecondName
					u.save()
					return HttpResponse("Ok")
				else:
					return HttpResponse("An Error Has Occured, Please Try Again Later", status=400)
			else:
				return HttpResponse("Authentication Error", status=400)
		else:
			u = request.user
			u.last_name = newSecondName
			u.save()
			return HttpResponse("Ok")
	elif request.GET.get('command', 'editPersonalDetails') == 'changeEmail':
		newEmail = request.POST.get('value','')
		if newEmail == "":
			return HttpResponse("No Email Entered", status=400)
		if request.GET.get('editCurrentUser', '') == '':
			if request.user.is_superuser:
				username = request.GET.get('user', '')
				if username != '':
					u = CustomUser.objects.get(username__exact=username)
					u.email = newEmail
					u.save()
					return HttpResponse("Ok")
				else:
					return HttpResponse("An Error Has Occured, Please Try Again Later", status=400)
			else:
				return HttpResponse("Authentication Error", status=400)
		else:
			u = request.user
			u.email = newEmail
			u.save()
			return HttpResponse("Ok")
	elif request.GET.get('command', 'editPersonalDetails') == 'changeAdminLevel':
		if request.user.is_superuser:
			username = request.GET.get('user', '')
			if username != '':
				newAdminLevel = request.POST.get('value','')
				u = CustomUser.objects.get(username__exact=username)
				if newAdminLevel == "2":
					u.is_superuser = True
				else:
					u.is_superuser = False
				u.save()
				return HttpResponse("Ok")
			else:
				return HttpResponse("An Error Has Occured, Please Try Again Later", status=400)
		else:
			return HttpResponse("Authentication Error", status=400)
	elif request.GET.get('command', 'editPersonalDetails') == 'changeActiveState':
		if request.user.is_superuser:
			username = request.GET.get('user', '')
			if username != '':
				newActiveState = request.POST.get('value','')
				u = CustomUser.objects.get(username__exact=username)
				if newActiveState == "1":
					u.is_active = True
				else:
					u.is_active = False
				u.save()
				return HttpResponse("Ok")
			else:
				return HttpResponse("An Error Has Occured, Please Try Again Later", status=400)
		else:
			return HttpResponse("Authentication Error", status=400)
	else:
		raise Http404
