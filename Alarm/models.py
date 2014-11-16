from django.db import models
from Core.models import *
from Settings.models import *

import time
import datetime
from dateutil.relativedelta import *


class Alarm(Event):
	Enabled = models.BooleanField(default=False)
	Date = models.DateTimeField()
	Recurrence = models.TextField(default="")
	CeleryTaskId = models.TextField(default="")
	User = models.ForeignKey(CustomUser, blank=True, null=True, on_delete=models.SET_NULL)
	
	def call(self):
		try:
			super(Alarm, self).call()
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
