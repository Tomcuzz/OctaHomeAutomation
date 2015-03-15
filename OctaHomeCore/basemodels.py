from django.db import models
from polymorphic import PolymorphicModel

class OctaBaseModel(PolymorphicModel):
	##############
	# Parameters #
	##############
	Name = models.CharField(max_length=30)
	
	########
	# Meta #
	########
	class Meta:
		abstract = True


class OctaSubclassableModel(OctaBaseModel):
	######################
	# Display Parameters #
	######################
	@classmethod
	def getTypeDisplayName(cls):
		return "Base"
	
	ViewPartial = ''
	@property
	def JsPartials(self):
		return ['']
	@property
	def AdditionPartials(self):
		return []
	
	UserCreatable = False
	
	##################
	# Object Methods #
	##################
	def setUp(self, kwargs={}):
		if kwargs.has_key('Name'):
			self.Name = kwargs['Name']
	
	########
	# Meta #
	########
	class Meta:
		abstract = True
