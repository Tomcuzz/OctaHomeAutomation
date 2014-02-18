# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.middleware.csrf import get_token
from django.shortcuts import render
from django.shortcuts import redirect
from Lights.tasks import *
from SharedFunctions.deviceControl import *
from SharedFunctions.models import *
from Lights.commands import *
from models import *
from Lights.api import *

def LightsMain(request):
	#temp-needs to be moved to arduino section
	if request.GET.get('command', 'None') == 'toggleLightState':
		return command(request)
	if not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	else:
		if request.GET.get('command', 'None') == 'None':
			lights = getLightsForRoom(request.GET.get('room', 'all'))
			links = getSideBar(request.GET.get('room', 'all'), getLightsForRoom('all'))
			room = request.GET.get('room', 'All')
			if request.GET.get('page', 'None') == 'None':
				return render(request, 'pages/Lights/Main.html', {'lights':lights, 'room':room, 'scrollModes':ScrollModes.objects.all(), 'links': links})
			elif request.GET.get('page', 'None') == 'addLightPage':
				return render(request, 'pages/Lights/AddLight.html', {'csrfmiddlewaretoken':get_token(request), 'room':room, 'links': links})
			else:
				raise Http404
		else:
			return command(request)

def getSideBar(currentPage, lights):
	links = [{'title': 'All Rooms', 'address': '/Lights', 'active': getSideBarActiveState('all', currentPage)}]
	rooms = []
	
	dbRooms = Rooms.objects.all()
	for aRoom in dbRooms:
		rooms.append(aRoom.Name)
	
	for room in rooms:
		address = '/Lights?room=' + room
		sidebarItem = {'title': room.replace("_", " ") , 'address': address , 'active':getSideBarActiveState(room, currentPage)}
		links.append(sidebarItem)
	
	return links

def getSideBarActiveState(sidebarItem, currentPage):
	if sidebarItem == currentPage:
		return 'active'
	else:
		return ''

def getLightsForRoom(room):
	if room == 'all':
		return Lights.objects.all()
	else:
		dbRooms = Rooms.objects.get(Name=room)
		return Lights.objects.filter(Room=dbRooms)
