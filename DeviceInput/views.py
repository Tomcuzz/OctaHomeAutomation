# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from models import *
from Lights.commands import *
from Account.sideBar import *

import SocketServer
from wsgiref import handlers

def DeviceInputMain(request):
	SocketServer.BaseServer.handle_error = lambda *args, **kwargs: None
	handlers.BaseHandler.log_exception = lambda *args, **kwargs: None
	
	if request.GET.get('command', 'None') == 'toggleLightState':
		return command(request)
	elif request.GET.get('DeviceType','None') == 'buttonInput':
		return HttpResponse("Ok")
	elif not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	else:
		title = "Under Construction"
        links = getSideBar("DeviceInput", request)
        buttonDevices = ButtonInputDevice.objects.all()
        motionDevices = MotionInputDevice.objects.all()
        
        return render(request, 'pages/DeviceInput/Settings.html', {'PageAreaTitle':title, 'ButtonDevices': buttonDevices, 'MotionDevices':motionDevices, 'links': links})
		
	test = "Not Implemented"
	return HttpResponse("Ok")
