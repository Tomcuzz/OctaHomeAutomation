from celery.task import task
from Alarm.models import *
from Weather.views import *
from Lights.models import *
import json
import time
import datetime
from dateutil.relativedelta import *
from subprocess import call
from SharedFunctions.deviceControl import *


@task
def triggerAlarm(alarmId):
	newAlarm = None
	try:
		newAlarm = Alarms.objects.get(id=int(alarmId))
	except Alarms.DoesNotExist:
		newAlarm = None
	if newAlarm is not None:
		if newAlarm.state == "Enabled":
			performActions(newAlarm.task.actions)
			
			if newAlarm.recurrence == "Single Occurance":
				newAlarm.delete()
			elif newAlarm.recurrence.startswith("Once"):
				dateArray = newAlarm.date.split("/")
				timeArray = newAlarm.time.split(":")
				
				hour = timeArray[0]
				mins = timeArray[1]
				amPm = timeArray[2]
				
				if hour == "12":
					hour = "0";
				
				if amPm == "AM":
					hour = hour
				else:
					hour = str(int(hour)+12)
				
				tempDate = datetime.datetime(int(dateArray[2]), int(dateArray[1]), int(dateArray[0]), int(hour), int(mins))
				
				if newAlarm.recurrence == "Once A Hour":
					tempDate = tempDate + datetime.timedelta(hours=1)
				elif newAlarm.recurrence == "Once A Day":
					tempDate = tempDate + datetime.timedelta(days=1)
				elif newAlarm.recurrence == "Once A Week":
					tempDate = tempDate + datetime.timedelta(days=7)
				elif newAlarm.recurrence == "Once A Month":
					tempDate = tempDate + relativedelta(months=1)
				
				celeryRunningTask = triggerAlarm.apply_async(args=[str(newAlarm.id)], kwargs={}, eta=tempDate)
				newAlarm.celeryTaskId = celeryRunningTask.id
				newTime = tempDate.strftime(' %I:%M:%p').replace(" 0", "").replace(" ", "")
				newDate = tempDate.strftime('%d/%m/%Y')
				newAlarm.time = newTime
				newAlarm.date = newDate
				
				newAlarm.save()
			else:
				newAlarm.delete()
		
def performActions(actions, runType="celery"):
	taskNames = json.loads(actions)
	for aTaskName in taskNames:
		try:
			aTask = TaskAction.objects.get(name=aTaskName)
			taskAction = json.loads(aTask.actionVeriables)
			if aTask.actionType == "Play_Speach":
				ipAddress = taskAction['targetIpAddress']
				speach = taskAction['speachScript']
				location = taskAction['location']
				alarmActions().makeDevicePlaySpeach(ipAddress=ipAddress, speach=speach, location=location)
			elif aTask.actionType == "Play_Music":
				ipAddress = taskAction['targetIpAddress']
				targetPort = taskAction['targetPort']
				playlist = taskAction['playListName']
				alarmActions().makeDevicePlayMusicPlayList(ipAddress, targetPort, playlist)
			elif aTask.actionType == "Set_Lights":
				lightId = taskAction['lightId']
				setType = taskAction['setType']
				state = taskAction['state']
				r = taskAction['r']
				g = taskAction['g']
				b = taskAction['b']
				scrollMode = taskAction['scrollMode']
				scene = taskAction['scene']
				alarmActions().setLightToState(lightId=lightId, setType=setType, state=state, r=r, g=g, b=b, scrollMode=scrollMode, scene=scene, runType=runType)
		except AlarmTaskAction.DoesNotExist:
			aTask = None
	
	
	

class alarmActions():
	def makeDevicePlaySpeach(self, ipAddress="NS", speach="NS", location=""):
		speach = speach.replace("_", " ")
		if "/%w" in speach:
			if location != "":
				currentTempString = getFeelsLikeTemp(location) + " " + getTempUnits(location)
				
				todaysMinForcastedTempString = getTempMin(location) + " " + getTempUnits(location)
				todaysMaxForcastedTempString = getTempMax(location) + " " + getTempUnits(location)
				
				tomorrowsMinForcastedTempString = getTempMin(location, 1) + " " + getTempUnits(location)
				tomorrowsMaxForcastedTempString = getTempMax(location, 1) + " " + getTempUnits(location)
				
				currentTextWeather = getWeatherTypeText(location)
				
				todaysForcastedTextWeather = getWeatherTypeText(location)
				tomorrowsForcastedTextWeather = getWeatherTypeText(location, 1)
				
				speach = speach.replace("/%wct%/", currentTempString)
				speach = speach.replace("/%wtt%/", todaysMinForcastedTempString)
				speach = speach.replace("/%wtT%/", todaysMaxForcastedTempString)
				speach = speach.replace("/%wTt%/", tomorrowsMinForcastedTempString)
				speach = speach.replace("/%wTT%/", tomorrowsMaxForcastedTempString)
				speach = speach.replace("/%wcw%/", currentTextWeather)
				speach = speach.replace("/%wtw%/", todaysForcastedTextWeather)
				speach = speach.replace("/%wTw%/", tomorrowsForcastedTextWeather)
			else:
				speach = speach.replace("/%wct%/", "currently not avalable")
				speach = speach.replace("/%wtt%/", "currently not avalable")
				speach = speach.replace("/%wtT%/", "currently not avalable")
				speach = speach.replace("/%wTt%/", "currently not avalable")
				speach = speach.replace("/%wTT%/", "currently not avalable")
				speach = speach.replace("/%wcw%/", "currently not avalable")
				speach = speach.replace("/%wtw%/", "currently not avalable")
				speach = speach.replace("/%wTw%/", "currently not avalable")
		
		if "/%d" in speach:
			speach = speach.replace("/%dd%/", time.strftime("%d"))
			speach = speach.replace("/%dD%/", time.strftime("%a"))
			speach = speach.replace("/%dm%/", time.strftime("%m"))
			speach = speach.replace("/%dM%/", time.strftime("%B"))
			speach = speach.replace("/%dy%/", time.strftime("%Y"))
		
		if "/%t" in speach:
			speach = speach.replace("/%th%/", time.strftime("%I"))
			speach = speach.replace("/%tm%/", time.strftime("%M"))
			speach = speach.replace("/%ts%/", time.strftime("%S"))
			speach = speach.replace("/%ta%/", time.strftime("%p"))
		
		message = "say " + speach
		
		CommunicationControl().sendTCPMessage(ipAddress, 5005, message)
	
	def makeDevicePlayMusicPlayList(self, ipAddress="NS", targetPort="5005", playlist="NS"):
		playlist = playlist.replace("_", " ")
		message = "command playplaylist " + playlist
		CommunicationControl().sendTCPMessage(ipAddress, int(targetPort), message)
	
	def setLightToState(self, lightId="NS", setType="NS", state="NS", r="NS", g="NS", b="NS", scrollMode="NS", scene="NS", runType="celery"): #NS Stands For Not Set
		theLight = Lights.objects.get(id=lightId)
		if setType == "OnOff":
			if theLight.LightType == "RGBLight":
				if state == "Toggle":
					if theLight.LightState == "Off":
						DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, 0, 0, 0, theLight.R, theLight.G, theLight.B, runType)
						theLight.LightState = "On"
					else:
						DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B, 0, 0, 0, runType)
						theLight.LightState = "Off"
				elif state == "On":
					DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, 0, 0, 0, theLight.R, theLight.G, theLight.B, runType)
					theLight.LightState = "On"
				else:
					DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B, 0, 0, 0, runType)
					theLight.LightState = "Off"
			else:
				if state == "Toggle":
					if theLight.LightState == "Off":
						DeviceControl().setOnOffDeviceState(theLight.IpAddress, theLight.DeviceType, True)
						theLight.LightState = "On"
					else:
						DeviceControl().setOnOffDeviceState(theLight.IpAddress, theLight.DeviceType, False)
						theLight.LightState = "Off"
				elif state == "On":
					DeviceControl().setOnOffDeviceState(theLight.IpAddress, theLight.DeviceType, True)
					theLight.LightState = "On"
				else:
					DeviceControl().setOnOffDeviceState(theLight.IpAddress, theLight.DeviceType, False)
					theLight.LightState = "Off"
		elif setType == "RGB":
			if theLight.LightType == "RGBLight":
				DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B, r, g, b, runType)
				theLight.R = str(r)
				theLight.G = str(g)
				theLight.B = str(b)
		elif setType == "Scroll":
			test = "TO BE IMPLEMENTED"
		elif setType == "Scene":
			test = "TO BE IMPLEMENTED"
		theLight.save()
