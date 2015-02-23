from django import template
from OctaHomeCore.menumodels import *
from django.shortcuts import render_to_response

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
		for jsPartial in device.JsPartials:
			if jsPartial != '' and jsPartial not in allJsPartials:
				allJsPartials.append(jsPartial)
	
	return allJsPartials


@register.simple_tag()
def get_menu_with_name(name):
	menuClass = Menu.getMenuForName(name)
	menu = menuClass()
	items = menu.buildMenu()
	return render_to_response(menu.ViewPartial, {'Items':items})