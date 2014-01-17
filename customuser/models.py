from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.utils.translation import ugettext_lazy as _
from django.core import validators
from django.utils import timezone

class CustomUserManager(BaseUserManager):
	def create_user(self, email, first_name, last_name, password=None, 
                                                        **extra_fields):
		'''
		Create a CustomUser with email, name, password and other extra fields
		'''
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

	def create_superuser(self, email, first_name, last_name, password=None, 
                                                            **extra_fields):
		u = self.create_user(email, first_name, last_name, password, 
                                                            **extra_fields)
		u.is_staff = True
		u.is_active = True
		u.is_superuser = True
		u.save(using=self._db)

		return u

class CustomUser(AbstractBaseUser):
	'''
	Class implementing a custom user model. Includes basic django admin
	permissions and can be used as a skeleton for other models. 
	
	Email is the unique identifier. Email, password and name are required
	'''
	email = models.EmailField(_('email'), max_length=254, unique=True,
								validators=[validators.validate_email])
	username = models.CharField(_('username'), max_length=30, blank=True)
	first_name = models.CharField(_('first name'), max_length=45)
	last_name = models.CharField(_('last name'), max_length=45)
	home_location = models.CharField(_('home location'), max_length=45, default="")
	is_staff = models.BooleanField(_('staff status'), default=False,
				help_text=_('Determines if user can access the admin site'))
	is_active = models.BooleanField(_('active'), default=True)
	is_superuser = models.BooleanField(_('super user'), default=False)
	date_joined = models.DateTimeField(_('date joined'), default=timezone.now)

	objects = CustomUserManager()

	USERNAME_FIELD = 'email'
	REQUIRED_FIELDS = ['first_name', 'last_name']

	def get_full_name(self):
		'''
		Returns the user's full name. This is the first name + last name
		'''
		full_name = "%s %s" % (self.first_name, self.last_name)
		return full_name.strip()

	def get_short_name(self):
		'''
		Returns a short name for the user. This will just be the first name
		'''
		return self.first_name.strip()

