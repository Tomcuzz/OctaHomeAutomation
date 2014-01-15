# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect

def HomeMain(request):
	if not request.user.is_authenticated():
                return redirect('/Login?next=%s' % request.path)
        else:
		title = "Yay"
		stuff = "Hello This May Help"
		return render(request, 'pages/Home.html', {'PageAreaTitle':title, 'PageAreaContent': stuff, 'background':"fog"})
