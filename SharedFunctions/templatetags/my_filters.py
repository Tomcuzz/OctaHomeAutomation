from django import template

register = template.Library()

@register.filter
def replaceUnderscores(value):
	return value.replace("_", " ")