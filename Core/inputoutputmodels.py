from django.db import models
import json

################
# Input/Output #
################
class Action(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Parameters = models.TextField()
	RunIsAsync = models.BooleanField(default=False)
	
	##################
	# Object Methods #
	##################
	def getParameters(self):
		return json.loads(self.parameters)
	
	def setParameters(self, array):
		self.parameters = json.dumps(array)
	
	def run(currentRunType = False):
		if self.RunIsAsync == False or self.RunIsAsync == currentRunType:
			for device in self.Devices:
				functionName = self.getParameters()[device.Name]['name']
				functionParameters = self.getParameters()[device.Name]['parameters']
				if functionName != '':
					device.handleAction(functionName, functionParameters)
		else:
			raise Exception('ASYNC NOT IMPLEMENTED')
	
	#################
	# Class Methods #
	#################
	@property
	def Devices(self):
		devices = []
		
		for deviceClass in getNonAbstractSubClasses(Device):
			devices.extend(deviceClass.objects.filter(Actions__in=[self]))
		
		return devices
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'Actions'


class TriggerEvent(models.Model):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Actions = models.ManyToManyField(Action, related_name="TriggerEvents")
	
	##################
	# Object Methods #
	##################
	def call():
		for action in self.Actions:
			action.run()
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'TriggerEvents'