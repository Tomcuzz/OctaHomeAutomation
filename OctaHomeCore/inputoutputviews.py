from OctaHomeCore.menumodels import *
from Settings.settingviews import *

class EventsSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 20
	DisplayName = "Events"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'Events'})

class ActionGroupsSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 30
	DisplayName = "Action Groups"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'ActionGroups'})

class AGConditionsSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 40
	DisplayName = "Action Group Conditions"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'AGConditions'})

class ActionsSettingsNavBarItem(SettingsSideNavBarItem):
	Priority = 50
	DisplayName = "Actions"
	
	@property
	def Link(self):
		return reverse('SettingsPage', kwargs={'page':'Actions'})



class ActionGroupsSettingsPage(SettingsPage):
	Name = "ActionGroups"
	ViewPartial = "OctaHomeCore/Settings/ActionGroups"
	def getViewParameters(self):
		return {'actionGroups':ActionGroup.objects.all()}

class AGConditionsSettingsPage(SettingsPage):
	Name = "AGConditions"
	ViewPartial = "OctaHomeCore/Settings/AGConditions"
	def getViewParameters(self):
		return {'aGConditions':AGCondition.objects.all()}


class EventsSettingsPage(SettingsPage):
	Name = "Events"
	ViewPartial = "OctaHomeCore/Settings/TriggerEvents"
	def getViewParameters(self):
		return {'events':TriggerEvent.objects.all()}

class ActionsSettingsPage(SettingsPage):
	Name = "Actions"
	ViewPartial = "OctaHomeCore/Settings/Actions"
	def getViewParameters(self):
		return {'actions':Action.objects.all()}


class AddEventSettingsPage(SettingsPage):
	Name = "AddEvent"
	ViewPartial = "OctaHomeCore/Settings/AddTriggerEvent"
	def getViewParameters(self):
		return {'actiongroups': ActionGroup.objects.all()}

class AddAGConditionSettingsPage(SettingsPage):
	Name = "AddAGCondition"
	ViewPartial = "OctaHomeCore/Settings/AddAGCondition"
	def getViewParameters(self):
		return {'actiongroups':ActionGroup.objects.all()}

class AddActionSettingsPage(SettingsPage):
	Name = "AddAction"
	ViewPartial = "OctaHomeCore/Settings/AddAction"
	def getViewParameters(self):
		return {'types':getAllSubClasses(Action)}

class AddActionGroupGroupSettingsPage(SettingsPage):
	Name = "AddActionGroup"
	ViewPartial = ""
	def getViewParameters(self):
		return {'triggerEvents': TriggerEvent.objects.all(), 'aGConditions':AGCondition.objects.all(), 'actions':Action.objects.all()}



class AddActionGroupCompleteSettingsCommand(SettingsCommand):
	Name = "addActionGroupComplete"
	def RunCommand(self):
		if self.ViewHandler.Post.has_key('name') and self.ViewHandler.Post.has_key('triggerEvents') and self.ViewHandler.Post.has_key('aGConditions') and self.ViewHandler.Post.has_key('actions'):
			name = self.ViewHandler.Post['name']
			triggerEventsIds = self.ViewHandler.Post['triggerEvents']
			aGConditionsIds = self.ViewHandler.Post['aGConditions']
			actionsIds = self.ViewHandler.Post['actions']
			NewActionGroup = ActionGroup.objects.create(Name=name)
			
			for triggerEventId in triggerEventsIds.split(','):
				triggerEvent = TriggerEvent.objects.get(pk=triggerEventId)
				if triggerEvent != None:
					NewActionGroup.TriggerEvents.add(triggerEvent)
			
			for actionGroupId in aGConditionsIds.split(','):
				actionGroup = AGCondition.objects.get(pk=actionGroupId)
				if actionGroup != None:
					NewActionGroup.AGCondition.add(actionGroup)
			
			for actionGroupId in actionsIds.split(','):
				actionGroup = Action.objects.get(pk=actionGroupId)
				if actionGroup != None:
					NewActionGroup.Actions.add(actionGroup)
			
			NewActionGroup.save()
			
			return self.ViewHandler.redirect(reverse('SettingsPage', kwargs={'page':'ActionGroups'}))
		else:
			return self.ViewHandler.handleUserError('Not All Values Given')

class AddActionGroupConditionCompleteSettingsCommand(SettingsCommand):
	Name = "addActionGroupConditionComplete"
	def RunCommand(self):
		if self.ViewHandler.Post.has_key('name'):
			name = self.ViewHandler.Post['name']
			AGCondition.objects.create(Name=name)
			
			return self.ViewHandler.redirect(reverse('SettingsPage', kwargs={'page':'AGConditions'}))
		else:
			return self.ViewHandler.handleUserError('Not All Values Given')

class AddActionCompleteSettingsCommand(SettingsCommand):
	Name = "addActionComplete"
	def RunCommand(self):
		if self.ViewHandler.Post.has_key('name'):
			name = self.ViewHandler.Post['name']
			Action.objects.create(Name=name)
			
			return self.ViewHandler.redirect(reverse('SettingsPage', kwargs={'page':'Actions'}))
		else:
			return self.ViewHandler.handleUserError('Not All Values Given')