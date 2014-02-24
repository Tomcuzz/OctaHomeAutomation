from django.db import models

class Alarms(models.Model):
	time = models.TextField(default="")
	date = models.TextField(default="")
	recurrence = models.TextField(default="")
	user = models.TextField(default="")
	task = models.ForeignKey('Tasks', blank=True, null=True, on_delete=models.SET_NULL)
	state = models.TextField(default="")
	celeryTaskId = models.TextField(default="")
	
	class Meta:
		db_table = u'Alarms'

class Tasks(models.Model):
	name = models.TextField(default="")
	actions = models.TextField(default="")
	Room = models.ForeignKey('SharedFunctions.Rooms', blank=True, null=True, on_delete=models.SET_NULL)
	
	class Meta:
		db_table = u'Tasks'

class TaskAction(models.Model):
	name = models.TextField(default="")
	actionType = models.TextField(default="")
	actionVeriables = models.TextField(default="")
	syncAsyncRunType = models.TextField(default="")
	
	class Meta:
		db_table = u'TaskActions'
