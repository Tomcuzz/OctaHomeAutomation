from django.shortcuts import render
from SharedFunctions.models import *
from Lights.models import *

def HandlePhoneRequest(request):
	print request
	area = request.GET.get('area', 'None')
	if area == 'None':
		return PhoneHomePage(request)
	elif area == 'lights':
		if request.GET.get('room', 'None') == 'None':
			return PhoneLightsRoomPage(request)
		else:
			return PhoneLightsPage(request)
	else:
		return PhoneHomePage(request)

def PhoneHomePage(request):
	items = [{'title':'Lights', 'address':'?page=ciscophone&area=lights'}, 
		{'title':'Alarm', 'address':'?page=ciscophone&area=alarm'}, 
		{'title':'Temperature', 'address':'?page=ciscophone&area=temp'}]
	return render(request, 'pages/Api/PhoneMenu.html', {'Items':items, 'Prompt':'Please Select A Service'}, content_type="text/xml")
	response = HttpResponse(toReturn, content_type="text/xml")
	return response

def PhoneLightsRoomPage(request):
	items = [{'title':'All Rooms', 'address':'?page=ciscophone&area=lights&room=allrooms'}]
	for room in Rooms.objects.all():
		items.append({'title':room.Name.replace("_", " "), 'address':'?page=ciscophone&area=lights&room=' + str(room.id)})
	return render(request, 'pages/Api/PhoneMenu.html', {'Items':items, 'Prompt':'Please Select A Service'}, content_type="text/xml")
	response = HttpResponse(toReturn, content_type="text/xml")
	return response

def PhoneLightsPage(request):
	items = []
	room = request.GET.get('room', 'None')
	if room == 'allrooms':
		lights = Lights.objects.all()
	else:
		theRoom = Rooms.objects.get(id=int(room))
		lights = Lights.objects.filter(Room=theRoom)
	for light in lights:
		items.append({'title':light.LightName.replace("_", " "), 'address':'?page=ciscophone&area=lights&room=' + str(room) + '&light=' + str(light.LightName)})
	return render(request, 'pages/Api/PhoneMenu.html', {'Items':items, 'Prompt':'Please Select A Light', 'softkey1':'test'}, content_type="text/xml")
	response = HttpResponse(toReturn, content_type="text/xml")
	return response