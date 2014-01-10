import socket

class DeviceControl():
	def setDeviceRGBState(self, ipAddress, deviceType, r, g, b):
		device = "Arduino"
		if device == "Arduino":
			message = "r=" + r + ",g=" + g + ",b=" + b + ","
			CommunicationControl().sendUDPMessage(ipAddress, 100, message)

class CommunicationControl():
	BUFFER_SIZE = 1024
	def sendTCPMessage(self, ipAddress, port, message):
		s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
		s.connect((ipAddress, port))
		s.send(message)
		data = s.recv(BUFFER_SIZE)
		s.close()
		return data
	def sendUDPMessage(self, ipAddress, port, message):
		sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
        	sock.sendto(message, (ipAddress, port)))
