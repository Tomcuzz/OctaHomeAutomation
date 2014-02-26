import time
import socket
import httplib
from multiprocessing import Pool
from celery.task import task

class DeviceControl():
	def setDeviceRGBState(self, ipAddress, deviceType, r, g, b, scrollTime="1"):
		if deviceType == "Arduino":
			message = "r=" + str(r) + ",g=" + str(g) + ",b=" + str(b) + ",t=" + str(scrollTime) + ","
			CommunicationControl().sendUDPMessage(ipAddress, 100, message)
		elif deviceType == "MaxPi":
			urlLocation = "/colour?r=" + str(r) + "&g=" + str(g) + "&b=" + str(b) + "&delay=" + str(int(float(scrollTime) * 100))
			port = 8080
			CommunicationControl().sendHTTPGetRequest(ipAddress, port, urlLocation)
	
	def setOnOffDeviceState(self, ipAddress, deviceType, boolStateIsOn):
		device = "Arduino"
		if device == "Arduino":
			if boolStateIsOn == True:
				boolString = "On"
			else:
				boolString = "Off"
			message = "light=" + boolString
			CommunicationControl().sendUDPMessage(ipAddress, 100, message)


class CommunicationControl():
	def sendTCPMessage(self, ipAddress, port, message):
		BUFFER_SIZE = 1024
		port = int(port)
		s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		s.connect((ipAddress, port))
		s.send(message)
		data = s.recv(BUFFER_SIZE)
		s.close()
		return data
	def sendUDPMessage(self, ipAddress, port, message):
		sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
		sock.sendto(message, (ipAddress, port))
	def sendHTTPGetRequest(self, ipAddress, port, urlLocation):
		conn = httplib.HTTPConnection(str(ipAddress), int(port))
		conn.request("GET", urlLocation)
		data = conn.getresponse()
		return data