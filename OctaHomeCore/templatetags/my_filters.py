from django import template
from django.template import RequestContext 
from OctaHomeCore.OctaFiles.menus.base import *
from django.template.loader import render_to_string

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


@register.simple_tag(takes_context=True)
def get_menu_with_name(context, name):
	request = context['request']
	menuClass = Menu.getMenuForName(name)
	menu = menuClass()
	menu.Request = request
	items = menu.buildMenu()
	return render_to_string(menu.ViewPartial, {'Items':items}, RequestContext(request))

@register.simple_tag(takes_context=True)
def get_menu_with_name_and_section(context, name, section):
	request = context['request']
	menuClass = Menu.getMenuForName(name)
	menu = menuClass()
	menu.Request = request
	menu.MenuObjectProvider.SectionName = section
	items = menu.buildMenu()
	return render_to_string(menu.ViewPartial, {'Items':items}, RequestContext(request))