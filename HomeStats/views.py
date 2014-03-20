# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect

from Lights.models import *
from DeviceInput.models import *

def HomeStatsMain(request):
	if not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	
	stats = {'lightsOn':str(Lights.objects.filter(LightState='On').count()),
		'motionDevicesArmed':str(MotionInputDevice.objects.filter(Armed=True).count()),
		'motionDevicesActivated':str(MotionInputDevice.objects.filter(Activated=True).count())
		}
	
	lights = Lights.objects.all()
	motionDevices = MotionInputDevice.objects.all()
	
	return render(request, 'pages/HomeStats.html', {'Lights':lights, 'Stats':stats})
