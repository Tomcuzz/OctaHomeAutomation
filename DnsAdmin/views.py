from django.shortcuts import render
from django.http import HttpResponse, HttpResponseNotFound, Http404
from django.db import connections

from OctaHomeCore.views.base import *

#View Object
class handleDnsAdminView(viewRequestHandler):
	def getTemplate(self):
		return 'OctaHomeDnsAdmin/Settings'
	
	def getViewParameters(self):
		domains = []
		
		cursor = connections['dns'].cursor()
		cursor.execute("SHOW TABLES")
		tables = cursor.fetchall()
		
		tablesArray = []
		
		if self.Kwarguments.has_key('domain'):
			tablesArray = [self.Kwarguments['domain']]
		else:
			for x in tables:
				for table in x:
					tablesArray.append(table)
		
		for table in tablesArray:
			#one run of loop for each table
			cursor.execute("select * from " + str(table))
			rows = cursor.fetchall()
			
			zoneItems = []
			for aRow in rows:
				rowJson = {'id':aRow[0], 'name':aRow[1], 'domain':str(table), 'ttl':aRow[2], 'rdtype':aRow[3], 'rdata':aRow[4]}
				zoneItems.append(rowJson)
			
			domainItem = {'DomainName':table, 'ZoneItems':zoneItems}
			domains.append(domainItem)
		
		return {'Domains':domains}
		
		
		parameters = {'device':self.getDevice()}
		
		return parameters
	
	def getSideBarName(self):
		return "DnsAdminSideNavBar"
