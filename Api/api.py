from Lights.models import *
from django.http import HttpResponse, HttpResponseNotFound
from SharedFunctions.deviceControl import *

class LightApi():
	def webRequest(self, request):
		command = request.GET.get('command', '')
		if command == "getStatus":
			pageContent = "["
			isNotInFirstLoop = False
			for alight in Lights.objects.all():
				if isNotInFirstLoop:
					pageContent += ", "
				else:
					isNotInFirstLoop = True
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
			return HttpResponse(pageContent)
		elif command == "SetRGB":
				lightId = request.GET.get('light', '0')
				theLight = Lights.objects.get(id=lightId)
				newR = request.GET.get('r','')
				newG = request.GET.get('g','')
				newB = request.GET.get('b','')
				if ((0 <= int(newR) < 256) and (0 <= int(newG) < 256) and (0 <= int(newB) < 256)):
					if (theLight.LightState == "Off"):
						oldR = 0
						oldG = 0
						oldB = 0
					else:
						oldR = theLight.R
						oldG = theLight.G
						oldB = theLight.B
					DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B, newR, theLight.G, theLight.B, setType="tread")
					if ((int(newR) == 0) and (int(newG) == 0) and (int(newB) == 0)):
						theLight.LightState = "Off"
					else:
						theLight.LightState = "On"
						theLight.R = newR
						theLight.G = newG
						theLight.B = newB
					theLight.save()
					return HttpResponse("Ok")
				else:
					return HttpResponse("Please Enter A Number Between 0 And 255", status=400)
