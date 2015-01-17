from baseviews import *
from devicemodels import *

class handleSingleDeviceCommand(commandRequestHandler):
	def runCommand(self):
		if self.Kwarguments.has_key('deviceType') and self.Kwarguments.has_key('deviceId'):
			device = Device.getDevice(self.Kwarguments['deviceType'], self.Kwarguments['deviceId'])
			if device != None:
				if self.Command in device.listActions():
					result = device.handleAction(self.Command, self.AllRequestParams)
					if isinstance(result, dict) or isinstance(result, list):
						return self.returnJSONResult(result)
					elif isinstance(result, str):
						return self.returnResult(result)
					elif result == True:
						return self.returnOk()
					elif result != False and result != None:
						return self.returnJSONResult(result)
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


class handleAddDeviceCommand(commandRequestHandler):
	def commandNeeded(self):
		return False
	
	def runCommand(self):
		if self.Post.has_key('devicetype'):
			newDevice = Device.createDevice(self.Post['devicetype'], self.Post)
			if newDevice != None:
				newDevice.save()
				if self.Post.has_key('next'):
					return self.redirect(self.Post['next'])
				else:
					return self.returnOk()
			else:
				return self.handleUserError('Error In Creation')
		else:
			return self.handleUserError('Type Not Given')