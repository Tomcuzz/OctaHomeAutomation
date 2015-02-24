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

class AudioVisualTopNavBarItem(TopNavBarItem):
	ParentItem = "Core Systems"
	Priority = 60
	DisplayName = "Audio/Visual"
	
	@property
	def Link(self):
		return reverse('AudioVisual')

#View Object
def AudioVisualMain(request):
	if not request.user.is_authenticated():
                return redirect('/Login?next=%s' % request.path)
        else:
	        title = "Under Construction"
	        stuff = "This Page Is Currently Under Construction"
	        return render(request, 'OctaHomeAudioVisual/Main.html', {'PageAreaTitle':title, 'PageAreaContent': stuff})
