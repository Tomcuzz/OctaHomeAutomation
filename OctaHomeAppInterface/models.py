from django.contrib.auth.models import *
from django.contrib.auth.backends import ModelBackend
from django.utils.translation import ugettext_lazy as _
from OctaHomeCore.models import *

import datetime
import string
import random
import hashlib
import time

from authy.api import AuthyApiClient

#################
# Account Model #
#################
class DeviceUser(OctaBaseModel):
	User = models.ForeignKey('OctaHomeCore.CustomUser')
	Secret = models.CharField(max_length=30)
	
	def createDeviceSetupToken(self, host):
		self.Secret = ''.join(random.choice(string.ascii_uppercase) for i in range(30))
		self.save()
		return {"host":host, "user":self.id, "password":self.Secret }
	
	def checkToken(self, token):
		salt = datetime.datetime.utcnow().strftime("%H:%M-%d/%m/%Y")
		hashpassword = hashlib.sha512(self.Secret.encode('utf-8') + salt.encode('utf-8')).hexdigest().upper()
		if (hashpassword == token):
			return True
		else:
			return False
	
	class Meta:
		db_table = u'DeviceUser'