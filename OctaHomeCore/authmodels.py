from django.contrib.auth.models import *
from django.contrib.auth.backends import ModelBackend
from django.conf import settings as djsetting
from django.utils.translation import ugettext_lazy as _
from OctaHomeCore.basemodels import *

import string
import random
import hashlib
import time

from authy.api import AuthyApiClient

#################
# Account Model #
#################
class CustomUserManager(BaseUserManager):
	def authyCheck(self, username, loginToken, authyToken):
		try:
			user = CustomUser.objects.get(email=username)
		except CustomUser.DoesNotExist:
			try:
				user = CustomUser.objects.get(username=username)
			except CustomUser.DoesNotExist:
				return None
		
		if user.authy_step_token == loginToken and user.handle_authy_token(authyToken):
			user.authy_step_token = ''
			user.save()
			return user
		else:
			user.authy_step_token = ''
			user.save()
			return None
		
	
	def create_user(self, email, first_name, last_name, password=None, **extra_fields):
		now = timezone.now()
		if not email:
			raise ValueError('The email is required to create this user')
		email = CustomUserManager.normalize_email(email)
		cuser = self.model(email=email, first_name=first_name,
							last_name=last_name, is_staff=False, 
                            is_active=True, is_superuser=False,
							date_joined=now, last_login=now, **extra_fields)
		cuser.set_password(password)
		cuser.save(using=self._db)
		return cuser

	def create_superuser(self, email, first_name, last_name, password=None, **extra_fields):
		u = self.create_user(email, first_name, last_name, password, **extra_fields)
		u.is_staff = True
		u.is_active = True
		u.is_superuser = True
		u.save(using=self._db)

		return u
	

class CustomUser(AbstractBaseUser):
	email = models.EmailField(_('email'), max_length=254, unique=True, validators=[validators.validate_email])
	username = models.CharField(_('username'), max_length=30, blank=True)
	first_name = models.CharField(_('first name'), max_length=45)
	last_name = models.CharField(_('last name'), max_length=45)
	is_staff = models.BooleanField(_('staff status'), default=False, help_text=_('Determines if user can access the admin site'))
	is_active = models.BooleanField(_('active'), default=True)
	is_superuser = models.BooleanField(_('super user'), default=False)
	date_joined = models.DateTimeField(_('date joined'), default=timezone.now)
	theme = models.CharField(_('theme'), max_length=45, default="")
	authy_id = models.CharField(_('authy id'), max_length=45, default="")
	authy_step_token = models.CharField(_('authy step token'), max_length=45, default="")

	objects = CustomUserManager()

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['first_name', 'last_name']
	
	def get_login_token(self):
		self.authy_step_token = ''.join(random.choice(string.ascii_uppercase) for i in range(45))
		self.save()
		return self.authy_step_token
	
	def handle_authy_token(self, authy_token):
		authy_api = AuthyApiClient(djsetting.AUTHY_API_KEY)
		if authy_token == 'sms':
			sms = authy_api.users.request_sms(aUser.authy_id, {"force": True})
			return False
		
		verification = authy_api.tokens.verify(self.authy_id, authy_token)
		if verification.ok():
			self.authy_step_token = ''
			self.save()
			return True
		else:
			return False
	
	def get_full_name(self):
		full_name = "%s %s" % (self.first_name, self.last_name)
		return full_name.strip()

	def get_short_name(self):
		return self.first_name.strip()
	
	class Meta:
		db_table = u'Users'

class DeviceUser(OctaBaseModel):
	User = models.ForeignKey('CustomUser')
	Secret = models.CharField(max_length=30)
	
	def createDeviceSetupToken(self):
		self.Secret = ''.join(random.choice(string.ascii_uppercase) for i in range(30))
		self.save()
		return ''.join([str(self.id), ':', self.Secret])
	
	def checkToken(self, token):
		salt = time.strftime("%H:%M-%d/%m/%Y")
		hashpassword = hashlib.sha512(self.Secret.encode('utf-8') + salt.encode('utf-8')).hexdigest()
		
		if (hashpassword == token):
			return True
		else:
			return False
	
	class Meta:
		db_table = u'DeviceUser'