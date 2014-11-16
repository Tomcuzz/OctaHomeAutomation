# Octa Home Automation

## The Project

Octa is an open source home automation panel that is currently under active development.

With lots of new devices that are now coming out with all of their own control pannels and Apps in a lots of different locations, this was made to centralise them all and put them all together in one location.

  
## Setup
### Unpack:
1. Unpack the package to /var/www/HomeAutomation

### Install Services:
1. Install Nginx
2. Install MySql
3. Install Python

### Python Setup:
1. Install Django
2. Install MySqld
3. Install South
3. Install Djcelery
4. Install dateutil
5. Install proxmoxer
6. Install Astral
7. Install Authy

### Nginx Setup:
1. Copy HomeAutomationNginxConfig.txt to /etc/nginx/sites-enabled/homeautomation

### Home Automisation Service Setup
1. Copy InitScript.txt to /etc/init.d/homeautomation
2. chmod +x /etc/init.d/homeautomation
3. Copy the settings.py.dist file to settings.py and edit to reflect your settings
3. Run Self Setup: python manage.py ServerSetup
3. Start the service from sudo/root with: service homeautomation start

  
## Development
### Roadmap
1. Inprovements To The Core
2. Implementations Of Submoduls For Different Services
3. Implementations Of Popular Services (e.g. Nest, Hue, LightWaveRF,...)
4. Create Mobile App's For All The Platforms

### Contributing
1. Fork it.
2. Create a branch (`git checkout -b my_markup`)
3. Commit your changes (`git commit -am "Added Snarkdown"`)
4. Push to the branch (`git push origin my_markup`)
5. Open a Pull Request
6. Enjoy a refreshing Coke and wait