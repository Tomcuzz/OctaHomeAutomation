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
	cp NginxConfig.txt /etc/nginx/sites-enabled/homeautomation
	rm /etc/nginx/sites-enabled/default
	service apache2 stop
	service nginx restart
elif [[ "$server" == "apache2" ]]; then
	apt-get install apache2 libapache2-mod-proxy-html libxml2-dev mysql-server gcc python python-pip python-mysqldb
	cp ApacheConfig.txt /etc/apache2/sites-enabled/homeautomation
	rm /etc/apache2/sites-enabled/000-default
	a2enmod proxy
	a2enmod proxy_http
	a2enmod proxy_ajp
	a2enmod rewrite
	a2enmod deflate
	a2enmod headers
	a2enmod proxy_balancer
	a2enmod proxy_connect
	a2enmod proxy_html
	service apache2 restart
else
	apt-get install mysql-server gcc python python-pip python-mysqldb
fi

pip install Django
pip install django-celery

pip install -r ../OctaHomeCore/requirements.txt

cp InitScript.txt /etc/init.d/homeautomation
chmod +x /etc/init.d/homeautomation

cp ../HomeAutomation/settings.py.dist ../HomeAutomation/settings.py

adminname=""
adminemail=""
database=""
host=""
user=""
password=""
port=""

authyapikey=""
metofficeapikey=""
proxmoxip=""
proxmoxuser=""
proxmoxpassword=""

while true; do
	read -p "Admin Name [default='Joe Bloggs']:" adminname
	read -p "Admin Email [default='joebloggs@example.com']:" adminemail
	read -p "Database Name [default='HomeControl']:" database
	read -p "Database Host [default='127.0.0.1']:" host
	read -p "Database User [default='root']:" user
	read -p "Database Password [default='password']:" password
	read -p "Database Port [default='']:" port
	
	read -p "Authy API Key (Two-Factor Authentication) [default='']:" authyapikey
	read -p "Met Office API Key (Weather) [default='']:" metofficeapikey
	read -p "Proxmox IP Address [default='127.0.0.1']:" proxmoxip
	read -p "Proxmox User [default='homeautomation@pam']:" proxmoxuser
	read -p "Proxmox Password [default='password']:" proxmoxpassword
	
	read -p "Are these details correct? [y/n]" yn
	case $yn in
		[Yy]* ) break;;
	esac
done

if [ "$adminname" = "" ]; then
	adminname="Joe Bloggs"
fi
if [ "$adminemail" == "" ]; then
	adminemail="joebloggs@example.com"
fi
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


if [ "$authyapikey" == "" ]; then
	authyapikey=""
fi
if [ "$metofficeapikey" == "" ]; then
	metofficeapikey=""
fi
if [ "$proxmoxip" == "" ]; then
	proxmoxip="127.0.0.1"
fi
if [ "$proxmoxuser" == "" ]; then
	proxmoxuser="homeautomation@pam"
fi
if [ "$proxmoxpassword" == "" ]; then
	proxmoxpassword="password"
fi


sed -i "s/###ADMIN_NAME##('Joe Bloggs')###/'$adminname'/" ../HomeAutomation/settings.py
sed -i "s/###ADMIN_EMAIL##('joebloggs@example.com')###/'$adminemail'/" ../HomeAutomation/settings.py
sed -i "s/###DB_DATABASE##('HomeControl')###/'$database'/" ../HomeAutomation/settings.py
sed -i "s/###DB_HOST##('127.0.0.1')###/'$host'/" ../HomeAutomation/settings.py
sed -i "s/###DB_USER##('root')###/'$user'/" ../HomeAutomation/settings.py
sed -i "s/###DB_PASSWORD##('password')###/'$password'/" ../HomeAutomation/settings.py
sed -i "s/###DB_PORT##('')###/'$port'/" ../HomeAutomation/settings.py

sed -i "s/###AUTHY_API_KEY##('')###/'$authyapikey'/" ../HomeAutomation/settings.py
sed -i "s/###MET_OFFICE_API_KEY##('')###/'$metofficeapikey'/" ../HomeAutomation/settings.py
sed -i "s/###PROXMOX_IP##('127.0.0.1')###/'$proxmoxip'/" ../HomeAutomation/settings.py
sed -i "s/###PROXMOX_USER##('homeautomation@pam')###/'$proxmoxuser'/" ../HomeAutomation/settings.py
sed -i "s/###PROXMOX_PASSWORD##('password')###/'$proxmoxpassword'/" ../HomeAutomation/settings.py
