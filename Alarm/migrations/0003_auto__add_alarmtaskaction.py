# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'AlarmTaskAction'
        db.create_table(u'AlarmTaskActions', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.TextField')(default='')),
            ('actionType', self.gf('django.db.models.fields.TextField')(default='')),
            ('actionVeriables', self.gf('django.db.models.fields.TextField')(default='')),
            ('syncAsyncRunType', self.gf('django.db.models.fields.TextField')(default='')),
        ))
        db.send_create_signal(u'Alarm', ['AlarmTaskAction'])


    def backwards(self, orm):
        # Deleting model 'AlarmTaskAction'
        db.delete_table(u'AlarmTaskActions')


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
        u'Alarm.alarmtaskaction': {
            'Meta': {'object_name': 'AlarmTaskAction', 'db_table': "u'AlarmTaskActions'"},
            'actionType': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'actionVeriables': ('django.db.models.fields.TextField', [], {'default': "''"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.TextField', [], {'default': "''"}),
            'syncAsyncRunType': ('django.db.models.fields.TextField', [], {'default': "''"})
        },
        u'Alarm.alarmtasks': {
            'Meta': {'object_name': 'AlarmTasks', 'db_table': "u'AlarmTasks'"},
            'actions': ('django.db.models.fields.TextField', [], {'default': "''"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.TextField', [], {'default': "''"})
        }
    }

    complete_apps = ['Alarm']