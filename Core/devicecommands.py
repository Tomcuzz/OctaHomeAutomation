from baseviews import *
from devicemodels import *

class handleSingleDeviceCommand(commandRequestHandler):
	def runCommand(self):
		if self.Kwarguments.has_key('deviceType') and self.Kwarguments.has_key('deviceId'):
			device = Device.getDevice(self.Kwarguments['deviceType'], self.Kwarguments['deviceId'])
			if device != None:
				if device.handleAction(self.Command, self.AllRequestParams):
					return self.returnOk()
				else:
					return self.handleUserError('Command Error')
			else:
				return self.handleUserError('Device Not Found')
		else:
			return self.handleUserError('Device Not Specified')

class handleMultiDeviceCommand(commandRequestHandler):
	def runCommand(self):
		return self.handleUserError('Not Yet Implemented')