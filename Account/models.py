from django.db import models
from django.contrib.auth.models import User
from customuser.models import *

# Create your models here.

class AccountModel():
	def getUserName(self, request):
		return request.user.username
	def getName(self, request):
		return request.user.first_name
	def getSurName(self, request):
		return request.user.last_name
	def getEmail(self, request):
		return request.user.email
	def isAdmin(self, request):
		if request.user.is_superuser:
			return "Admin"
		else:
			return "User"
	
	def getAllUsers(self):
		return CustomUser.objects.filter()
