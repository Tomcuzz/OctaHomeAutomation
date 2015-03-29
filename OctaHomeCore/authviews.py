from django.contrib.auth import authenticate, login, logout
from OctaHomeCore.baseviews import *
from OctaHomeCore.models import *
from OctaHomeCore.menumodels import *
from OctaHomeCore.settingviews import *

class handleLoginView(viewRequestHandler):
	loginToken = ''
	
	def handleRequest(self):
		if self.Request.user.is_authenticated():
			return super(handleLoginView, self).handleRequest()
			
		if self.Post.has_key('username') and self.Post.has_key('password'):
			user = authenticate(username=self.Post['username'], password=self.Post['password'])
			if user is not None and user.authy_id != "":
				self.loginToken = user.get_login_token()
			elif user is not None:
				login(self.Request, user)
		elif self.Post.has_key('authytoken') and self.Post.has_key('logintoken'):
			user = CustomUser().objects.authyCheck(self.Post['username'], self.Post['logintoken'], self.Post['authytoken'])
			if user is not None:
				login(self.Request, user)
		
		return super(handleLoginView, self).handleRequest()
	
	def getTemplate(self):
		if self.Request.user != None and self.Request.user.is_authenticated():
			if self.Post.has_key('next') and self.Post['next'] != '':
				self.redirect(self.Post['next'])
			else:
				self.redirect(reverse('Home'))
			return ''
		if self.loginToken:
			return 'OctaHomeCore/pages/Account/AuthyLogin'
		else:
			return 'OctaHomeCore/pages/Account/Login'
	
	def getViewParameters(self):
		parameters = {}
		if self.Post.has_key('next'):
			parameters.update({ 'next':self.Post['next'] })
		
		if self.loginToken != '' and self.Post.has_key('username'):
			parameters.update({ 'username':self.Post['username'], 'logintoken':self.loginToken })
		
		return parameters
	
	def getSideBar(self):
		return []
	
	def getSidebarUrlName(self):
		return ''
	
	def isPageSecured(self):
		return False

class handleLogOutView(viewRequestHandler):
	def handleRequest(self):
		logout(self.Request)
		return redirect(reverse('Home'))

######################
#  Settings Pannels  #
######################
class AccountSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 10
	DisplayName = "Account"
	
	@property
	def Link(self):
		return reverse('Settings')

class EditUsersSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 70
	DisplayName = "Edit Users"
	#self.Request.user.is_superuser
	#def isShown(self):
	#	return self.Request.user.is_superuser
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'EditUsers'})

class AddUserSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 80
	DisplayName = "Add User"
	#self.Request.user.is_superuser
	#def isShown(self):
	#	return self.Request.user.is_superuser
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'AddUser'})

class LogOutSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 90
	DisplayName = "Log Out"
	
	@property
	def Link(self):
		return reverse('LogOut')


class EditUserSettingsPage(SettingsPage):
	Name = "EditUser"
	ViewPartial = "OctaHomeCore/Settings/EditUser"

class EditUsersSettingsPage(SettingsPage):
	Name = "EditUsers"
	ViewPartial = "OctaHomeCore/Settings/EditUsers"
	def getViewParameters(self):
		return {'users':CustomUser.objects.all()}

class AddUserSettingsPage(SettingsPage):
	Name = "AddUser"
	ViewPartial = "OctaHomeCore/Settings/AddUser"
	def getViewParameters(self):
		return {'locations': WeatherLocation.objects.order_by('name').all()}



class AddUserCompleteSettingsCommand(SettingsCommand):
	Name = "addUserComplete"
	def RunCommand(self):
		if not self.ViewHandler.Request.user.is_superuser:
			return self.ViewHandler.handleUserError('Privilege Authentication Failure')
		
		if all (k in self.ViewHandler.Post for k in ("username", "password", "email", "firstName", "surname", "activeState", "userLevel")):
			if self.ViewHandler.Post.has_key("userLoaction"):
				location = self.ViewHandler.Post['userLoaction']
			else:
				location = "310002"
				
			user = CustomUser.objects.create_user(self.ViewHandler.Post['email'], self.ViewHandler.Post['firstName'], self.ViewHandler.Post['surname'], self.ViewHandler.Post['password'])
			user.username = self.ViewHandler.Post['username']
			user.first_name = self.ViewHandler.Post['firstName']
			user.last_name = self.ViewHandler.Post['surname']
			user.home_location = location
			if self.ViewHandler.Post.has_key('activeState') and self.ViewHandler.Post['activeState'] == "Active":
				user.is_active = True
			else:
				user.is_active = False
			if self.ViewHandler.Post.has_key('userLevel') and self.ViewHandler.Post['userLevel'] == "Admin":
				user.is_superuser = True
			else:
				user.is_superuser = False
			
			user.save()
			return self.ViewHandler.returnOk()
		else:
			return self.ViewHandler.handleUserError('Not All Variable Given')

class AddTwoFactorAuthenticationSettingsCommand(SettingsCommand):
	Name = "addTwoFactorAuthentication"
	def RunCommand(self):
		if self.ViewHandler.Request.user.authy_id == "":
			if all (k in self.ViewHandler.Post for k in ("email", "phone", "areacode")):
				authy_api = AuthyApiClient(settings.AUTHY_API_KEY)
				user = authy_api.users.create(self.ViewHandler.Post['email'], self.ViewHandler.Post['phone'], self.ViewHandler.Post['areacode']) #email, cellphone, area_code
				if user.ok():
					self.ViewHandler.Request.user.authy_id = user.id
					self.ViewHandler.Request.user.save()
					return self.ViewHandler.redirect(reverse('Settings'))						#On page '/account/?page=TwoFactorAuthentication'
				else:
					return self.ViewHandler.handleUserError(user.errors())						#On page 'pages/Account/AuthyAdmin.html'
			else:
				return self.ViewHandler.handleUserError('Please Supply All Details')			#On page 'pages/Account/AuthyAdmin.html'
		else:
			return self.ViewHandler.handleUserError('User Already Has Authy Authentication')	#On page 'pages/Account/AuthyAdmin.html'

class RemoveTwoFactorAuthenticationSettingsCommand(SettingsCommand):
	Name = "removeTwoFactorAuthentication"
	def RunCommand(self):
		authy_api = AuthyApiClient(settings.AUTHY_API_KEY)
		if self.ViewHandler.Request.user.authy_id != "":
			self.ViewHandler.Result = authy_api.users.post("/protected/json/users/delete/" + str(self.ViewHandler.Request.user.authy_id), {})
			self.ViewHandler.Request.user.authy_id = ""
			self.ViewHandler.Request.user.save()
			return self.ViewHandler.redirect(reverse('Settings'))						#On page '/account/?page=TwoFactorAuthentication'
		else:
			return self.ViewHandler.handleUserError('Authy Not Enabled')

class DeleteUserSettingsCommand(SettingsCommand):
	Name = "deleteUser"
	def RunCommand(self):
		if self.ViewHandler.Request.user.is_superuser:
			if self.ViewHandler.Post.has_key('user'):
				u = CustomUser.objects.get(username__exact=self.ViewHandler.Post['user'])
				u.delete()
				return self.ViewHandler.returnOk()
			else:
				return self.ViewHandler.handleUserError('An Error Has Occured, Please Try Again Later')
		else:
			return self.ViewHandler.handleUserError('Authentication Error')

class ChangeUsernameSettingsCommand(SettingsCommand):
	Name = "changeUsername"
	def RunCommand(self):
		if self.ViewHandler.Post.has_key('value'):
			return self.ViewHandler.handleUserError('No Email Entered')
		if self.ViewHandler.Post.has_key('user'):
			if self.ViewHandler.Request.user.is_superuser:
				u = CustomUser.objects.get(username__exact=self.ViewHandler.Post['user'])
				u.username = self.ViewHandler.Post['value']
				u.save()
				return self.ViewHandler.returnOk()
			else:
				return self.ViewHandler.handleUserError('Authentication Error')
		else:
			u = self.ViewHandler.Request.user
			u.username = newUsername
			u.save()
			return self.ViewHandler.returnOk()

class ChangePasswordSettingsCommand(SettingsCommand):
	Name = "changePassword"
	def RunCommand(self):
		if not self.ViewHandler.Post.has_key('value'):
			return self.ViewHandler.handleUserError('No Password Entered')
		if self.ViewHandler.Post.has_key('user'):
			if self.ViewHandler.Request.user.is_superuser:
				u = CustomUser.objects.get(username__exact=self.ViewHandler.Post['user'])
				u.set_password(self.ViewHandler.Post['value'])
				u.save()
				return self.ViewHandler.returnOk()
			else:
				return self.ViewHandler.handleUserError('An Error Has Occured, Please Try Again Later')
		else:
			u = self.ViewHandler.Request.user
			u.set_password(self.ViewHandler.Post['value'])
			u.save()
			return self.ViewHandler.returnOk()

class ChangeFirstNameSettingsCommand(SettingsCommand):
	Name = "changeFirstName"
	def RunCommand(self):
		if not self.ViewHandler.Post.has_key('value'):
			return self.ViewHandler.handleUserError('No Name Entered')
		if self.ViewHandler.Post.has_key('user'):
			if self.ViewHandler.Request.user.is_superuser:
				u = CustomUser.objects.get(username__exact=self.ViewHandler.Post['user'])
				u.first_name = self.ViewHandler.Post['value']
				u.save()
				return self.ViewHandler.returnOk()
			else:
				return self.ViewHandler.handleUserError('Authentication Error')
		else:
			u = self.ViewHandler.Request.user
			u.first_name = self.ViewHandler.Post['value']
			u.save()
			return self.returnOk()

class ChangeSecondNameSettingsCommand(SettingsCommand):
	Name = "changeSecondName"
	def RunCommand(self):
		if not self.ViewHandler.Post.has_key('value'):
			return self.ViewHandler.handleUserError('No Name Entered')
		if self.ViewHandler.Post.has_key('user'):	
			if self.ViewHandler.Request.user.is_superuser:
				u = CustomUser.objects.get(username__exact=self.ViewHandler.Post['user'])
				u.last_name = self.ViewHandler.Post['value']
				u.save()
				return self.ViewHandler.returnOk()
			else:
				return self.ViewHandler.handleUserError('Authentication Error')
		else:
			u = self.ViewHandler.Request.user
			u.last_name = self.ViewHandler.Post['value']
			u.save()
			return self.ViewHandler.returnOk()

class ChangeEmailSettingsCommand(SettingsCommand):
	Name = "changeEmail"
	def RunCommand(self):
		if not self.ViewHandler.Post.has_key('value'):
			return self.ViewHandler.handleUserError('No Email Entered')
		if self.ViewHandler.Post.has_key('user'):
			if self.ViewHandler.Request.user.is_superuser:
				u = CustomUser.objects.get(username__exact=self.ViewHandler.Post['user'])
				u.email = self.ViewHandler.Post['value']
				u.save()
				return self.ViewHandler.returnOk()
			else:
				return self.ViewHandler.handleUserError('Authentication Error')
		else:
			u = request.user
			u.email = self.ViewHandler.Post['value']
			u.save()
			return self.ViewHandler.returnOk()

class ChangeAdminLevelSettingsCommand(SettingsCommand):
	Name = "changeAdminLevel"
	def RunCommand(self):
		if self.ViewHandler.Request.user.is_superuser:
			if self.Post.has_key('value') and self.ViewHandler.Post.has_key('user'):
				u = CustomUser.objects.get(username__exact=self.ViewHandler.Post['user'])
				if self.ViewHandler.Post['value'] == "2":
					u.is_superuser = True
				else:
					u.is_superuser = False
				u.save()
				return self.ViewHandler.returnOk()
			else:
				return self.ViewHandler.handleUserError('Values Needed Not Given')
		else:
			return self.ViewHandler.handleUserError('Authentication Error')

class ChangeActiveStateSettingsCommand(SettingsCommand):
	Name = "changeActiveState"
	def RunCommand(self):
		if self.ViewHandler.Request.user.is_superuser:
			if self.ViewHandler.Post.has_key('value') and self.ViewHandler.Post.has_key('user'):
				u = CustomUser.objects.get(username__exact=self.ViewHandler.Post['user'])
				if self.Post['value'] == "1":
					u.is_active = True
				else:
					u.is_active = False
				u.save()
				return self.ViewHandler.returnOk()
			else:
				return self.ViewHandler.handleUserError('Values Needed Not Given')
		else:
			return self.ViewHandler.handleUserError('Authentication Error')

class AddTriggerEventCompleteSettingsCommand(SettingsCommand):
	Name = "addTriggerEventComplete"
	def RunCommand(self):
		if self.ViewHandler.Post.has_key('name') and self.ViewHandler.Post.has_key('actionGroups'):
			name = self.ViewHandler.Post['name']
			actionGroups = self.ViewHandler.Post['actionGroups']
			NewTriggerEvent = TriggerEvent.objects.create(Name=name)
			
			for actionGroupId in actionGroups.split(','):
				actionGroup = ActionGroup.objects.get(pk=actionGroupId)
				if actionGroup != None:
					NewTriggerEvent.ActionGroups.add(actionGroup)
			NewTriggerEvent.save()
			
			return self.ViewHandler.redirect(reverse('SettingsPage', kwargs={'page':'Events'}))
		else:
			return self.ViewHandler.handleUserError('Not All Values Given')