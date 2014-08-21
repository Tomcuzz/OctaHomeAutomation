array=(Home HomeStats Security Lights Alarm Curtains TempControl AudioVisual Food DeviceInput Proxmox DnsAdmin Account Weather ErrorPages SharedFunctions Api)
for i in "${array[@]}"
do
	rm -rf ../$i/migrations
done