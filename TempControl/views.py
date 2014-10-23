



from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from django.shortcuts import redirect

from Core.views import *
from models import *

class handleTempView(viewRequestHandler):
	def getTemplate(self):
		if self.Kwarguments.has_key('page'):
			if self.Kwarguments['page'] == 'CentralHeating':
				return 'pages/TempControl/CentralHeating'
			elif self.Kwarguments['page'] == 'Fan':
				return 'pages/TempControl/Fan'
			else:
				raise Http404
		else:
			return 'pages/TempControl/CentralHeating'
	
	def getViewParameters(self):
		parameters = {}
		
		if self.Kwarguments.has_key('page'):
			if self.Kwarguments['page'] == 'Fan':
				theFan = TempControl.objects.get(id=1)
				parameters = {'theFan':theFan}
		
		return parameters
	
	def getSidebarUrlName(self):
		return 'Home'

class handleTempCommand(commandRequestHandler):
	def runCommand(self):
		return self.handleUserError('Command Not Recognised')










# Create your views here.
#from django.http import HttpResponse, HttpResponseNotFound, Http404
#from django.shortcuts import render
#from django.shortcuts import redirect
#from models import *
#
#def TempControlMain(request):
#	if not request.user.is_authenticated():
#		return redirect('/Login?next=%s' % request.path)
#	else:
#		page = request.GET.get('page', 'CentralHeating')
#		if (page == "CentralHeating"):
#			return render(request, 'pages/TempControl/CentralHeating.html', {'links': getSideBar(request)})
#		elif (page == "Fan"):
#			theFan = TempControl.objects.get(id=1)
#			return render(request, 'pages/TempControl/Fan.html', {'links': getSideBar(request), 'theFan':theFan})
#		else:
#			raise Http404
#
#
#
#def getSideBarActiveState(sidebarItem, currentPage):
#	if sidebarItem == currentPage:
#		return 'active'
#	else:
#		return ''
#
#def getSideBar(request):
#	currentPage = request.GET.get('page', 'CentralHeating')
#
#	links = [{'title': 'Central Heating', 'address': '/TempControl/', 'active': getSideBarActiveState('CentralHeating', currentPage)}]
#
#	FanHeaderSidebarItem = {'title': 'Fans' , 'address': '' , 'active':''}
#	links.append(FanHeaderSidebarItem)
#	
#	for aFan in TempControl.objects.filter(Type='Fan'):
#		fanSidebarItem = {'title': "	" + aFan.Name.replace("_", " "), 'address': '/TempControl/?page=Fan&fan=' + str(aFan.id) , 'active':getSideBarActiveState(str(aFan.id), request.GET.get('fan', ''))}
#		links.append(fanSidebarItem)
#	
#	return links