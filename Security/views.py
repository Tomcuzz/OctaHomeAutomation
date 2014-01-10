# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect
from models import *

def SecurityMain(request):
	if not request.user.is_authenticated():
		return redirect('/Login?next=%s' % request.path)
	else:
		theLight = Lights.objects.get(id=1)
		title = "Under Construction"
		stuff = "This Page Is Currently Under Construction\n" + str(theLight.R)# + con.cat
 		return render(request, 'pages/Security.html', {'PageAreaTitle':title, 'PageAreaContent': stuff})
