from django import template

register = template.Library()

@register.filter
def formatTaskType(value):
	if value == "vzcreate":
		return "Created Container"
	elif value == "vzstart":
		return "Started Container"
	elif value == "vzshutdown":
		return "Shutdown Container"
	elif value == "vzstop":
		return "Stopped Container"
	elif value == "vncproxy":
		return "Started Console"
	elif value == "vzdestroy":
		return "Deleted Container"
	
	elif value == "qmcreate":
		return "Create VM"
	elif value == "qmstart":
		return "Start VM"
	elif value == "qmshutdown":
		return "Shutdown VM"
	elif value == "qmstop":
		return "Stopped VM"
	elif value == "qmdestroy":
		return "Deleted VM"
	
	elif value == "startall":
		return "Start All VM's/Containers"
	return value

@register.filter
def spaceToGB(value):
	return float(float(value) / float(1073741824))