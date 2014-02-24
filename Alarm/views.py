# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.shortcuts import redirect
from django.contrib.auth.models import User
from django.db.models import Q
from Alarm.tasks import *
from Alarm.commands import *
from models import *
from Lights.models import *
import datetime

def AlarmMain(request):
	if not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	elif request.GET.get('page', 'Alarm') == "addActionTaskComplete":
		alarm().addTaskAction(request)
		return redirect('/Alarm/?page=AddTask')
	elif request.GET.get('page', 'Alarm') == "AddTaskComplete":
		alarm().addTask(request)
		return redirect('/Alarm/?page=AddAlarm')
	elif request.GET.get('page', 'Alarm') == "AddAlarmComplete":
		alarm().setAlarm(request)
		return redirect('/Alarm/')
	elif request.GET.get('page', 'Alarm') == "DisableAlarm":
		alarm().diabaleAlarm(request)
		return HttpResponse("Ok")
	elif request.GET.get('page', 'Alarm') == "EnableAlarm":
		alarm().enableAlarm(request)
		return HttpResponse("Ok")
	elif request.GET.get('page', 'Alarm') == "DeleteAlarm":
		alarm().deleteAlarm(request)
		return HttpResponse("Ok")
	elif request.GET.get('page', 'Alarm') == "Alarm":
		if request.GET.get('currentPage', 'User') == "All":
			return render(request, 'pages/Alarm/Alarms.html', {'links': getSideBar(request), 'alarms':Alarms.objects.all()})
		elif request.GET.get('currentPage', 'User') == "System":
			UsersAlarms = Alarms.objects.filter(user="System")
			return render(request, 'pages/Alarm/Alarms.html', {'links': getSideBar(request), 'alarms':UsersAlarms})
		elif request.GET.get('currentPage', 'User') == "User":
			UsersAlarms = Alarms.objects.filter(user=request.user.username)
			return render(request, 'pages/Alarm/Alarms.html', {'links': getSideBar(request), 'alarms':UsersAlarms})
		elif request.GET.get('currentPage', 'User') == "AllUser":
			UsersAlarms = Alarms.objects.filter(user="System")
			return render(request, 'pages/Alarm/Alarms.html', {'links': getSideBar(request), 'alarms':UsersAlarms})
		else:
			return render(request, 'pages/Alarm/Alarms.html', {'links': getSideBar(request), 'alarms':Alarms.objects.all()})
	elif request.GET.get('page', 'Alarm') == "AddAlarm":
		return render(request, 'pages/Alarm/AddAlarm.html', {'links': getSideBar(request), 'csrfmiddlewaretoken':get_token(request), 'todayDate':datetime.date.today().strftime("%d-%m-%Y"), 'tasks':Tasks.objects.all()})
	elif request.GET.get('page', 'Alarm') == "AddTaskAction":
		lights = Lights.objects.all()
		lightScrolls = ScrollModes.objects.all()
		lightScenes = LightScenes.objects.all()
		return render(request, 'pages/Alarm/AddTaskAction.html', {'links': getSideBar(request), 'csrfmiddlewaretoken':get_token(request), 'lights':lights, 'lightScrolls':lightScrolls, 'lightScenes':lightScenes})
	elif request.GET.get('page', 'Alarm') == "AddTask":
		return render(request, 'pages/Alarm/AddTask.html', {'links': getSideBar(request), 'csrfmiddlewaretoken':get_token(request), 'tasksAction':TaskAction.objects.all()})
	else:
		raise Http404

def getSideBar(request):
	currentPage = request.GET.get('currentPage', 'User')
	
	links = []
	
	userSidebarItem = {'title': 'My Alarms' , 'address': '/Alarm?currentPage=User' , 'active':getSideBarActiveState('User', currentPage)}
	links.append(userSidebarItem)
	
	allSidebarItem = {'title': 'All Alarms', 'address': '/Alarm?currentPage=All', 'active': getSideBarActiveState('All', currentPage)}
	links.append(allSidebarItem)
	
	systemSidebarItem = {'title': 'System Alarms' , 'address': '/Alarm?currentPage=System' , 'active':getSideBarActiveState('System', currentPage)}
	links.append(systemSidebarItem)
	
	allUserSidebarItem = {'title': 'All User Alarms' , 'address': '/Alarm?currentPage=AllUser' , 'active':getSideBarActiveState('AllUser', currentPage)}
	links.append(allUserSidebarItem)
	
	return links

def getSideBarActiveState(sidebarItem, currentPage):
	if sidebarItem == currentPage:
		return 'active'
	else:
		return ''
