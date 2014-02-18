from django.db import models

class Rooms(models.Model):
	Name = models.TextField()
	
	class Meta:
		db_table = u'Rooms'