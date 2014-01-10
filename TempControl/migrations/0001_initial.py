# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'TempControl'
        db.create_table(u'TempControl', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('Name', self.gf('django.db.models.fields.TextField')()),
            ('Room', self.gf('django.db.models.fields.TextField')()),
            ('IpAddress', self.gf('django.db.models.fields.TextField')()),
            ('Type', self.gf('django.db.models.fields.TextField')()),
            ('Speed', self.gf('django.db.models.fields.TextField')()),
            ('TwistState', self.gf('django.db.models.fields.TextField')()),
            ('AutoState', self.gf('django.db.models.fields.TextField')()),
        ))
        db.send_create_signal(u'TempControl', ['TempControl'])


    def backwards(self, orm):
        # Deleting model 'TempControl'
        db.delete_table(u'TempControl')


    models = {
        u'TempControl.tempcontrol': {
            'AutoState': ('django.db.models.fields.TextField', [], {}),
            'IpAddress': ('django.db.models.fields.TextField', [], {}),
            'Meta': {'object_name': 'TempControl', 'db_table': "u'TempControl'"},
            'Name': ('django.db.models.fields.TextField', [], {}),
            'Room': ('django.db.models.fields.TextField', [], {}),
            'Speed': ('django.db.models.fields.TextField', [], {}),
            'TwistState': ('django.db.models.fields.TextField', [], {}),
            'Type': ('django.db.models.fields.TextField', [], {}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'})
        }
    }

    complete_apps = ['TempControl']