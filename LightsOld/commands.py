# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect
from Lights.tasks import *
from SharedFunctions.deviceControl import *
from models import *
from Lights.api import *
import json

def command(request):
	#temp-needs to be moved to arduino section
	lightId = request.GET.get('lightId', '0')
	if request.GET.get('command', 'None') == 'toggleLightState':
		theLight = Lights.objects.get(id=lightId)
		if theLight.LightState == "Off":
			if theLight.LightType == "RGBLight":
				DeviceControl().setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B)
			else:
				DeviceControl().setOnOffDeviceState(theLight.IpAddress, theLight.DeviceType, True)
			theLight.LightState = "On"
			theLight.Scroll = "Off"
		else:
			if theLight.LightType == "RGBLight":
				DeviceControl().setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, 0, 0, 0)
			else:
				DeviceControl().setOnOffDeviceState(theLight.IpAddress, theLight.DeviceType, False)
			theLight.LightState = "Off"
			theLight.Scroll = "Off"
		theLight.save()
		return HttpResponse("Ok")
	elif request.GET.get('command', 'None') == 'turnOn':
		theLight = Lights.objects.get(id=lightId)
		if theLight.LightType == "RGBLight":
			DeviceControl().setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B)
		else:
			DeviceControl().setOnOffDeviceState(theLight.IpAddress, theLight.DeviceType, True)
		theLight.LightState = "On"
		theLight.Scroll = "Off"
		theLight.save()
		return HttpResponse("Ok")
	elif request.GET.get('command', 'None') == 'turnOff':
		theLight = Lights.objects.get(id=lightId)
		if theLight.LightType == "RGBLight":
			DeviceControl().setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, 0, 0, 0)
		else:
			DeviceControl().setOnOffDeviceState(theLight.IpAddress, theLight.DeviceType, False)
		theLight.LightState = "Off"
		theLight.Scroll = "Off"
		theLight.save()
		return HttpResponse("Ok")
	elif request.GET.get('command', 'None') == 'setColour':
		return HttpResponse("Ok")
	elif request.GET.get('command', 'None') == 'setScroll':
		newScrollMode = request.GET.get('ScrollMode', 'Off')
		currentlyRunningCount = Lights.objects.filter(Scroll=newScrollMode).count()
		theLight = Lights.objects.get(id=lightId)
		theLight.Scroll = str(newScrollMode)
		theLight.save()
		if str(currentlyRunningCount) == "0":
			if str(newScrollMode) != "Off":
				runScrollMode.apply_async(args=[str(newScrollMode)])   #.delay(newScrollMode)
		return HttpResponse("Ok")
	elif request.GET.get('command', 'None') == 'getR':
		theLight = Lights.objects.get(id=lightId)
		return HttpResponse(theLight.R)
	elif request.GET.get('command', 'None') == 'getG':
		theLight = Lights.objects.get(id=lightId)
		return HttpResponse(theLight.G)
	elif request.GET.get('command', 'None') == 'getB':
		theLight = Lights.objects.get(id=lightId)
		return HttpResponse(theLight.B)
	elif request.GET.get('command', 'None') == 'setR':
		theLight = Lights.objects.get(id=lightId)
		newR = request.GET.get('value','')
		if (0 <= int(newR) < 256):
			DeviceControl().setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, newR, theLight.G, theLight.B)
			theLight.R = newR
			theLight.Scroll = "Off"
			theLight.save()
			return HttpResponse()
		else:
			return HttpResponse("Please Enter A Number Between 0 And 255", status=400)
	elif request.GET.get('command', 'None') == 'setG':
		theLight = Lights.objects.get(id=lightId)
		newG = request.GET.get('value','')
		if (0 <= int(newG) < 256):
			DeviceControl().setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, newG, theLight.B)
			theLight.G = newG
			theLight.Scroll = "Off"
			theLight.save()
			return HttpResponse()
		else:
			return HttpResponse("Please Enter A Number Between 0 And 255", status=400)
	elif request.GET.get('command', 'None') == 'setB':
		theLight = Lights.objects.get(id=lightId)
		newB = request.GET.get('value','')
		if (0 <= int(newB) < 256):
			DeviceControl().setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, newB)
			theLight.B = newB
			theLight.Scroll = "Off"
			theLight.save()
			return HttpResponse()
		else:
			return HttpResponse("Please Enter A Number Between 0 And 255", status=400)
	elif request.GET.get('command', 'None') == 'setRGB':
		theLight = Lights.objects.get(id=lightId)
		newR = request.GET.get('value','')
		newG = request.GET.get('value','')
		newB = request.GET.get('value','')
		if ((0 <= int(newR) < 256) and (0 <= int(newG) < 256) and (0 <= int(newB) < 256)):
			DeviceControl().setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, newR, newG, newB)
			theLight.R = newR
			theLight.G = newG
			theLight.B = newB
			theLight.Scroll = "Off"
			theLight.save()
			return HttpResponse()
		else:
			return HttpResponse("Please Enter A Number Between 0 And 255", status=400)
	else:
		return LightApi().webRequest(request)
