from django.conf import settings

from OctaHomeCore.baseviews import *
from OctaHomeCore.models import *
from OctaHomeCore.weathermodels import *

class handleSettingsView(viewRequestHandler):
	def getViewParameters(self):
		parameters = {}
		
		if self.Page == 'ActionGroups':
			parameters = {'actionGroups':ActionGroup.objects.all()}
		elif self.Page == 'AGConditions':
			parameters = {'aGConditions':AGCondition.objects.all()}
		elif self.Page == 'Actions':
			parameters = {'actions':Action.objects.all()}
		elif self.Page == 'Events':
			parameters = {'events':TriggerEvent.objects.all()}
		elif self.Page == 'EditUsers':
			parameters = {'users':CustomUser.objects.all()}
		elif self.Page == 'AddUser':
			parameters = {'locations': WeatherLocations.objects.order_by('name').all()}
		
		elif self.Page == 'AddEvent':
			parameters = {'actiongroups': ActionGroup.objects.all()}
		elif self.Page == 'AddActionGroup':
			parameters = {'triggerEvents': TriggerEvent.objects.all(), 'aGConditions':AGCondition.objects.all(), 'actions':Action.objects.all()}
		elif self.Page == 'AddAGCondition':
			parameters = {'actiongroups':ActionGroup.objects.all()}
		#else:
			#return 'pages/Settings/EditUser'
		
		return parameters
		
	def getTemplate(self):
		if self.Page == 'None':
			return 'OctaHomeSettings/EditUser'
		elif self.Page == 'Events':
			return 'OctaHomeSettings/TriggerEvents'
		elif self.Page == 'ActionGroups':
			return 'OctaHomeSettings/ActionGroups'
		elif self.Page == 'AGConditions':
			return 'OctaHomeSettings/AGConditions'
		elif self.Page == 'Actions':
			return 'OctaHomeSettings/Actions'
		elif self.Page == 'EditUsers':
			return 'OctaHomeSettings/EditUsers'
		elif self.Page == 'AddUser':
			return 'OctaHomeSettings/AddUser'
		
		elif self.Page == 'AddEvent':
			return 'OctaHomeSettings/AddTriggerEvent'
		elif self.Page == 'AddActionGroup':
			return 'OctaHomeSettings/AddActionGroup'
		elif self.Page == 'AddAGCondition':
			return 'OctaHomeSettings/AddAGCondition'
		elif self.Page == 'AddAction':
			return 'OctaHomeSettings/AddAction'
		
		else:
			return 'OctaHomeSettings/EditUser'
	
	def getSideBar(self):
		links = [
			{'title': 'Account', 					'address': reverse('Settings'), 									'active': self.getSideBarActiveState('None',			self.Page)},
			{'title': 'Events',  					'address': reverse('SettingsPage', kwargs={'page':'Events'}),  		'active': self.getSideBarActiveState('Events',			self.Page)},
			{'title': 'Action Groups', 				'address': reverse('SettingsPage', kwargs={'page':'ActionGroups'}), 'active': self.getSideBarActiveState('ActionGroups', 	self.Page)},
			{'title': 'Action Group Conditions', 	'address': reverse('SettingsPage', kwargs={'page':'AGConditions'}), 'active': self.getSideBarActiveState('AGConditions', 	self.Page)},
			{'title': 'Actions', 					'address': reverse('SettingsPage', kwargs={'page':'Actions'}), 		'active': self.getSideBarActiveState('Actions',			self.Page)}
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
		elif self.Command == 'addTriggerEventComplete':
			if self.Post.has_key('name') and self.Post.has_key('actionGroups'):
				name = self.Post['name']
				actionGroups = self.Post['actionGroups']
				NewTriggerEvent = TriggerEvent.objects.create(Name=name)
				
				for actionGroupId in actionGroups.split(','):
					actionGroup = ActionGroup.objects.get(pk=actionGroupId)
					if actionGroup != None:
						NewTriggerEvent.ActionGroups.add(actionGroup)
				NewTriggerEvent.save()
				
				return self.redirect(reverse('SettingsPage', kwargs={'page':'Events'}))
			else:
				return self.handleUserError('Not All Values Given')
		elif self.Command == 'addActionGroupComplete':
			if self.Post.has_key('name') and self.Post.has_key('triggerEvents') and self.Post.has_key('aGConditions') and self.Post.has_key('actions'):
				name = self.Post['name']
				triggerEventsIds = self.Post['triggerEvents']
				aGConditionsIds = self.Post['aGConditions']
				actionsIds = self.Post['actions']
				NewActionGroup = ActionGroup.objects.create(Name=name)
				
				for triggerEventId in triggerEventsIds.split(','):
					triggerEvent = TriggerEvent.objects.get(pk=triggerEventId)
					if triggerEvent != None:
						NewActionGroup.TriggerEvents.add(triggerEvent)
				
				for actionGroupId in aGConditionsIds.split(','):
					actionGroup = AGCondition.objects.get(pk=actionGroupId)
					if actionGroup != None:
						NewActionGroup.AGCondition.add(actionGroup)
				
				for actionGroupId in actionsIds.split(','):
					actionGroup = Action.objects.get(pk=actionGroupId)
					if actionGroup != None:
						NewActionGroup.Actions.add(actionGroup)
				
				NewActionGroup.save()
				
				
				return self.redirect(reverse('SettingsPage', kwargs={'page':'ActionGroups'}))
			else:
				return self.handleUserError('Not All Values Given')
		elif self.Command == 'addActionGroupConditionComplete':
			if self.Post.has_key('name'):
				name = self.Post['name']
				AGCondition.objects.create(Name=name)
				
				return self.redirect(reverse('SettingsPage', kwargs={'page':'AGConditions'}))
			else:
				return self.handleUserError('Not All Values Given')
		elif self.Command == 'addActionComplete':
			if self.Post.has_key('name'):
				name = self.Post['name']
				Action.objects.create(Name=name)
				
				return self.redirect(reverse('SettingsPage', kwargs={'page':'Actions'}))
			else:
				return self.handleUserError('Not All Values Given')
		else:
			return self.handleUserError('Command Not Found')
