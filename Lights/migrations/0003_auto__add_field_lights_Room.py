# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Lights.Room'
        db.add_column(u'Lights', 'Room',
                      self.gf('django.db.models.fields.related.ForeignKey')(to=orm['SharedFunctions.Rooms'], null=True, on_delete=models.SET_NULL, blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Lights.Room'
        db.delete_column(u'Lights', 'Room_id')


    models = {
        u'Lights.lights': {
            'B': ('django.db.models.fields.IntegerField', [], {}),
            'BeingSetId': ('django.db.models.fields.IntegerField', [], {}),
            'DeviceType': ('django.db.models.fields.TextField', [], {}),
            'G': ('django.db.models.fields.IntegerField', [], {}),
            'IpAddress': ('django.db.models.fields.TextField', [], {}),
            'LightName': ('django.db.models.fields.TextField', [], {}),
            'LightState': ('django.db.models.fields.TextField', [], {}),
            'LightType': ('django.db.models.fields.TextField', [], {}),
            'Meta': {'object_name': 'Lights', 'db_table': "u'Lights'"},
            'R': ('django.db.models.fields.IntegerField', [], {}),
            'Room': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['SharedFunctions.Rooms']", 'null': 'True', 'on_delete': 'models.SET_NULL', 'blank': 'True'}),
            'RoomName': ('django.db.models.fields.TextField', [], {}),
            'Scroll': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'Lights.lightscenes': {
            'BValue': ('django.db.models.fields.TextField', [], {}),
            'GValue': ('django.db.models.fields.TextField', [], {}),
            'Meta': {'object_name': 'LightScenes', 'db_table': "u'LightScenes'"},
            'Name': ('django.db.models.fields.TextField', [], {}),
            'RValue': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'Lights.scrollmodes': {
            'BValues': ('django.db.models.fields.TextField', [], {}),
            'ChangeMode': ('django.db.models.fields.TextField', [], {}),
            'GValues': ('django.db.models.fields.TextField', [], {}),
            'Meta': {'object_name': 'ScrollModes', 'db_table': "u'ScrollModes'"},
            'Name': ('django.db.models.fields.TextField', [], {}),
            'RValues': ('django.db.models.fields.TextField', [], {}),
            'Speed': ('django.db.models.fields.IntegerField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        },
        u'SharedFunctions.rooms': {
            'Meta': {'object_name': 'Rooms', 'db_table': "u'Rooms'"},
            'Name': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        }
    }

    complete_apps = ['Lights']