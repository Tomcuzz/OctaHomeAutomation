
#Setup
##Unpack:
1. Unpack the package to /var/www/HomeAutomation

##Install Services:
1. Install Nginx
2. Install MySql
3. Install Python

##Python Setup:
1. Install Django
2. Install MySqld
3. Install South
3. Install Djcelery
4. Install dateutil
5. Install proxmoxer
6. Install Astral
7. Install Authy

##Nginx Setup:
1. Copy HomeAutomationNginxConfig.txt to /etc/nginx/sites-enabled/homeautomation

##Home Automisation Service Setup
1. Copy InitScript.txt to /etc/init.d/homeautomation
2. chmod +x /etc/init.d/homeautomation
3. Copy the settings.py.dist file to settings.py and edit to reflect your settings
3. Run Self Setup: python manage.py ServerSetup
3. Start the service from sudo/root with: service homeautomation start