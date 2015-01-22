from django import template

register = template.Library()

@register.filter
def replaceUnderscores(value):
	return value.replace("_", " ")

@register.filter
def getClassName(value):
	return value.__class__.__name__

@register.filter
def getUniqueJsPartials(devices):
	allJsPartials = []
	for device in devices:
		for jsPartial in device.getJsPartials():
			if jsPartial != '' and jsPartial not in allJsPartials:
				allJsPartials.append(jsPartial)
	
	return allJsPartials