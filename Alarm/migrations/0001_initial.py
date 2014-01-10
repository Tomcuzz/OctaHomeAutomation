# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Alarms'
        db.create_table(u'Alarms', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('time', self.gf('django.db.models.fields.TextField')(default='')),
            ('date', self.gf('django.db.models.fields.TextField')(default='')),
            ('recurrence', self.gf('django.db.models.fields.TextField')(default='')),
            ('user', self.gf('django.db.models.fields.TextField')(default='')),
            ('task', self.gf('django.db.models.fields.TextField')(default='')),
            ('state', self.gf('django.db.models.fields.TextField')(default='')),
            ('celeryTaskId', self.gf('django.db.models.fields.TextField')(default='')),
        ))
        db.send_create_signal(u'Alarm', ['Alarms'])

        # Adding model 'AlarmTasks'
        db.create_table(u'AlarmTasks', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.TextField')(default='')),
            ('actions', self.gf('django.db.models.fields.TextField')(default='')),
        ))
        db.send_create_signal(u'Alarm', ['AlarmTasks'])


    def backwards(self, orm):
        # Deleting model 'Alarms'
        db.delete_table(u'Alarms')

        # Deleting model 'AlarmTasks'
        db.delete_table(u'AlarmTasks')


    models = {
        u'Alarm.alarms': {
            'Meta': {'object_name': 'Alarms', 'db_table': "u'Alarms'"},
            'celeryTaskId': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'date': ('django.db.models.fields.TextField', [], {'default': "''"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'recurrence': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'state': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'task': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'time': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'user': ('django.db.models.fields.TextField', [], {'default': "''"})
        },
        u'Alarm.alarmtasks': {
            'Meta': {'object_name': 'AlarmTasks', 'db_table': "u'AlarmTasks'"},
            'actions': ('django.db.models.fields.TextField', [], {'default': "''"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.TextField', [], {'default': "''"})
        }
    }

    complete_apps = ['Alarm']