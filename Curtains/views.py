# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect
from OctaHomeCore.menumodels import *

#Nav Bar Item
class CoreSystemsTopNavBarItem(TopNavBarItem):
	Priority = 30
	DisplayName = "Core Systems"
	Link = "#"

class CurtainsTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 40
	DisplayName = "Curtains"
	
	@property
	def Link(self):
		return reverse('Curtains')

#View Object
def CurtainsMain(request):
	if not request.user.is_authenticated():
                return redirect('/Login?next=%s' % request.path)
        else:
		title = "Under Construction"
		stuff = "This Page Is Currently Under Construction"
		return render(request, 'OctaHomeCurtains/Main.html', {'PageAreaTitle':title, 'PageAreaContent': stuff})
