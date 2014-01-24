from Alarm.tasks import *
from models import *
from django.contrib.auth.models import User
from celery.task.control import revoke
import datetime
import json
from celery.execute import send_task

class alarm():
	def setAlarm(self, request):
		#Get All Input Veriables
		hour = request.POST.get('timehour', '')
		minutes = request.POST.get('timeminutes', '')
		amPm = request.POST.get('timeampm', '')
		date = request.POST.get('date', '')
		recurrence = request.POST.get('recurrence', '')
		task = request.POST.get('task', '')
		state = request.POST.get('state', '')
		tasksUser = request.POST.get('tasksuser', '')
		
		#Process input veriables
		#Process Time
		timeString = hour + ":" + minutes + ":" + amPm
		#Process User
		if tasksUser == "System" and request.user.is_superuser:
			user = "System"
		else:
			user = request.user.username
		
		celeryTaskId = "TaskNotStarted"
		
		newAlarm = Alarms(time=timeString, date=date, user=user, task=task, celeryTaskId=celeryTaskId, state=state, recurrence=recurrence)	
		newAlarm.save()
		
		dateArray = date.split("/")
		
		if hour == "12":
			hour = "0";
		
		if amPm == "AM":
			dateHour = hour
		else:
			dateHour = str(int(hour)+12)
		
		setDate = datetime.datetime(int(dateArray[2]), int(dateArray[1]), int(dateArray[0]), int(dateHour), int(minutes))
		celeryRunningTask = triggerAlarm.apply_async(args=[str(newAlarm.id)], kwargs={}, eta=setDate)
		newAlarm.celeryTaskId = celeryRunningTask.id
		newAlarm.save()
	def diabaleAlarm(self, request):
		alarmId = request.GET.get('alarmId', '')
		if alarmId != "":
			theAlarm = Alarms.objects.get(id=alarmId)
			theAlarm.state = "Disabled"
			if theAlarm.celeryTaskId != "TaskNotStarted":
				revoke(theAlarm.celeryTaskId, terminate=True) #may need to change tuminate to false (will stop it from canceling exicusion if set to fasle)
			theAlarm.celeryTaskId = "TaskNotStarted"
			theAlarm.save()
	def enableAlarm(self,request):
		alarmId = request.GET.get('alarmId', '')
		if alarmId != "":
			theAlarm = Alarms.objects.get(id=alarmId)
			theAlarm.state = "Enabled"
			if theAlarm.celeryTaskId != "TaskNotStarted":
				dateArray = theAlarm.date.split("-")
				timeArray = theAlarm.time.split(":")
				
				if timeArray[0] == "12":
					hour = "0"
				else:
					hour = timeArray[0]
				
				if timeArray[2] == "AM":
					dateHour = hour
				else:
					dateHour = str(int(hour)+12)
				
				setDate = datetime.datetime(int(dateArray[2]), int(dateArray[1]), int(dateArray[0]), int(dateHour), int(timeArray[1]))
				
				if setDate > datetime.datetime.today():
					theAlarm.state = "Disabled"
				else:
					celeryRunningTask = triggerAlarm.apply_async(eta=setDate, kwargs={'alarmId': newAlarm.id})
					theAlarm.celeryTaskId = celeryRunningTask.id
			theAlarm.save()
	def deleteAlarm(self, request):
		alarmId = request.GET.get('alarmId', '')
		if alarmId != "":
			self.diabaleAlarm(request)
			theAlarm = Alarms.objects.get(id=alarmId)
			theAlarm.delete()
	def addTask(self, request):
		task = AlarmTasks(name="", actions="")
		task.name = request.POST.get('name', '').replace(" ", "_")
		inputTaskNumbers = request.POST.get('tasklist', '').split(",")
		tasksArray = []
		for aTaskNumber in inputTaskNumbers:
			aTaskFormName = "task" + aTaskNumber
			tasksArray.append(request.POST.get(aTaskFormName, '').replace(" ", "_"))
		task.actions = json.dumps(tasksArray, sort_keys=True, separators=(',',':'))
		task.save()
	def addTaskAction(self, request):
		if request.POST.get('name', '') == "":
			return
		
		newAlarmTaskAction = AlarmTaskAction(name="", actionType="", actionVeriables="")
		newAlarmTaskAction.name = request.POST.get('name', '').replace(" ", "_")
		newAlarmTaskAction.actionType = request.POST.get('actiontasktype', '').replace(" ", "_")
		newAlarmTaskAction.syncAsyncRunType = request.POST.get('runtype', 'Asynchronous').replace(" ", "_")
		
		if request.POST.get('actiontasktype', '') == "Play Speach":
			targetIpAddress = request.POST.get('speachdeviceipaddress', '')
			targetPort = request.POST.get('speachdeviceport', '')
			speachScript = request.POST.get('speachscript', '').replace(" ", "_")
			speachpostcode = request.POST.get('speachpostcode', '').replace(" ", "").lower()
			actionVeriables = {'targetIpAddress':targetIpAddress, 'targetPort':targetPort, 'speachScript':speachScript, 'postcode':speachpostcode}
			newAlarmTaskAction.actionVeriables = json.dumps(actionVeriables, sort_keys=False, separators=(',',':'))
		elif request.POST.get('actiontasktype', '') == "Play Music":
			targetIpAddress = request.POST.get('musicdeviceipaddress', '')
			targetPort = request.POST.get('musicdeviceport', '')
			playType = "playlist"
			playListName = request.POST.get('playlistname', '').replace("_", "\_").replace(" ", "_")
			actionVeriables = {'targetIpAddress':targetIpAddress, 'targetPort':targetPort, 'playType':playType, 'playListName':playListName}
			newAlarmTaskAction.actionVeriables = json.dumps(actionVeriables, sort_keys=False, separators=(',',':'))
		elif request.POST.get('actiontasktype', '') == "Set Lights":
			lightId = request.POST.get('lightid', '')
			setType = request.POST.get('settype', '').replace("/", "")
			onOffStateToSet = request.POST.get('setlightonoff', '')
			rToSet = request.POST.get('setlightrvalue', '')
			gToSet = request.POST.get('setlightgvalue', '')
			bToSet = request.POST.get('setlightbvalue', '')
			setLightScroll = request.POST.get('setlightscroll', '').replace(" ", "_")
			setLightScene = request.POST.get('setlightscene', '').replace(" ", "_")
			actionVeriables = {'lightId':lightId, 'setType':setType, 'state':onOffStateToSet, 'r':rToSet, 'g':gToSet, 'b':bToSet, 'scrollMode':setLightScroll, 'scene':setLightScene}
			newAlarmTaskAction.actionVeriables = json.dumps(actionVeriables, sort_keys=False, separators=(',',':'))
		newAlarmTaskAction.save()
		
		
		
		
		
		
		
		
		
		
		
		
		
