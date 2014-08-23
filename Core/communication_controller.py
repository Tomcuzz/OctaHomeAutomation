import socket
import httplib

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
		return True
	def sendHTTPGetRequest(self, ipAddress, port, urlLocation):
		conn = httplib.HTTPConnection(str(ipAddress), int(port))
		conn.request("GET", urlLocation)
		data = conn.getresponse()
		return data