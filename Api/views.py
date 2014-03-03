from django.http import HttpResponse

from api import *

def ApiMain(request):
	if request.GET.get('page', 'None') == 'api':
		return LightApi().webRequest(request)
	elif request.GET.get('page', 'None') == 'phone':
		return HandlePhoneRequest(request)

def HandlePhoneRequest(request):
	toReturn = "<CiscoIPPhoneMenu>\n\
	<Title>Title text goes here</Title>\n\
	<Prompt>Prompt text goes here</Prompt>\n\
	<MenuItem>\n\
		<Name>The name of each menu item</Name>\n\
		<URL>The URL associated with the menu item</URL>\n\
	</MenuItem>\n\
</CiscoIPPhoneMenu>"
	response = HttpResponse(toReturn, content_type="text/xml")
	return response