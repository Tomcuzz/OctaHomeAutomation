def baseurl(request):
    """
    Return a BASE_URL template context for the current request.
    """
    if request.is_secure():
        scheme = 'https://'
    else:
        scheme = 'http://'
        
    return {'BASE_URL': scheme + request.get_host(),}
    


def getNonAbstractSubClasses(cls):
	classes = []
	for subclass in cls.__subclasses__():
		if subclass._meta.abstract:
			classes.extend(getNonAbstractSubClasses(subclass))
		else:
			classes.append(subclass)
	return classes

def getAllSubClasses(cls):
	classes = [cls]
	for subclass in cls.__subclasses__():
		classes.extend(getAllSubClasses(subclass))
	return classes