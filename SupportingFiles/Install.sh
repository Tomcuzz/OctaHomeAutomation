#!/bin/sh

if [[ "$OSTYPE" == "darwin"* ]]; then
	red='\x1B[0;31m'
	NC='\x1B[0m'
else
	red='\e[0;31m'
	NC='\e[0m' # No Color
fi
while true; do
	read -p "-> What web server would you like to setup? [nginx/apache2/skip-webserver] " server
    case $server in
        nginx) break;;
        apache2) break;;
        skip-webserver) break;;
    esac
    echo -e "${red}Not recognised please enter one of the following: \"nginx\", \"apache2\", \"skip-webserver\"${NC}"
done

if [[ "$server" == "nginx" ]]; then
	apt-get install nginx mysql-server gcc python python-pip python-mysqldb
elif [[ "$server" == "apache2" ]]; then
	apt-get install apache2 libapache2-mod-proxy-html libxml2-dev mysql-server gcc python python-pip python-mysqldb
else
	apt-get install mysql-server gcc python python-pip python-mysqldb
fi

pip install Django
pip install django-celery
easy_install django-celery
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

database=""
host=""
user=""
password=""
port=""

while true; do
        read -p "Database Name:" database
        read -p "Database Host:" host
        read -p "Database User:" user
        read -p "Database Password:" password
        read -p "Database Port:" port
        read -p "Are these details correct? [y/n]" yn
        case $yn in
                [Yy]* ) break;;
        esac
done
if [ "$database" = "" ]; then
	database="HomeControl"
fi
if [ "$host" == "" ]; then
	host="127.0.0.1"
fi
if [ "$user"=="" ]; then
	user="root"
fi
if [ "$password" == "" ]; then
	password="password"
fi

sed -i 's/###DB_DATABASE##(\'HomeControl\')###/$database/' ../HomeAutomation/settings.py
sed -i 's/###DB_HOST##(\'127.0.0.1\')###/$host/' ../HomeAutomation/settings.py
sed -i 's/###DB_USER##(\'root\')###/$user/' ../HomeAutomation/settings.py
sed -i 's/###DB_PASSWORD##(\'password\')###/$password/' ../HomeAutomation/settings.py
sed -i 's/###DB_PORT##(\'\')###/$port/' ../HomeAutomation/settings.py