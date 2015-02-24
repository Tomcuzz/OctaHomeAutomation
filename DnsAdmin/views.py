from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.db import connections
from DnsAdmin.models import *
from OctaHomeCore.menumodels import *

#Nav Bar Item
class NetworkingTopNavBarItem(TopNavBarItem):
	Priority = 50
	DisplayName = "Networking"
	Link = "#"

class DnsAdminTopNavBarItem(TopNavBarItem):
	ParentItem = "Networking"
	Priority = 20
	DisplayName = "Dns Admin"
	
	@property
	def Link(self):
		return reverse('DnsAdmin')

#View Object
def DnsAdminMain(request):
	domains = []
	subLinks = [{'title':'All Domains', 'address': '/DnsAdmin/', 'active': ''}]
	
	cursor = connections['dns'].cursor()
	cursor.execute("SHOW TABLES")
	tables = cursor.fetchall()
	
	tablesArray = []
	
	for x in tables:
		for table in x:
			tablesArray.append(table)
			subLinks.append({'title':str(table), 'address': '/DnsAdmin/?domain=' + str(table), 'active': ''})
	
	if request.GET.get('domain', '') != '':
		tablesArray = [request.GET.get('domain', '')]
	
	for table in tablesArray:
		#one run of loop for each table
		cursor.execute("select * from " + str(table))
		rows = cursor.fetchall()
		
		zoneItems = []
		for aRow in rows:
			rowJson = {'name':aRow[0], 'ttl':aRow[1], 'rdtype':aRow[2], 'rdata':aRow[3], 'id':aRow[4]}
			zoneItems.append(rowJson)
		
		domainItem = {'DomainName':table, 'ZoneItems':zoneItems}
		domains.append(domainItem)
	
	links = [{'title': 'Zones', 'address': '', 'sublinks':subLinks, 'active': ''}]
	return render(request, 'OctaHomeDnsAdmin/Settings.html', {'links': links, 'Domains':domains})
	