from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.shortcuts import render
from django.shortcuts import redirect
import datetime
from models import *
import sys
from proxmoxer import ProxmoxAPI

def ProxmoxMain(request):
	proxmox = ProxmoxAPI('10.101.1.200', user='root@pam', password='Fish01', verify_ssl=False)
	currentNode = request.GET.get('node', 'none')
	currentVz = request.GET.get('openvz', 'none')
	currentVm = request.GET.get('qemu', 'none')
	if currentNode != 'none':
		tasks = proxmox.nodes(currentNode).get('tasks')
		return render(request, 'pages/Proxmox/Node.html', {'links': getSideBar(request, proxmox), 'Node':currentNode, 'StorageDevices':getStorageDetails(proxmox), 'ServerStatuses':getServerStatuses(proxmox), 'tasks':tasks})
	elif currentVz != 'none':
		return render(request, 'pages/Proxmox/CT.html', {'links': getSideBar(request, proxmox), 'Node':currentNode, 'StorageDevices':getStorageDetails(proxmox), 'ServerStatuses':getServerStatuses(proxmox)})
	elif currentVm != 'none':
		raise Http404
	else:
		tasks = getAllServerTasks(proxmox)
		return render(request, 'pages/Proxmox/AllNodes.html', {'links': getSideBar(request, proxmox), 'StorageDevices':getStorageDetails(proxmox), 'ServerStatuses':getServerStatuses(proxmox), 'tasks':tasks})
	raise Http404

def getSideBar(request, proxmox):
	currentPage = request.GET.get('currentPage', 'all')
	currentNode = request.GET.get('node', 'none')
	currentVz = request.GET.get('openvz', 'none')
	currentCt = request.GET.get('qemu', 'none')
	
	links = [{'title': 'System Stats', 'address': '/Proxmox/', 'active': getSideBarActiveState([currentNode, currentVz, currentCt], 'none')}]
	
	for node in proxmox.nodes.get():
		nodeSublinks = []
		containers = []
		for vm in proxmox.nodes(node['node']).openvz.get():
			sidebarItem = {'title': vm['vmid'] + ": " + vm['name'], 'address': '/Proxmox/?openvz=' + vm['vmid'], 'active':getSideBarActiveState(vm['vmid'], currentVz)}
			containers.append(sidebarItem)
		sidebarItem = {'title': 'CT\'s', 'sublinks':containers, 'active':''}
		nodeSublinks.append(sidebarItem)
		
		vms = []
		for vm in proxmox.nodes(node['node']).qemu.get():
			sidebarItem = {'title': vm['vmid'] + ": " + vm['name'], 'address': '/Proxmox/?qemu=' + vm['vmid'] , 'active':getSideBarActiveState(vm['vmid'], currentCt)}
			vms.append(sidebarItem)
		sidebarItem = {'title': 'VM\'s', 'sublinks':vms,  'active':''}
		nodeSublinks.append(sidebarItem)
		
		nodeItem = {'title': node['node'], 'address': '/Proxmox/?node=' + node['node'], 'sublinks':nodeSublinks, 'active':getSideBarActiveState(node['node'], currentNode)}
		links.append(nodeItem)
	
	sidebarItem = {'title': 'Add New Server', 'address': '', 'id': 'addServer' , 'active':getSideBarActiveState('add', currentPage)}
	links.append(sidebarItem)
	return links

def getSideBarActiveState(sidebarItem, currentPage):
	if type(sidebarItem) is list:
		for anItem in sidebarItem:
			if anItem != currentPage:
				return ''
		return 'active'
	if sidebarItem == currentPage:
		return 'active'
	else:
		return ''

def getAllServerTasks(proxmox):
	toReturn = []
	for node in proxmox.nodes.get():
		toReturn = toReturn + proxmox.nodes(node['node']).get('tasks')
	return toReturn

def getServerStatuses(proxmox):
	containersOnline = 0
	containersTotal = 0
	vmsOnline = 0
	vmsTotal = 0
	
	serverUptimes = []
	
	for node in proxmox.nodes.get():
		uptime = datetime.timedelta(seconds=node['uptime'])
		uptimeItem = {'node':node['node'], 'uptime':uptime, 'secondUptime':node['uptime']}
		serverUptimes.append(uptimeItem)
		for vm in proxmox.nodes(node['node']).openvz.get():
			containersTotal = containersTotal + 1
			if vm['status'] == "running":
				containersOnline = containersOnline + 1
		for vm in proxmox.nodes(node['node']).qemu.get():
			vmsTotal = vmsTotal + 1
			if vm['status'] == "running":
				vmsOnline = vmsOnline + 1
	
	totalOnline = containersOnline + vmsOnline
	totalTotal = containersTotal + vmsTotal
	
	totalOnlinePercentage = float(100 * float(float(totalOnline) / float(totalTotal)))
	totalOffLinePercentage = float(100 * float(float(totalTotal - totalOnline) / totalTotal))
	result = {}
	
	result['uptimes'] = serverUptimes
	
	result['containersOnline'] = str(containersOnline)
	result['containersTotal'] = str(containersTotal)
	
	result['vmsOnline'] = str(vmsOnline)
	result['vmsTotal'] = str(vmsTotal)
	
	result['totalOnline'] = str(totalOnline)
	result['totalTotal'] = str(totalTotal)
	
	result['totalOnlinePercentage'] = str(totalOnlinePercentage)
	result['totalOffLinePercentage'] = str(totalOffLinePercentage)
	
	return result

def getStorageDetails(proxmox):
	toReturn = {}
	numberOfDevices = 0
	numberOfNodes = 0
	totalSpace = 0
	totalSpaceGB = float(0)
	totalUsed = 0
	totalUsedGB = float(0)
	nodeStorageDevices = []
	allStorageDevice = []
	for node in proxmox.nodes.get():
		numberOfNodes = numberOfNodes + 1
		nodeStorageDevices = proxmox.nodes(node['node']).get('storage')
		
		nodeNumberOfStorageDevices = 0
		nodeTotalSpaceGb = float(0)
		nodeUsedSpaceGb = float(0)
		
		for nodeStorageDevice in nodeStorageDevices:
			name = nodeStorageDevice['storage']
			numberOfDevices = numberOfDevices + 1
			nodeNumberOfStorageDevices = nodeNumberOfStorageDevices + 1
			
			totalSpace = totalSpace + int(nodeStorageDevice['total'])
			totalUsed = totalUsed + int(nodeStorageDevice['used'])
			
			gbTotalSpace = float(float(nodeStorageDevice['total']) / float(1073741824))
			gbSpaceUsed = float(float(nodeStorageDevice['used']) / float(1073741824))
			
			totalSpaceGB = totalSpaceGB + gbTotalSpace
			totalUsedGB = totalUsedGB + gbSpaceUsed
			
			nodeTotalSpaceGb = nodeTotalSpaceGb + gbTotalSpace
			nodeUsedSpaceGb = nodeUsedSpaceGb + gbSpaceUsed
			
			aDevice = {'node':node['node'], 'name':name, 'total':nodeStorageDevice['total'], 'used':nodeStorageDevice['used'], 'totalGb':totalSpaceGB, 'usedGb':totalUsedGB}
			allStorageDevice.append(aDevice)
		
		aNode = {'node':node['node'], 'totalGb':nodeTotalSpaceGb, 'usedGb':nodeUsedSpaceGb}
		nodeStorageDevices.append(aNode)
	
	allItem = {'total':totalSpace, 'used':totalUsed, 'nodes':numberOfNodes, 'devices':numberOfDevices, 'totalGb':totalSpaceGB, 'usedGb':totalUsedGB}
	toReturn['all'] = allItem
	toReturn['devices'] = allStorageDevice
	toReturn['nodes'] = nodeStorageDevices
	
	return toReturn





	
