# Create your views here.

from api import *

def ApiMain(request):
	if request.GET.get('page', 'None') == 'api':
		return LightApi().webRequest(request)
