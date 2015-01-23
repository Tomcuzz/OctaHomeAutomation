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
from DeviceInput.models import *
import datetime

class handleAlarmView(viewRequestHandler):
	def getTemplate(self):
		if self.Page == "None":
			return 'OctaHomeCore/pages/Alarm/Alarms.html'
		elif self.page == "AddAlarm":
			return 'OctaHomeCore/pages/Alarm/AddAlarm.html'
		elif self.page == "AddTaskAction":
			return 'OctaHomeCore/pages/Alarm/AddTaskAction.html'
		elif self.Page == "AddTask":
			return 'OctaHomeCore/pages/Alarm/AddTask.html'
		else:
			raise Http404
		
	def getViewParameters():
		parameters = {}
		if self.Page == "None":
			if self.Page == "All":
				parameters = {'alarms':Alarms.objects.all()}
			elif self.Page == "System":
				parameters = {'alarms':Alarms.objects.filter(user="System")}
			elif self.Page == "User":
				parameters = {'alarms':Alarms.objects.filter(user=request.user.username)}
			elif self.Page == "AllUser":
				parameters = {'alarms':Alarms.objects.filter(user="System")}
			else:
				parameters = {'alarms':Alarms.objects.all()}
			
		elif self.Page == "AddAlarm":
			parameters = {'todayDate':datetime.date.today().strftime("%d-%m-%Y"), 'tasks':Tasks.objects.all()}
			
		elif self.Page == "AddTaskAction":
			lights = Lights.objects.all()
			lightScrolls = ScrollModes.objects.all()
			lightScenes = LightScenes.objects.all()
			motionDevices = MotionInputDevice.objects.all()
			parameters = {'lights':lights, 'lightScrolls':lightScrolls, 'lightScenes':lightScenes, 'motionDevices': motionDevices}
		elif self.Page == "AddTask":
			parameters = {'tasksAction':TaskAction.objects.all()}
		else:
			raise Http404
	
	def getSideBar(self):
		currentPage = self.request.GET.get('currentPage', 'User')
		
		userSidebarItem = {'title': 'My Alarms' , 'address': '/Alarm?currentPage=User' , 'active':self.getSideBarActiveState('User', currentPage)}
		allSidebarItem = {'title': 'All Alarms', 'address': '/Alarm?currentPage=All', 'active':self.getSideBarActiveState('All', currentPage)}
		systemSidebarItem = {'title': 'System Alarms' , 'address': '/Alarm?currentPage=System' , 'active':self.getSideBarActiveState('System', currentPage)}
		allUserSidebarItem = {'title': 'All User Alarms' , 'address': '/Alarm?currentPage=AllUser' , 'active':self.getSideBarActiveState('AllUser', currentPage)}
		
		
		links = []
		links.append(userSidebarItem)
		links.append(allSidebarItem)
		links.append(systemSidebarItem)
		links.append(allUserSidebarItem)
		return links

class handleAlarmCommand(commandRequestHandler):
	def runCommand(self):
		if self.Command == "addActionTaskComplete":
			alarm().addTaskAction(request)
			return self.redirect('/Alarm/?page=AddTask')
		elif self.Command == "AddTaskComplete":
			alarm().addTask(request)
			return self.redirect('/Alarm/?page=AddAlarm')
		elif self.Command == "AddAlarmComplete":
			alarm().setAlarm(request)
			return self.redirect('/Alarm/')
		elif self.Command == "DisableAlarm":
			alarm().diabaleAlarm(request)
			return self.returnOk()
		elif self.Command == "EnableAlarm":
			alarm().enableAlarm(request)
			return self.returnOk()
		elif self.Command == "DeleteAlarm":
			alarm().deleteAlarm(request)
			return self.returnOk()
		else:
			return self.handleUserError('Command Not Recognised')
