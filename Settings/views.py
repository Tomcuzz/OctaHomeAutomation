from django.conf import settings

from Core.baseviews import *
from Core.models import *
from Weather.models import *

class handleSettingsView(viewRequestHandler):
	def getViewParameters(self):
		parameters = {}
		
		if self.Page == 'Actions':
			parameters = {'actions':Action.objects.all()}
		elif self.Page == 'Events':
			parameters = {'events':Event.objects.all()}
		elif self.Page == 'EditUsers':
			parameters = {'users':CustomUser.objects.all()}
		elif self.Page == 'AddUser':
			parameters = {'locations': WeatherLocations.objects.order_by('name').all()}
		#else:
			#return 'pages/Settings/EditUser'
		
		return parameters
		
	def getTemplate(self):
		if self.Page == 'None':
			return 'pages/Settings/EditUser'
		elif self.Page == 'Actions':
			return 'pages/Settings/Actions'
		elif self.Page == 'Events':
			return 'pages/Settings/Events'
		elif self.Page == 'EditUsers':
			return 'pages/Settings/EditUsers'
		elif self.Page == 'AddUser':
			return 'pages/Settings/AddUser'
		else:
			return 'pages/Settings/EditUser'
	
	def getSideBar(self):
		links = [
			{'title': 'Account', 'address': reverse('Settings'), 								'active': self.getSideBarActiveState('None',	self.Page)},
			{'title': 'Events',  'address': reverse('SettingsPage', kwargs={'page':'Events'}),  'active': self.getSideBarActiveState('Events',	self.Page)},
			{'title': 'Actions', 'address': reverse('SettingsPage', kwargs={'page':'Actions'}), 'active': self.getSideBarActiveState('Actions', self.Page)}
		]
		
		if self.Request.user.is_superuser:
			links.extend([
				{'title': 'Edit Users', 'address': reverse('SettingsPage', kwargs={'page':'EditUsers'}), 'active': self.getSideBarActiveState('EditUsers', self.Page)},
				{'title': 'Add User',   'address': reverse('SettingsPage', kwargs={'page':'AddUser'}),   'active': self.getSideBarActiveState('AddUser', 	self.Page)}
			])
		
		links.extend([
			{'title': 'Log Out', 'address': reverse('LogOut'), 'active': self.getSideBarActiveState('LogOut', self.Page)}
		])
		
		return links

class handleSettingsCommand(commandRequestHandler):
	def runCommand(self):
		if self.Command == 'addUserComplete':
			if not request.user.is_superuser:
				return self.handleUserError('Privilege Authentication Failure')
			
			if all (k in self.Post for k in ("username", "password", "email", "firstName", "surname", "activeState", "userLevel")):
				if self.Post.has_key("userLoaction"):
					location = self.Post['userLoaction']
				else:
					location = "310002"
					
				user = CustomUser.objects.create_user(self.Post['email'], self.Post['firstName'], self.Post['surname'], self.Post['password'])
				user.username = self.Post['username']
				user.first_name = self.Post['firstName']
				user.last_name = self.Post['surname']
				user.home_location = location
				if self.Post.has_key('activeState') and self.Post['activeState'] == "Active":
					user.is_active = True
				else:
					user.is_active = False
				if self.Post.has_key('userLevel') and self.Post['userLevel'] == "Admin":
					user.is_superuser = True
				else:
					user.is_superuser = False
				
				user.save()
				return self.returnOk()
			else:
				return self.handleUserError('Not All Variable Given')
		elif self.Command == 'addTwoFactorAuthentication':
			if self.Request.user.authy_id == "":
				if all (k in self.Post for k in ("email", "phone", "areacode")):
					authy_api = AuthyApiClient(settings.AUTHY_API_KEY)
					user = authy_api.users.create(self.Post['email'], self.Post['phone'], self.Post['areacode']) #email, cellphone, area_code
					if user.ok():
						self.Request.user.authy_id = user.id
						self.Request.user.save()
						return self.redirect(reverse('Settings'))						#On page '/account/?page=TwoFactorAuthentication'
					else:
						return self.handleUserError(user.errors())						#On page 'pages/Account/AuthyAdmin.html'
				else:
					return self.handleUserError('Please Supply All Details')			#On page 'pages/Account/AuthyAdmin.html'
			else:
				return self.handleUserError('User Already Has Authy Authentication')	#On page 'pages/Account/AuthyAdmin.html'
		elif self.Command == 'removeTwoFactorAuthentication':
			authy_api = AuthyApiClient(settings.AUTHY_API_KEY)
			if request.user.authy_id != "":
				result = authy_api.users.post("/protected/json/users/delete/" + str(request.user.authy_id), {})
				request.user.authy_id = ""
				request.user.save()
				return self.redirect(reverse('Settings'))						#On page '/account/?page=TwoFactorAuthentication'
			else:
				return self.handleUserError('Authy Not Enabled')
		elif self.Command == 'deleteUser':
			if request.user.is_superuser:
				if self.Post.has_key('user'):
					u = CustomUser.objects.get(username__exact=self.Post['user'])
					u.delete()
					return self.returnOk()
				else:
					return self.handleUserError('An Error Has Occured, Please Try Again Later')
			else:
				return self.handleUserError('Authentication Error')
		elif self.Command == 'changeUsername':
			if self.Post.has_key('value'):
				return self.handleUserError('No Email Entered')
			if self.Post.has_key('user'):
				if request.user.is_superuser:
					u = CustomUser.objects.get(username__exact=self.Post['user'])
					u.username = self.Post['value']
					u.save()
					return self.returnOk()
				else:
					return self.handleUserError('Authentication Error')
			else:
				u = request.user
				u.username = newUsername
				u.save()
				return self.returnOk()
		elif self.Command == 'changePassword':
			if not self.Post.has_key('value'):
				return self.handleUserError('No Password Entered')
			if self.Post.has_key('user'):
				if request.user.is_superuser:
					u = CustomUser.objects.get(username__exact=self.Post['user'])
					u.set_password(self.Post['value'])
					u.save()
					return self.returnOk()
				else:
					return self.handleUserError('An Error Has Occured, Please Try Again Later')
			else:
				u = request.user
				u.set_password(self.Post['value'])
				u.save()
				return self.returnOk()
		elif self.Command == 'changeFirstName':
			if not self.Post.has_key('value'):
				return self.handleUserError('No Name Entered')
			if self.Post.has_key('user'):
				if request.user.is_superuser:
					u = CustomUser.objects.get(username__exact=self.Post['user'])
					u.first_name = self.Post['value']
					u.save()
					return self.returnOk()
				else:
					return self.handleUserError('Authentication Error')
			else:
				u = request.user
				u.first_name = self.Post['value']
				u.save()
				return self.returnOk()
		elif self.Command == 'changeSecondName':
			if not self.Post.has_key('value'):
				return self.handleUserError('No Name Entered')
			if self.Post.has_key('user'):	
				if request.user.is_superuser:
					u = CustomUser.objects.get(username__exact=self.Post['user'])
					u.last_name = self.Post['value']
					u.save()
					return self.returnOk()
				else:
					return self.handleUserError('Authentication Error')
			else:
				u = request.user
				u.last_name = self.Post['value']
				u.save()
				return self.returnOk()
		elif self.Command == 'changeEmail':
			if not self.Post.has_key('value'):
				return self.handleUserError('No Email Entered')
			if self.Post.has_key('user'):
				if request.user.is_superuser:
					u = CustomUser.objects.get(username__exact=self.Post['user'])
					u.email = self.Post['value']
					u.save()
					return self.returnOk()
				else:
					return self.handleUserError('Authentication Error')
			else:
				u = request.user
				u.email = self.Post['value']
				u.save()
				return self.returnOk()
		elif self.Command == 'changeAdminLevel':
			if request.user.is_superuser:
				if self.Post.has_key('value') and self.Post.has_key('user'):
					u = CustomUser.objects.get(username__exact=self.Post['user'])
					if self.Post['value'] == "2":
						u.is_superuser = True
					else:
						u.is_superuser = False
					u.save()
					return self.returnOk()
				else:
					return self.handleUserError('Values Needed Not Given')
			else:
				return self.handleUserError('Authentication Error')
		elif self.Command == 'changeActiveState':
			if request.user.is_superuser:
				if self.Post.has_key('value') and self.Post.has_key('user'):
					u = CustomUser.objects.get(username__exact=self.Post['user'])
					if self.Post['value'] == "1":
						u.is_active = True
					else:
						u.is_active = False
					u.save()
					return self.returnOk()
				else:
					return self.handleUserError('Values Needed Not Given')
			else:
				return self.handleUserError('Authentication Error')
		else:
			return self.handleUserError('Command Not Found')
