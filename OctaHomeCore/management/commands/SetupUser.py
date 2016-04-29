from django.core.management.base import BaseCommand, CommandError
import getpass
from OctaHomeCore.models.auth import *
from django.contrib.auth import *

class Command(BaseCommand):
	email = ''
	firstName = ''
	lastName = ''
	password = ''
	isActive = False
	isSuperUser = False
	homeLocation = ''

	help = "This initialises a user account"

	def handle(self, *args, **options):
		while True:
			self.getUserAccountInput()
			isCorrect = False
			while True:
				isCorrectText = raw_input("Is Information All Correct [Yes/No]:")
				if isCorrectText:
					if isCorrectText == 'Yes':
						isCorrect = True
						break
					elif isCorrectText == 'No':
						isCorrect = False
						break
					else:
						print "Invalid Argument, Please Type Either 'Yes' or 'No'"
				else:
					print "No Option Entered Please Enter If These Details Are Correct"
			if isCorrect:
				break
				
		
		user = CustomUser.objects.create_user(self.email, self.firstName, self.lastName, self.password)
		user.username = self.email
		user.first_name = self.firstName
		user.last_name = self.lastName
		user.is_active = self.isActive
		user.is_superuser = self.isSuperUser
		user.home_location = self.homeLocation
		
		user.save()
	
	def getUserAccountInput(self):
		print "\nPlease enter your email address"
		message = "Email[xxx@xxx.xx]:"
		while True:
			self.email = raw_input(message)
			if self.email:
				break
			else:
				print "No Email Entered Please Enter An Email"
		
		print "Please enter your First Name"
		message = "First Name[xxxxx]:"
		while True:
			self.firstName = raw_input(message)
			if self.firstName:
				break
			else:
				print "No Name Entered Please Enter Your First Name"
		
		print "Please enter your Last Name"
		message = "Last Name[xxxxx]:"
		while True:
			self.lastName = raw_input(message)
			if self.lastName:
				break
			else:
				print "No Name Entered Please Enter Your Last Name"
		
		print "Please enter your New Password"
		firstMessage = "Password[xxxxx]:"
		repeatMessage = "Repeat Password[xxxxx]:"
		while True:
			self.firstPassword = getpass.getpass(firstMessage)
			self.repeatPassword = getpass.getpass(repeatMessage)
			if self.firstPassword and self.repeatPassword:
				if self.firstPassword == self.repeatPassword:
					self.password = self.firstPassword
					break
				else:
					print "Passwords Did Not Match"
			else:
				print "No Password Entered Please Enter Your New Password"
		
		print "Is This User Active"
		message = "User Active[Yes/No]:"
		while True:
			self.isActiveText = raw_input(message)
			if self.isActiveText:
				if self.isActiveText == 'Yes':
					self.isActive = True
					break
				elif self.isActiveText == 'Yes':
					self.isActive = False
					break
				else:
					print "Invalid Argument, Please Type Either 'Yes' or 'No'"
			else:
				print "No Option Entered Please Enter If This User Should Be Active"
			
		print "Is This A Super User"
		message = "Super User[Yes/No]:"
		while True:
			self.isSuperUserText = raw_input(message)
			if self.isSuperUserText:
				if self.isSuperUserText == 'Yes':
					self.isSuperUser = True
					break
				elif self.isActiveText == 'Yes':
					self.isSuperUser = False
					break
				else:
					print "Invalid Argument, Please Type Either 'Yes' or 'No'"
			else:
				print "No Option Entered Please Enter If This User Should Be A Super User"
		
