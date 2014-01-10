# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect

def MealsMain(request):
	if not request.user.is_authenticated():
                return redirect('/Login?next=%s' % request.path)
        else:
        	title = "Under Construction"
        	stuff = "This Page Is Currently Under Construction"
        	return render(request, 'pages/Meals.html', {'PageAreaTitle':title, 'PageAreaContent': stuff})
