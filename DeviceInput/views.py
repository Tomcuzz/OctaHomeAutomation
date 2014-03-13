# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from celery.task import task
from models import *
from Lights.commands import *
from Account.sideBar import *
from Alarm.tasks import *
from tasks import *
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
		deviceId = str(request.GET.get('deviceId','None'))
		if deviceId != "None":
			motionActivated(deviceId)
		return HttpResponse("Ok")
	elif not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	elif request.GET.get('command', 'None') == 'buttonActionChanged':
		deviceId = request.GET.get('deviceId', 'None')
		inputType = request.GET.get('inputType', '1')
		selectedActionId = request.GET.get('selectedActionId', 'None')
		
		if deviceId != 'None' and selectedActionId != 'None':
			try:
				selectedDevice = ButtonInputDevice.objects.get(id=int(deviceId))
				newTask = Tasks.objects.get(id=int(selectedActionId))
				
				if inputType == "1":
					selectedDevice.ButtonOneAction = newTask
				else:
					selectedDevice.ButtonTwoAction = newTask
				
				selectedDevice.save()
				return HttpResponse("Ok")
			except:
				return HttpResponse("DB Get Error", status=400)
		else:
			return HttpResponse("Input veriable Error", status=400)
	elif request.GET.get('command', 'None') == 'motionActionChanged':
		deviceId = request.GET.get('deviceId', 'None')
		inputType = request.GET.get('inputType', 'trigger')
		selectedActionId = request.GET.get('selectedActionId', 'None')
		
		if deviceId != 'None' and selectedActionId != 'None':
			try:
				selectedDevice = MotionInputDevice.objects.get(id=int(deviceId))
				newTask = Tasks.objects.get(id=int(selectedActionId))
				
				if inputType == "trigger":
					selectedDevice.TriggerAction = newTask
				else:
					selectedDevice.TimeOutAction = newTask
				
				selectedDevice.save()
				return HttpResponse("Ok")
			except:
				return HttpResponse("DB Get Error", status=400)
		else:
			return HttpResponse("Input veriable Error", status=400)
	else:
		links = getSideBar("DeviceInput", request)
		buttonDevices = ButtonInputDevice.objects.all()
		motionDevices = MotionInputDevice.objects.all()
        tasks = Tasks.objects.all()
        
        return render(request, 'pages/DeviceInput/Settings.html', {'ButtonDevices': buttonDevices, 'MotionDevices':motionDevices, 'Tasks':tasks, 'links': links})
		
	test = "Not Implemented"
	return HttpResponse("Ok")

def singleButtonAction(buttonId):
	buttonInput = ButtonInputDevice.objects.get(id=int(buttonId))
	performActions(buttonInput.ButtonOneAction.actions)

def doubleButtonAction(buttonId):
	buttonInput = ButtonInputDevice.objects.get(id=int(buttonId))
	performActions(buttonInput.ButtonTwoAction.actions)

def motionActivated(deviceId):
	motionDevice = MotionInputDevice.objects.get(id=int(deviceId))
	if not motionDevice.Activated and motionDevice.Armed:
		motionDevice.Activated = True
		motionDevice.save()
		performActions(motionDevice.TriggerAction.actions)
		delayedAction = motionTimeOut.apply_async(args=[str(deviceId)], kwargs={}, countdown=motionDevice.WaitTime)
		motionDevice.TimeOutTaskCeleryId = str(delayedAction.id)
		motionDevice.save()