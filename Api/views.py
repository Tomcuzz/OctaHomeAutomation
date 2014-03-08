from django.http import HttpResponse
from ciscophone import *
from api import *

def ApiMain(request):
	if request.GET.get('page', 'None') == 'api':
		return LightApi().webRequest(request)
	elif request.GET.get('page', 'None') == 'ciscophone':
		return HandlePhoneRequest(request)
	elif request.get_full_path().split("/")[2].split(".")[0] == 'ciscophone':
		return HandlePhoneRequest(request)
	return HttpResponse("404")

