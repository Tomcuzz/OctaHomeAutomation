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
	elif request.GET.get('DeviceType','Button') == '':
		return HttpResponse("Ok")
	elif not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	else:
		title = "Under Construction"
        stuff = "This Page Is Currently Under Construction"
        return render(request, 'pages/DeviceInput/Settings.html', {'PageAreaTitle':title, 'PageAreaContent': stuff})
		
	test = "Not Implemented"
	return HttpResponse("Ok")
