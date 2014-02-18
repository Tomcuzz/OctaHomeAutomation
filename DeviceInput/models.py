from django.db import models

class ScrollModes(models.Model):
	Name = models.TextField()
	Room = models.ForeignKey('SharedFunctions.Rooms', blank=True, null=True, on_delete=models.SET_NULL)
	ButonOneAction = models.TextField()
	ButonTwoAction = models.TextField()
	
	class Meta:
		db_table = u'ButtonInput'