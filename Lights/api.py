from models import *
from django.shortcuts import redirect

class LightApi():
	def webRequest(self, request):
		command = request.GET.get('command', '')
		if command == "getStatus":
			pageContent = "["
			for alight in Lights.objects.all():
				pageContent += "{"
				pageContent += "\"id\":"
				pageContent += "\"" + str(alight.id) + "\", "
				pageContent += "\"Light\":"
				pageContent += "\"" + alight.LightName.replace("_", " ") + "\", "
				pageContent += "\"Room\":"
				pageContent += "\"" + alight.Room.Name.replace("_", " ") + "\", "
				pageContent += "\"Type\":"
				pageContent += "\"" + alight.LightType + "\", "
				pageContent += "\"State\":"
				pageContent += "\"" + alight.LightState + "\", "
				pageContent += "\"r\":"
				pageContent += "\"" + str(alight.R) + "\", "
				pageContent += "\"g\":"
				pageContent += "\"" + str(alight.G) + "\", "
				pageContent += "\"b\":"
				pageContent += "\"" + str(alight.B) + "\""
				pageContent += "}"
			pageContent += "]"
			return pageContent
		elif command == "addLightComplete":
			lightName = request.POST.get('lightname', '').replace(" ", "_")
			roomName = request.POST.get('roomname', '').replace(" ", "_")
			ipAddress = request.POST.get('ipaddress', '')
			deviceType = request.POST.get('devicetype', '')
			lightType = request.POST.get('lightype', '')
			dbRooms = Rooms.objects.get(Name=room)
			newLight = Lights(LightName=lightName, Room=dbRooms, IpAddress=ipAddress, DeviceType=deviceType, LightType=lightType, LightState="Off", R=0, G=0, B=0, Scroll="Off", BeingSetId="0")
			newLight.save()
			return redirect('/Lights') 
