#!/bin/sh

apt-get install nginx mysql-server python python-pip python-mysqldb

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

cp HomeAutomationNginxConfig.txt /etc/nginx/sites-enabled/homeautomation

cp InitScript.txt /etc/init.d/homeautomation
chmod +x /etc/init.d/homeautomation

cp ../HomeAutomation/settings.py.dist ../HomeAutomation/settings.py



database = ''
host = ''
user = ''
password = ''
port = ''      

while true; do
	read -p "Database Name:" database
	read -p "Database Host:" host
	read -p "Database User:" user
	read -p "Database Password:" password
	read -p "Database Port:" port
    read -p "Are these details correct?" yn
    case $yn in
        [Yy]* ) break;;
    esac
done

if [ "$database" = "" ]; then
	$database = "HomeControl"
fi
if [ "$host" = "" ]; then
	$host = "127.0.0.1"
fi
if [ "$user" = "" ]; then
	$user = "root"
fi
if [ "$password" = "" ]; then
	$password = "password"
fi

sed -i 's/###DB_DATABASE##(\'HomeControl\')###/$database/' ../HomeAutomation/settings.py
sed -i 's/###DB_HOST##(\'127.0.0.1\')###/$host/' ../HomeAutomation/settings.py
sed -i 's/###DB_USER##(\'root\')###/$user/' ../HomeAutomation/settings.py
sed -i 's/###DB_PASSWORD##(\'password\')###/$password/' ../HomeAutomation/settings.py
sed -i 's/###DB_PORT##(\'\')###/$port/' ../HomeAutomation/settings.py

cd ..

python manage.py ServerSetup