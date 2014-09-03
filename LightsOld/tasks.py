from celery.task import task
from time import sleep
from threading import Thread
from models import *
from SharedFunctions.deviceControl import *
from random import randint

@task
def runScrollMode(scrollName):
	modeItem = ScrollModes.objects.get(Name=scrollName)
	lastValue = int(-1)
	while Lights.objects.filter(Scroll=scrollName).count():
		rValues = modeItem.RValues.split(',')
		gValues = modeItem.GValues.split(',')
		bValues = modeItem.BValues.split(',')
		
		randomNum = randint(0, int(len(rValues) - 1))
		while randomNum==lastValue:
			if int(len(rValues)) < 2:
				break
			randomNum = randint(0, int(len(rValues) - 1))
		
		lastValue = randomNum
		
		rDestination = int(rValues[randomNum])
		gDestination = int(gValues[randomNum])
		bDestination = int(bValues[randomNum])
		
		deviceControlObject = DeviceControl()
		
		for theLight in Lights.objects.filter(Scroll=scrollName):
			deviceControlObject.setDeviceRGBState(theLight.IpAddress, theLight.DeviceType, rDestination, gDestination, bDestination, modeItem.Speed)
			theLight.R = rDestination
			theLight.G = gDestination
			theLight.B = bDestination
			theLight.save()
		time.sleep(modeItem.Speed)
		if Lights.objects.filter(Scroll=scrollName).count() < 1:
			break