from django.http import HttpResponse
from django.shortcuts import render
from proxmoxer import ProxmoxAPI
import json

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
		node = str(request.GET.get('node', ''))
		ct = str(request.GET.get('ct', ''))
		proxmox.nodes(node).openvz(ct).status.shutdown.post()
		return HttpResponse("Ok")
	elif command == 'migrateCT':
		node = str(request.GET.get('node', ''))
		ct = str(request.GET.get('ct', ''))
		target = str(request.GET.get('target', ''))
		proxmox.nodes(node).openvz(ct).migrate.post(target=target) 
		
		return HttpResponse("Ok")
	elif command == 'consoleCT':
		node = str(request.GET.get('node', ''))
		ct = str(request.GET.get('ct', ''))
		vnc = proxmox.nodes(node).openvz(ct).vncproxy.post()
		vnc['cert'] = vnc['cert'].replace('\n', '|')
		return render(request, 'pages/Proxmox/console.html', {'vnc':vnc})
	elif command == 'removeCT':
		node = str(request.GET.get('node', ''))
		ct = str(request.GET.get('ct', ''))
		proxmox.nodes(node).openvz(ct).delete()
		return HttpResponse("Ok")
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
	elif command == 'nodeStats':
		node = str(request.GET.get('node', ''))
		timeFrame = str(request.GET.get('time', 'hour'))
		
		stats = proxmox.nodes(node).rrddata.get(timeframe=timeFrame)
		
		text = json.dumps(stats, separators=(',',':'))
		
		return HttpResponse(text)
	elif command == 'ctStats':
		node = str(request.GET.get('node', ''))
		ct = str(request.GET.get('ct', ''))
		timeFrame = str(request.GET.get('time', 'hour'))
		
		stats = proxmox.nodes(node).openvz(ct).rrddata.get(timeframe=timeFrame)
		
		text = json.dumps(stats, separators=(',',':'))
		
		return HttpResponse(text)
	elif command == 'vmStats':
		return HttpResponse("Ok")
