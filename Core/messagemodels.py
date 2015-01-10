from django.db import models

class Message(models.Model):
	##############
	# Parameters #
	##############
	title = models.TextField()
	message = models.TextField()
	
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
	########
	# Meta #
	########
	class Meta:
		db_table = 'Notifications'

class WarningMessage(Message):
	########
	# Meta #
	########
	class Meta:
		db_table = 'Warnings'
	