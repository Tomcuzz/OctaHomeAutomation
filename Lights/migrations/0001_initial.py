# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Lights'
        db.create_table(u'Lights', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('LightName', self.gf('django.db.models.fields.TextField')()),
            ('RoomName', self.gf('django.db.models.fields.TextField')()),
            ('IpAddress', self.gf('django.db.models.fields.TextField')()),
            ('DeviceType', self.gf('django.db.models.fields.TextField')()),
            ('LightType', self.gf('django.db.models.fields.TextField')()),
            ('LightState', self.gf('django.db.models.fields.TextField')()),
            ('R', self.gf('django.db.models.fields.IntegerField')()),
            ('G', self.gf('django.db.models.fields.IntegerField')()),
            ('B', self.gf('django.db.models.fields.IntegerField')()),
            ('Scroll', self.gf('django.db.models.fields.TextField')()),
            ('BeingSetId', self.gf('django.db.models.fields.IntegerField')()),
        ))
        db.send_create_signal(u'Lights', ['Lights'])

        # Adding model 'ScrollModes'
        db.create_table(u'ScrollModes', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('Name', self.gf('django.db.models.fields.TextField')()),
            ('RValues', self.gf('django.db.models.fields.TextField')()),
            ('GValues', self.gf('django.db.models.fields.TextField')()),
            ('BValues', self.gf('django.db.models.fields.TextField')()),
            ('Speed', self.gf('django.db.models.fields.IntegerField')()),
            ('ChangeMode', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal(u'Lights', ['ScrollModes'])


    def backwards(self, orm):
        # Deleting model 'Lights'
        db.delete_table(u'Lights')

        # Deleting model 'ScrollModes'
        db.delete_table(u'ScrollModes')


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
            'RoomName': ('django.db.models.fields.TextField', [], {}),
            'Scroll': ('django.db.models.fields.TextField', [], {}),
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
        }
    }

    complete_apps = ['Lights']