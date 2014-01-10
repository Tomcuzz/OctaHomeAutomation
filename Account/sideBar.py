from models import *

def getSideBar(currentPage, request):
	if AccountModel().isAdmin(request) == "Admin":
		links = [{'title': 'Personal Details', 'address': '/account/?page=editPersonalDetails', 'active': getSideBarActiveState('editPersonalDetails', currentPage)}, {'title': 'Change Pin', 'address': '/account/?page=ChangePin', 'active': getSideBarActiveState('ChangePin', currentPage)}, {'title': 'Edit Users', 'address': '/account/?page=EditUsers', 'active': getSideBarActiveState('EditUsers', currentPage)}, {'title': 'Add User', 'address': '/account/?page=AddUser', 'active': getSideBarActiveState('AddUser', currentPage)}, {'title': 'Log Out', 'address': '/account/?page=LogOut', 'active': getSideBarActiveState('LogOut', currentPage)}]
	else:
		links = [{'title': 'Personal Details', 'address': '/account/?page=editPersonalDetails', 'active': getSideBarActiveState('editPersonalDetails', currentPage)}, {'title': 'Change Pin', 'address': '/account/?page=ChangePin', 'active': getSideBarActiveState('ChangePin', currentPage)}, {'title': 'Log Out', 'address': '/account/?page=LogOut', 'active': getSideBarActiveState('LogOut', currentPage)}]
	return links

def getSideBarActiveState(sidebarItem, currentPage):
	if sidebarItem == currentPage:
		return 'active'
	else:
		return ''
