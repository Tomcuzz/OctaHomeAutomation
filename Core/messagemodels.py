from django.db import models
import json

class Message(models.Model):
	##############
	# Parameters #
	##############
	Title = models.TextField()
	Message = models.TextField()
	Date = models.DateTimeField(auto_now_add=True, blank=True)
	
	########
	# Meta #
	########
	class Meta:
		abstract = True

class LogItem(Message):
	# There is a link from device to this object
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'Logs'

class NotificationMessage(Message):
	##############
	# Parameters #
	##############
	Dismissed = models.BooleanField(default=False)
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'Notifications'

class WarningMessage(Message):
	##############
	# Parameters #
	##############
	Dismissed = models.BooleanField(default=False)
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'Warnings'

class ErrorMessage(Message):
	##############
	# Parameters #
	##############
	Dismissed = models.BooleanField(default=False)
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'Errors'
	