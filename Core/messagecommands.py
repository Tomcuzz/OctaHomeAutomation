from baseviews import *
from messagemodels import *
import django.core.serializers

class handleMessageCommand(commandRequestHandler):
	def runCommand(self):
		if   self.Command == "AllNewNotifications":
			return self.returnJSONResult(list(NotificationMessage.objects.filter(Dismissed=False)))
		elif self.Command == "AllNotifications":
			return self.returnJSONResult(list(NotificationMessage.objects.all()))
		elif self.Command == "AllNewWarning":
			return self.returnJSONResult(list(WarningMessage.objects.filter(Dismissed=False)))
		elif self.Command == "AllWarning":
			return self.returnJSONResult(list(WarningMessage.objects.all()))
		
		elif self.Command == "DismissNotification":
			if self.Kwarguments.has_key('value'):
				notification = NotificationMessage.objects.get(pk=self.Kwarguments['value'])
				if notification != None:
					notification.Dismissed = True
					notification.save()
				else:
					return self.handleUserError('Notification Not Found')
			else:
				return self.handleUserError('Notification Not Given')
		
		elif self.Command == "DismissWarning":
			if self.Kwarguments.has_key('value'):
				warning = WarningMessage.objects.get(pk=self.Kwarguments['value'])
				if warning != None:
					warning.Dismissed = True
					warning.save()
				else:
					return self.handleUserError('Warning Not Found')
			else:
				return self.handleUserError('Warning Not Given')
		else:
			raise Http404
