from django.db import models

class ScrollModes(models.Model):
	Name = models.TextField()
	Room = models.TextField()
	ButonOneAction = models.TextField()
	ButonTwoAction = models.TextField()
	
	class Meta:
		db_table = u'ButtonInput'