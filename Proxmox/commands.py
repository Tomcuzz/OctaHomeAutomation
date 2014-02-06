from django.http import HttpResponse

def runcommand(request, proxmox):
	command = request.GET.get('command', 'none')
	if command == 'startCT':
		node = str(request.GET.get('node', ''))
		ct = str(request.GET.get('ct', ''))
		proxmox.nodes(node).openvz(ct).status.start.post()
		return HttpResponse("Ok")
	elif command == 'stopCT':
		node = str(request.GET.get('node', ''))
		ct = str(request.GET.get('ct', ''))
		proxmox.nodes(node).openvz(ct).status.stop.post()
		return HttpResponse("Ok")
	elif command == 'shutdownCT':
		raise NameError('Yet To Be Implemented')
	elif command == 'migrateCT':
		raise NameError('Yet To Be Implemented')
	elif command == 'consoleCT':
		raise NameError('Yet To Be Implemented')
	elif command == 'removeCT':
		raise NameError('Yet To Be Implemented')
	elif command == 'startVM':
		raise NameError('Yet To Be Implemented')
	elif command == 'stopVM':
		raise NameError('Yet To Be Implemented')
	elif command == 'shutdownVM':
		raise NameError('Yet To Be Implemented')
	elif command == 'migrateVM':
		raise NameError('Yet To Be Implemented')
	elif command == 'consoleVM':
		raise NameError('Yet To Be Implemented')
	elif command == 'removeVM':
		raise NameError('Yet To Be Implemented')
	elif command == 'addcomplete':
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