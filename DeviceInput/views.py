# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from models import *
from Lights.commands import *
from Account.sideBar import *
from Alarm.tasks import *

import SocketServer
from wsgiref import handlers

def DeviceInputMain(request):
	SocketServer.BaseServer.handle_error = lambda *args, **kwargs: None
	handlers.BaseHandler.log_exception = lambda *args, **kwargs: None
	
	if request.GET.get('command', 'None') == 'toggleLightState':
		return command(request)
	elif request.GET.get('DeviceType','None') == 'buttonInput':
		deviceId = request.GET.get('buttonId','None')
		if deviceId != "None":
			clicks = request.GET.get('clickCount','1')
			if clicks == "1":
				singleButtonAction(deviceId)
			elif clicks == "2":
				doubleButtonAction(deviceId)
		return HttpResponse("Ok")
	elif request.GET.get('DeviceType','None') == 'motionInput':
		deviceId = request.GET.get('buttonId','None')
		if deviceId != "None":
			motionActivated(deviceId)
		return HttpResponse("Ok")
	elif not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	else:
		links = getSideBar("DeviceInput", request)
		buttonDevices = ButtonInputDevice.objects.all()
		motionDevices = MotionInputDevice.objects.all()
        
        return render(request, 'pages/DeviceInput/Settings.html', {'ButtonDevices': buttonDevices, 'MotionDevices':motionDevices, 'links': links})
		
	test = "Not Implemented"
	return HttpResponse("Ok")

def singleButtonAction(buttonId):
	buttonInput = ButtonInputDevice.objects.get(id=int(buttonId))
	performActions(buttonInput.ButtonOneAction.actions, runType="tread")

def doubleButtonAction(buttonId):
	buttonInput = ButtonInputDevice.objects.get(id=int(buttonId))
	performActions(buttonInput.ButtonTwoAction.actions, runType="tread")

def motionActivated(deviceId):
	motionDevice = MotionInputDevice.objects.get(id=int(deviceId))
	if not motionDevice.Activated:
		motionDevice.Activated = True
		motionDevice.save()
		performActions(motionDevice.TriggerAction, runType="tread")
		motionTimeOut.apply_async(args=[str(deviceId)], kwargs={}, countdown=motionDevice.WaitTime)

@task
def motionTimeOut(deviceId):
	motionDevice = MotionInputDevice.objects.get(id=int(deviceId))
	motionDevice.Activated = False
	motionDevice.save()