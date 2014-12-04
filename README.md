# Octa Home Automation

## The Project

Octa is an open source home automation panel that is currently under active development.

With all the new devices that are coming out with all their own control panels and apps, this was made to centralise them all and put them all together in one location so you can have full control of your home in one location, and easily link events in one system with actions in another.

<br/>

## Installation
Commands for installation need to be run as root.

(This can be either through the 'root' user or through 'sudo')
### Automatic Installation
```
cd /var/www
git clone https://github.com/Tomcuzz/OctaHomeAutomation.git HomeAutomation
cd HomeAutomation/SupportingFiles
bash Install.sh
cd ..

# (Create a database/user with the details you just entered)

python manage.py SetupServer
```
*** During the `bash Install.sh` step if you currently have a website running on this server or have custom web server requirements, it is recomended that you go through the `skip-webserver`

(Examples of the config files are in the supporting files folder)

### Manual Installation
#### Unpack:
1. Unpack the package to /var/www/HomeAutomation

#### Install Services:
1. Install Nginx
2. Install MySql
3. Install Python

#### Python Setup:
1. Install Django
2. Install MySqld
3. Install Djcelery
4. Install dateutil
5. Install proxmoxer
6. Install Astral
7. Install Authy

#### Nginx Setup:
1. Copy SupportFiles/NginxConfig.txt to /etc/nginx/sites-enabled/homeautomation

#### Home Automation Service Setup
1. Copy SupportFiles/InitScript.txt to /etc/init.d/homeautomation
2. chmod +x /etc/init.d/homeautomation
3. Copy the HomeAutomation/settings.py.dist file to HomeAutomation/settings.py and edit to reflect your settings
3. Run Self Setup: python manage.py ServerSetup
3. Start the service from sudo/root with: service homeautomation start

<br/>

## Development
### Roadmap
1. Inprovements To The Core
2. Implementations Of Submodules For Different Services
3. Implementations Of Popular Services (e.g. Nest, Hue, LightWaveRF,...)
4. Create Mobile App's For All The Platforms

### Contributing
1. Fork it.
2. Create a branch (`git checkout -b my_markup`)
3. Commit your changes (`git commit -am "Added Space Ship Control"`)
4. Push to the branch (`git push origin my_markup`)
5. Open a Pull Request
6. Enjoy a refreshing Coke and wait

## Licensing
Please Read The `LICENSE.md` File Included In This Repository
