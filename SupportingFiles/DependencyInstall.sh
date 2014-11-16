#!/bin/sh

apt-get install python-pip python-mysqldb

pip install Django
pip install django-celery
#easy_install django-celery
pip install python-dateutil

#Proxmoxer
pip install proxmoxer
pip install requests
pip install paramiko
#End Proxmoxer

pip install astral
pip install authy