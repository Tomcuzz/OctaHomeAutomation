from baseviews import *
from devicemodels import *
import json

class handleSingleDeviceCommand(commandRequestHandler):
	def runCommand(self):
		if self.Kwarguments.has_key('deviceType') and self.Kwarguments.has_key('deviceId'):
			device = Device.getDevice(self.Kwarguments['deviceType'], self.Kwarguments['deviceId'])
			if device != None:
				if self.Command in device.listActions():
					result = device.handleAction(self.Command, self.AllRequestParams)
					if isinstance(result, dict) or isinstance(result, list):
						return self.returnResult(json.dumps(result))
					elif isinstance(result, str):
						return self.returnResult(result)
					elif result == True:
						return self.returnOk()
					elif result != False and result != None:
						return self.returnResult(json.dumps(result))
					else:
						return self.handleUserError('Command Error')
				else:
					return self.handleUserError('Command Not Found')
			else:
				return self.handleUserError('Device Not Found')
		else:
			return self.handleUserError('Device Not Specified')

class handleMultiDeviceCommand(commandRequestHandler):
	def runCommand(self):
		return self.handleUserError('Not Yet Implemented')