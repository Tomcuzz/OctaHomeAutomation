# Create your views here.
from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render

def Error404(request):
	return render(request, 'errorPages/404.html')
