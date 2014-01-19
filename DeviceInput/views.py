# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from Lights.commands import *

import SocketServer
from wsgiref import handlers

def DeviceInputMain(request):
	SocketServer.BaseServer.handle_error = lambda *args, **kwargs: None
	handlers.BaseHandler.log_exception = lambda *args, **kwargs: None
	
	if request.GET.get('command', 'None') == 'toggleLightState':
		return command(request)
		
	test = "Not Implemented"
	return HttpResponse("Ok")
