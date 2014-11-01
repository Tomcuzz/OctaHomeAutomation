from django import template

register = template.Library()

@register.filter
def replaceUnderscores(value):
	return value.replace("_", " ")

@register.filter
def getClassName(value):
	return value.__class__.__name__