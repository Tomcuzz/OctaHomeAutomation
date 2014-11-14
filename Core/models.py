from django.db import models
from django.contrib.contenttypes.generic import *
from django.contrib.auth.models import *
from django.contrib.auth.backends import ModelBackend
from django.utils.translation import ugettext_lazy as _
from django.conf import settings as djsetting
from django.core import validators
from django.utils import timezone

import json

import string
import random

from authy.api import AuthyApiClient

#################
# Account Model #
#################
class CustomUserManager(BaseUserManager):
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

class CustomBeckends(ModelBackend):
	def authenticate(self, username=None, password=None, authy_token=None, login_token=None, force_single_step=False):
		if not username:
			return None
		
		if force_single_step:
			return super(CustomBeckends, self).authenticate(username, password)
		
		if authy_token and login_token:
			try:
				user = CustomUser.objects.get(username=username)
			except User.DoesNotExist:
				return None
			
			if login_token == user.authy_step_token and user.handle_authy_token(authy_token):
				return user
			else:
				return None
		
		if password:
			user = super(CustomBeckends, self).authenticate(username, password)
			if user:
				if user.authy_id == '':
					return user
				else:
					return None
			else:
				return None
		
		return None
			
		
	def first_step(self, username=None, password=None):
		user = super(CustomBeckends, self).authenticate(username, password)
		if user is None:
			return None
		user.authy_step_token = ''.join(random.choice(string.ascii_uppercase) for i in range(45))
		user.save()
		return user.authy_step_token

class CustomUser(AbstractBaseUser):
	email = models.EmailField(_('email'), max_length=254, unique=True, validators=[validators.validate_email])
	username = models.CharField(_('username'), max_length=30, blank=True)
	first_name = models.CharField(_('first name'), max_length=45)
	last_name = models.CharField(_('last name'), max_length=45)
	home_location = models.CharField(_('home location'), max_length=45, default="")
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
	
	def is_authenticated(self):
		return True
	
	def get_full_name(self):
		full_name = "%s %s" % (self.first_name, self.last_name)
		return full_name.strip()

	def get_short_name(self):
		return self.first_name.strip()
	
	class Meta:
		db_table = u'Users'


##################
# Location Types #
##################
class World(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Worlds'

class Country(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	World = models.ForeignKey(World, blank=True, null=True, related_name="Countrys")
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Country'


class Home(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Country = models.ForeignKey(Country, blank=True, null=True, related_name="Homes")
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Homes'

class Room(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Home = models.ForeignKey(Home, blank=True, null=True, related_name="Rooms")
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Rooms'


def getNonAbstractSubClasses(cls):
	classes = []
	for subclass in cls.__subclasses__():
		if subclass._meta.abstract:
			classes.extend(getNonAbstractSubClasses(subclass))
		else:
			classes.append(subclass)
	return classes

def getAllSubClasses(cls):
	classes = [cls]
	for subclass in cls.__subclasses__():
		classes.extend(getAllSubClasses(subclass))
	return classes

################
# Device Types #
################
class Device(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Rooms = models.ManyToManyField(Room, blank=True, null=True, related_name="%(app_label)s_%(class)s_Devices")
	IpAddress = models.TextField()
	Port = models.IntegerField()
	
	#################
	# Class Methods #
	#################
	@classmethod
	def getDevices(cls, kwargs={}):
		devices = []
		
		for deviceClass in getNonAbstractSubClasses(cls):
			devices.extend(deviceClass.objects.all())
		
		returnDevices = []
		
		if (kwargs.has_key('room') and kwargs['room'] != 'all') or (kwargs.has_key('house') and kwargs['house'] != 'all'):
			if kwargs.has_key('room') and kwargs['room'] != 'all':
				rooms = Room.objects.filter(id=kwargs['room'])
			elif kwargs.has_key('house') and kwargs['house'] != 'all':
				house = Home.objects.filter(id=kwargs['house'])
				rooms = Room.objects.filter(Home=house)
			else:
				room = []
			
			for device in devices:
				for room in rooms:
					if device.__class__.objects.filter(pk=device.id, Rooms__in=[room]).exists():
						returnDevices.append(device)
						break
		else:
			returnDevices = devices
		
		return returnDevices
	
	@classmethod
	def getClassNames(cls):
		classNames = []
		for deviceClass in getNonAbstractSubClasses(cls):
			classNames.append(deviceClass.__name__)
		return classNames
	
	@classmethod
	def create(cls, className, kwargs={}):
		if cls.__name__ == className:
			if kwargs.has_key('name'):
				device = cls(Name = kwargs['name'])
			else:
				return None
		else:
			device = None
			for deviceClass in getNonAbstractSubClasses(cls):
				if cls.__name__ == className:
					device = deviceClass(kwargs)
					break
			if device == None:
				return None
			
		if kwargs.has_key('room'):
			room = Room.objects.get(pk=kwargs['room'])
			device.Rooms.add(room)
		if kwargs.has_key('ipaddress'):
			device.IpAddress = kwargs['ipaddress']
		if kwargs.has_key('port'):
			device.Port = kwargs['port']
		return device
	
	def getSuperClassNames(self):
		name = []
		for deviceClass in getAllSubClasses(Device):
			if issubclass(self.__class__, deviceClass):
				name.append(deviceClass.__name__)
		return name
				
	
	def getState(self):
		return {}
	
	########
	# Meta #
	########
	class Meta:
		abstract = True

class OutputDevice(Device):
	##############
	# Parameters #
	##############
	Actions = models.ManyToManyField('Action', blank=True, null=True, related_name="%(app_label)s_%(class)s_Devices")
	
	########
	# Meta #
	########
	class Meta:
	 	abstract = True

class InputDevice(Device):
	##############
	# Parameters #
	##############
	events = models.ManyToManyField('Event', related_name="%(app_label)s_%(class)s_Devices")
	
	########
	# Meta #
	########
	class Meta:
		abstract = True	



################
# Input/Output #
################
class Action(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Parameters = models.TextField()
	RunIsAsync = models.BooleanField(default=False)
	
	##################
	# Object Methods #
	##################
	def getParameters(self):
		return json.loads(self.parameters)
	
	def setParameters(self, array):
		self.parameters = json.dumps(array)
	
	def run(currentRunType = False):
		if self.RunIsAsync == False or self.RunIsAsync == currentRunType:
			for device in self.Devices:
				functionName = self.getParameters()[device.Name]['name']
				functionParameters = self.getParameters()[device.Name]['parameters']
				if functionName != '':
					device.handleAction(functionName, functionParameters)
		else:
			raise Exception('ASYNC NOT IMPLEMENTED')
	
	#################
	# Class Methods #
	#################
	@property
	def Devices(self):
		devices = []
		
		for deviceClass in getNonAbstractSubClasses(Device):
			devices.extend(deviceClass.objects.filter(Actions__in=[self]))
		
		return devices
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Actions'


class Event(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Actions = models.ManyToManyField(Action, related_name="Events")
	
	##################
	# Object Methods #
	##################
	def call():
		for action in self.Actions:
			action.run()
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Event'


