from django.http import HttpResponse

from api import *

def ApiMain(request):
	if request.GET.get('page', 'None') == 'api':
		return LightApi().webRequest(request)
	elif request.GET.get('page', 'None') == 'phone':
		return HandlePhoneRequest(request)

def HandlePhoneRequest(request):
	toReturn = "<?xml version=\"1.0\"?><CiscoIPPhoneMenu><Title>Cisco Phones Are Great, Right?</Title><Prompt>What do you want to do today?</Prompt><MenuItem><Name>Yahoo</Name><URL>http://www.yahoo.com/index.html</URL></MenuItem><DefaultValue></DefaultValue></CiscoIPPhoneMenu>"
	response = HttpResponse(toReturn, content_type="text/xml")
	return response