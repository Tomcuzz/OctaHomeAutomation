from OctaHomeCore.views import *
from OctaHomeCore.models import *
import django.core.serializers
import datetime
from django.utils import timezone

class handleMessageCommand(commandRequestHandler):
	def runCommand(self):
		if   self.Command == "AllNewNotifications":
			return self.returnJSONResult(list(NotificationMessage.objects.filter(Dismissed=False)))
		elif self.Command == "AllNotifications":
			return self.returnJSONResult(list(NotificationMessage.objects.all()))
		elif self.Command == "AllNewWarnings":
			return self.returnJSONResult(list(WarningMessage.objects.filter(Dismissed=False)))
		elif self.Command == "AllWarnings":
			return self.returnJSONResult(list(WarningMessage.objects.all()))
		elif self.Command == "AllNewErrors":
			return self.returnJSONResult(list(ErrorMessage.objects.filter(Dismissed=False)))
		elif self.Command == "AllErrors":
			return self.returnJSONResult(list(ErrorMessage.objects.all()))
		elif self.Command == "LastHourLogs":
			dateHourAgo = timezone.now() - datetime.timedelta(hours = 1)
			return self.returnJSONResult(list(LogItem.objects.filter(Date__gte=dateHourAgo)))
		elif self.Command == "AllLogs":
			return self.returnJSONResult(list(LogItem.objects.all()))
		
		elif self.Command == "DismissNotification":
			if self.AllRequestParams.has_key('value'):
				notification = NotificationMessage.objects.get(pk=self.AllRequestParams['value'])
				if notification != None:
					notification.Dismissed = True
					notification.save()
					return self.returnOk()
				else:
					return self.handleUserError('Notification Not Found')
			else:
				return self.handleUserError('Notification Not Given')
		
		elif self.Command == "DismissWarning":
			if self.AllRequestParams.has_key('value'):
				warning = WarningMessage.objects.get(pk=self.AllRequestParams['value'])
				if warning != None:
					warning.Dismissed = True
					warning.save()
					return self.returnOk()
				else:
					return self.handleUserError('Warning Not Found')
			else:
				return self.handleUserError('Warning Not Given')
		
		elif self.Command == "DismissError":
			if self.AllRequestParams.has_key('value'):
				error = ErrorMessage.objects.get(pk=self.AllRequestParams['value'])
				if error != None:
					error.Dismissed = True
					error.save()
					return self.returnOk()
				else:
					return self.handleUserError('Warning Not Found')
			else:
				return self.handleUserError('Warning Not Given')
		else:
			raise Http404
