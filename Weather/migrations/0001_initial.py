# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Weather'
        db.create_table(u'Weather', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('Postcode', self.gf('django.db.models.fields.TextField')()),
            ('LoadDate', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
            ('WeatherString', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal(u'Weather', ['Weather'])


    def backwards(self, orm):
        # Deleting model 'Weather'
        db.delete_table(u'Weather')


    models = {
        u'Weather.weather': {
            'LoadDate': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'Meta': {'object_name': 'Weather', 'db_table': "u'Weather'"},
            'Postcode': ('django.db.models.fields.TextField', [], {}),
            'WeatherString': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        }
    }

    complete_apps = ['Weather']