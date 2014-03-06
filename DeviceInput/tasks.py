from django.http import HttpResponse, HttpResponseNotFound
from celery.task import task
from models import *
from Alarm.tasks import *

@task
def motionTimeOut(deviceId):
	motionDevice = MotionInputDevice.objects.get(id=int(deviceId))
	motionDevice.Activated = False
	performActions(motionDevice.TimeOutAction.actions)
	motionDevice.TimeOutTaskCeleryId
	motionDevice.save()