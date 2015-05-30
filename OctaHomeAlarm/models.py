from django.db import models
from polymorphic import PolymorphicModel
from OctaHomeCore.models import *

import time
import datetime
from dateutil.relativedelta import *


class Alarm(TriggerEvent):
	##############
	# Parameters #
	##############
	Enabled = models.BooleanField(default=False)
	Date = models.DateTimeField()
	Recurrence = models.TextField(default="")
	CeleryTaskId = models.TextField(default="")
	User = models.ForeignKey(CustomUser, blank=True, null=True, on_delete=models.SET_NULL)
	
	##################
	# Object Methods #
	##################
	def call(self):
		try:
			for action in self.ActionGroups:
				action.run()
		finally:
			if newAlarm.recurrence == "Once A Hour":
				self.Date = self.Date + datetime.timedelta(hours=1)
			elif newAlarm.recurrence == "Once A Day":
				self.Date = self.Date + datetime.timedelta(days=1)
			elif newAlarm.recurrence == "Once A Week":
				self.Date = self.Date + datetime.timedelta(days=7)
			elif newAlarm.recurrence == "Once A Month":
				self.Date = self.Date + relativedelta(months=1)
	
	class Meta:
		db_table = u'Alarms'
