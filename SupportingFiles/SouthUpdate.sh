array=(Home HomeStats Security Lights Alarm Curtains TempControl AudioVisual Food DeviceInput Proxmox DnsAdmin Account Weather ErrorPages SharedFunctions Api)
for i in "${array[@]}"
do
	echo $i
	python ../manage.py schemamigration $i --auto
	python ../manage.py migrate $i
done