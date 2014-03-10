from django.shortcuts import render
from SharedFunctions.models import *
from Lights.models import *

def HandlePhoneRequest(request):
	area = request.GET.get('area', 'None')
	if area == 'None':
		return PhoneHomePage(request)
	elif area == 'lights':
		if request.GET.get('room', 'None') != 'None':
			if request.GET.get('light', 'None') != 'None':
				if request.GET.get('command', 'None') != 'None':
					return PhoneLightSetRGBPage(request)
				else:
					return PhoneLightPage(request)
			else:
				return PhoneLightsPage(request)
		else:
			return PhoneLightsRoomPage(request)
	else:
		return PhoneHomePage(request)

def PhoneHomePage(request):
	items = [{'title':'Lights', 'address':'?page=ciscophone&area=lights'}, 
		{'title':'Alarm', 'address':'?page=ciscophone&area=alarm'}, 
		{'title':'Temperature', 'address':'?page=ciscophone&area=temp'}]
	return render(request, 'pages/Api/PhoneMenu.html', {'Items':items, 'Prompt':'Please Select A Service'}, content_type="text/xml")

def PhoneLightsRoomPage(request):
	items = [{'title':'All Rooms', 'address':'?page=ciscophone&area=lights&room=allrooms'}]
	for room in Rooms.objects.all():
		items.append({'title':room.Name.replace("_", " "), 'address':'?page=ciscophone&area=lights&room=' + str(room.id)})
	return render(request, 'pages/Api/PhoneMenu.html', {'Items':items, 'Prompt':'Please Select A Service'}, content_type="text/xml")

def PhoneLightsPage(request):
	items = []
	room = request.GET.get('room', 'None')
	if room == 'allrooms':
		lights = Lights.objects.all()
	else:
		theRoom = Rooms.objects.get(id=int(room))
		lights = Lights.objects.filter(Room=theRoom)
	for light in lights:
		items.append({'title':light.LightName.replace("_", " "), 'address':'?page=ciscophone&area=lights&room=' + str(room) + '&light=' + str(light.id)})
	return render(request, 'pages/Api/PhoneMenu.html', {'Items':items, 'Prompt':'Please Select A Light', 'softkey1':'test'}, content_type="text/xml")

def PhoneLightPage(request):
	light = request.GET.get('light', 'None')
	items = [{'title':'Toggle Light', 'address':'?page=ciscophone&area=lights&room=allrooms&light=' + light + '&command=toggle'},
		{'title':'Set RGB Values', 'address':'?page=ciscophone&area=lights&room=allrooms&light=' + light + '&command=setrgb'},
		{'title':'Select Scene', 'address':'?page=ciscophone&area=lights&room=allrooms&light=' + light + '&command=selectscene'}]
	return render(request, 'pages/Api/PhoneMenu.html', {'Items':items, 'Prompt':'Please Select A Service'}, content_type="text/xml")

def PhoneLightSetRGBPage(request):
	items = [{'DisplayName':'Set Red Value', 'QueryStringParam':'r', 'DefaultValue':'255', 'InputFlag':'N'},
		{'DisplayName':'Set Green Value', 'QueryStringParam':'g', 'DefaultValue':'255', 'InputFlag':'N'},
		{'DisplayName':'Set Blue Value', 'QueryStringParam':'b', 'DefaultValue':'255', 'InputFlag':'N'}]
	return render(request, 'pages/Api/PhoneValueSet.html', {'Items':items, 'Prompt':'Please Select A Service', 'Url':'setrgb.xml'}, content_type="text/xml")