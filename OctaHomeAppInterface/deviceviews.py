from OctaHomeCore.baseviews import *
from OctaHomeCore.devicemodels import *
import json

class handleAppCommandCommand(commandRequestHandler):
	def runCommand(self):
		if self.Command == 'GetDevices':
			deviceObjects = Device.objects.all()
			returnDevices = []
			for deviceObject in deviceObjects:
				returnDevices.append(deviceObject.getState())
			return self.returnJSONResult(returnDevices)
		else:
			return self.returnJSONResult({ 'status':'error', 'error':'CommandNotFound' })