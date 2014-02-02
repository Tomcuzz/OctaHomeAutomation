from django.http import HttpResponse

def runcommand(request, proxmox):
	command = request.GET.get('command', 'none')
	if command == 'addcomplete':
		nodeLocation = request.POST.get('node', '')
		vmid = request.POST.get('vmid', '')
		template = request.POST.get('template', '')
		hostname = request.POST.get('hostname', '')
		storage = request.POST.get('storage', 'local')
		memory = request.POST.get('memory', '')
		swap = request.POST.get('swap', '')
		cpus = request.POST.get('cpu', '')
		disk = request.POST.get('disk', '')
		password = request.POST.get('serverpw', '')
		ipaddress = request.POST.get('ipaddress', '')
		
		
		if vmid == '':
			vmid = 100
			
			ids = []
			
			for node in proxmox.nodes.get():
				for vm in proxmox.nodes(node['node']).openvz.get():
					ids.append(int(vm['vmid']))
				
				for vm in proxmox.nodes(node['node']).qemu.get():
					ids.append(int(vm['vmid']))
			
			while (vmid in ids):
				vmid = vmid + 1
		
		node = proxmox.nodes(nodeLocation)
		if node != None:
			node.openvz.create(vmid=int(vmid), ostemplate=str(template), hostname=str(hostname), storage=str(storage), memory=int(memory), swap=int(swap), cpus=int(cpus), disk=int(disk), password=str(password), ip_address=str(ipaddress))
		else:
			return HttpResponse("Node Not Found", status=400)
		
		return HttpResponse("Ok")