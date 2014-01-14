from celery.task import task
from Alarm.models import *
from Weather.views import *
import json
import time
from subprocess import call


@task
def triggerAlarm(alarmId):
	newAlarm = None
	try:
		newAlarm = Alarms.objects.get(id=int(alarmId))
	except Alarms.DoesNotExist:
		newAlarm = None
	if newAlarm is not None:
		if newAlarm.state == "Enabled":
			name = str(newAlarm.task)
			name = name.replace(" ", "_")
			try:
				actionTask = AlarmTasks.objects.get(name=name)
				taskNames = json.loads(actionTask.actions)
			except actionTask.DoesNotExist:
				taskNames = []
			for aTaskName in taskNames:
				try:
					aTask = AlarmTaskAction.objects.get(name=aTaskName)
					taskAction = json.loads(aTask.actionVeriables)
					if aTask.actionType == "Play_Speach":
						ipAddress = taskAction['targetIpAddress']
						speach = taskAction['speachScript']
						postcode = taskAction['postcode']
						alarmActions().makeDevicePlaySpeach(ipAddress=ipAddress, speach=speach, postcode=postcode)
					elif aTask.actionType == "Play_Music_Playlist":
						ipAddress = taskAction['targetIpAddress']
						playlist = taskActionAction['playlist']
						alarmActions().makeDevicePlayMusicPlayList(ipAddress=ipAddress, playlist=playlist)
					elif aTask.actionType == "Set_Light":
						lightId = taskAction['lightId']
						setType = taskAction['setType']
						state = taskAction['state']
						r = taskAction['r']
						g = taskAction['g']
						b = taskAction['b']
						scrollMode = taskAction['scrollMode']
						scene = taskAction['scene']
						alarmActions().setLightToState(lightId=lightId, setType=setType, state=state, r=r, g=g, b=b, scrollMode=scrollMode, scene=scene)
				except AlarmTaskAction.DoesNotExist:
					aTask = None
			
			if newAlarm.recurrence == "Single Occurance":
				newAlarm.delete()
	

class alarmActions():
	def makeDevicePlaySpeach(self, ipAddress="NS", speach="NS", postcode=""):
		speach = speach.replace("_", " ")
		if "/%w" in speach:
			if postcode != "":
				currentTempString = getFeelsLikeTemp(postcode) + " " + getTempUnits(postcode)
				
				todaysMinForcastedTempString = getTempMin(postcode) + " " + getTempUnits(postcode)
				todaysMaxForcastedTempString = getTempMax(postcode) + " " + getTempUnits(postcode)
				
				tomorrowsMinForcastedTempString = getTempMin(postcode, 1) + " " + getTempUnits(postcode)
				tomorrowsMaxForcastedTempString = getTempMax(postcode, 1) + " " + getTempUnits(postcode)
				
				currentTextWeather = getWeatherTypeText(postcode)
				
				todaysForcastedTextWeather = getWeatherTypeText(postcode)
				tomorrowsForcastedTextWeather = getWeatherTypeText(postcode, 1)
				
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
		
		sayItem = "say " + speach
		
		return_code = call(sayItem, shell=True)
	
	def makeDevicePlayMusicPlayList(ipAddress="NS", playlist="NS"):
		test = "TO BE IMPLEMENTED"
	
	def setLightToState(lightId="NS", setType="NS", state="NS", r="NS", g="NS", b="NS", scrollMode="NS", scene="NS"): #NS Stands For Not Set
		theLight = Lights.objects.get(id=lightId)
		if setType == "OnOff":
			if theLight.LightType == "RGBLight":
				if state == "Toggle":
					if theLight.LightState == "Off":
						DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, 0, 0, 0, theLight.R, theLight.G, theLight.B)
						theLight.LightState = "On"
					else:
						DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B, 0, 0, 0)
						theLight.LightState = "Off"
				elif state == "On":
					DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, 0, 0, 0, theLight.R, theLight.G, theLight.B)
					theLight.LightState = "On"
				else:
					DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B, 0, 0, 0)
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
				DeviceControl().scrollDeviceRGBState(theLight.IpAddress, theLight.DeviceType, theLight.R, theLight.G, theLight.B, r, g, b)
				theLight.R = str(r)
				theLight.G = str(g)
				theLight.B = str(b)
		elif setType == "Scroll":
			test = "TO BE IMPLEMENTED"
		elif setType == "Scene":
			test = "TO BE IMPLEMENTED"
		theLight.save()
