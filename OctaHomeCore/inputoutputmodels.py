from django.db import models
from polymorphic import PolymorphicModel
import json

################
# Input/Output #
################
class TriggerEvent(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Actions = models.ManyToManyField('Action', related_name="TriggerEvents")
	
	##################
	# Object Methods #
	##################
	def call(self):
		for action in self.Actions:
			action.run()
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'TriggerEvents'


class ActionCondition(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Actions = models.ManyToManyField('Action', blank=True, null=True, related_name="%(app_label)s_%(class)s_ActionConditions")
	
	##################
	# Object Methods #
	##################
	def checkCondition(self): #Return True if the check passes and the action should run
		return True
	
	########
	# Meta #
	########
	class Meta:
		abstract = True


class DeviceOnOffActionCondition(ActionCondition):
	##############
	# Parameters #
	##############
	PassTarget = models.BooleanField(default=False)
	CheckDevices = models.ManyToManyField('Device', blank=True, null=True, related_name="%(app_label)s_%(class)s_OnOffActionConditions")
	
	##################
	# Object Methods #
	##################
	def checkCondition(self):
		for device in CheckDevices:
			if device.IsOn != PassTarget:
				return False
		return True			
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'DeviceOnOffActionCondition'

class Action(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Parameters = models.TextField()
	RunIsAsync = models.BooleanField(default=False)
	
	##############################
	# Parameters Getters/Setters #
	##############################
	def getParameters(self):
		return json.loads(self.parameters)
	def setParameters(self, array):
		self.parameters = json.dumps(array)
	
	##################
	# Object Methods #
	##################
	def checkAllConditions(self):
		conditions = []
		for actionConditionClass in getNonAbstractSubClasses(ActionCondition):
			conditions.extend(actionConditionClass.objects.filter(Actions=self))
		
		for condition in conditions:
			if condition.checkConditions() == False:
				return False
		
		return True
	
	def run(self, currentRunType = False):
		if self.checkAllConditions():
			self.unconditionalRun(currentRunType)
	
	def unconditionalRun(self, currentRunType = False):
		pass
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'Action'



class DeviceAction(Action):
	##############
	# Parameters #
	##############
	@property
	def Devices(self):
		devices = []
		
		for deviceClass in getNonAbstractSubClasses(Device):
			devices.extend(deviceClass.objects.filter(Actions__in=[self]))
		
		return devices
	
	##################
	# Object Methods #
	##################
	def unconditionalRun(self, currentRunType = False):
		if self.RunIsAsync == False or self.RunIsAsync == currentRunType:
			for device in self.Devices:
				functionName = self.getParameters()[device.Name]['name']
				functionParameters = self.getParameters()[device.Name]['parameters']
				if functionName != '':
					device.handleAction(functionName, functionParameters)
		else:
			raise Exception('ASYNC NOT IMPLEMENTED')
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'DeviceActions'