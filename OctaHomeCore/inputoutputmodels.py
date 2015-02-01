from django.db import models
from polymorphic import PolymorphicModel
from OctaHomeCore.devicemodels import *
import json

################
# Input/Output #
################
class TriggerEvent(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	ActionGroups = models.ManyToManyField('ActionGroup', related_name="TriggerEvents")
	
	##################
	# Object Methods #
	##################
	def call(self):
		for actionGroup in self.ActionGroups:
			actionGroup.run()
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'TriggerEvents'


class ActionGroup(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	AGCondition = models.ManyToManyField('AGCondition', related_name="ActionGroups")
	Actions = models.ManyToManyField('Action', related_name="ActionGroups")
	
	##################
	# Object Methods #
	##################
	def checkAllConditions(self):
		for condition in self.AGCondition:
			if condition.checkConditions() == False:
				return False
		
		return True
	
	def run(self, currentRunType = False):
		if self.checkAllConditions():
			self.unconditionalRun(currentRunType)
	
	def unconditionalRun(self, currentRunType = False):
		for action in self.Actions:
			action.run(currentRunType)
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'ActionGroup'


class AGCondition(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	
	######################
	# Display Parameters #
	######################
	ViewPartial = ''
	
	@property
	def JsPartials(self):
		return ['']
	
	##################
	# Object Methods #
	##################
	def checkCondition(self): #Return True if the check passes and the action should run
		return True
	
	########
	# Meta #
	########
	class Meta:
		db_table = 'AGCondition'


class DeviceOnOffAGCondition(AGCondition):
	##############
	# Parameters #
	##############
	PassTarget = models.BooleanField(default=False)
	CheckDevices = models.ManyToManyField('Device')
	
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
		db_table = 'DeviceOnOffAGCondition'

class Action(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	Parameters = models.TextField()
	RunIsAsync = models.BooleanField(default=False)
	
	######################
	# Display Parameters #
	######################
	@classmethod
	def getTypeName(cls):
		return "Base Action"
	
	ViewPartial = ''
	@property
	def JsPartials(self):
		return ['']
	@property
	def AdditionPartials(self):
		return []
	
	UserCreatable = False
	
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
	def setUp(self, kwargs={}):
		if kwargs.has_key('Name'):
			self.Name = kwargs['Name']
	
	def run(self, currentRunType = False):
		if self.RunIsAsync == False or self.RunIsAsync == currentRunType:
			self.runSynchronously()
		else:
			self.runAsynchronously()
	
	def runSynchronously(self):
		pass
	
	def runAsynchronously(self):
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
	Devices = models.ManyToManyField('Device')
	
	######################
	# Display Parameters #
	######################
	@classmethod
	def getTypeName(cls):
		return "Device Action"
	
	UserCreatable = False
	
	##################
	# Object Methods #
	##################
	def setUp(self, kwargs={}):
		super(self, DeviceAction).setUp()
		if kwargs.has_key('deviceIds'):
			for deviceId in kwargs['Name'].split(','):
				device = Device.objects.get(pk=deviceId)
				if device != None:
					self.Devices.add(device)
		
	
	def runSynchronously(self):
		for device in self.Devices:
			functionName = self.getParameters()[device.Name]['name']
			functionParameters = self.getParameters()[device.Name]['parameters']
			if functionName != '':
				device.handleAction(functionName, functionParameters)
	
	def runAsynchronously(self):
		raise Exception('ASYNC NOT IMPLEMENTED')
	
	########
	# Meta #
	########
	class Meta:
		db_table = u'DeviceActions'