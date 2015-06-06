from OctaHomeCore.OctaFiles.urls.base import *
from OctaHomeAlarm.views import *

class AlarmOctaUrls(OctaUrls):
	@classmethod
	def getUrls(cls):
		return [
		
			url(r'^Alarm/$', handleAlarmView.as_view(), name='Alarm'),
		]
