import time
import socket
import httplib
from multiprocessing import Pool
from celery.task import task

class DeviceControl():
	def setDeviceRGBState(self, ipAddress, deviceType, r, g, b):
		if deviceType == "Arduino":
			message = "r=" + str(r) + ",g=" + str(g) + ",b=" + str(b) + ","
			CommunicationControl().sendUDPMessage(ipAddress, 100, message)
		elif deviceType == "MaxPi":
			urlLocation = "/colour?r=" + str(r) + "&g=" + str(g) + "&b=" + str(b)
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
	
	def scrollDeviceRGBState(self, ipAddress, deviceType, oldR, oldG, oldB, newR, newG, newB):
		scrollDeviceRGBStateTaskWithTime.delay(ipAddress, deviceType, oldR, oldG, oldB, newR, newG, newB, "1") 
		
	def scrollDeviceRGBStateWithTime(self, ipAddress, deviceType, oldR, oldG, oldB, newR, newG, newB, scrollTime):
		scrollDeviceRGBStateTaskWithTime.delay(ipAddress, deviceType, oldR, oldG, oldB, newR, newG, newB, scrollTime)
	
@task()
def scrollDeviceRGBStateTaskWithTime(ipAddress, deviceType, oldR, oldG, oldB, newR, newG, newB, scrollTime):
	if deviceType == "MaxPi":
		urlLocation = "/colour?r=" + str(r) + "&g=" + str(g) + "&b=" + str(b) + "&delay=" + str(int(float(scrollTime) * 100))
		port = 8080
		CommunicationControl().sendHTTPGetRequest(ipAddress, port, urlLocation)
	else:
		step = 255
		while (float(scrollTime)/step) < 0.05:
			step = step / 2
		
		rGap = int(oldR) - int(newR)
		gGap = int(oldG) - int(newG)
		bGap = int(oldB) - int(newB)
		
		delayTime = float(scrollTime)/step
		
		for x in range(1,step): 
			rTemp = oldR - ((float(rGap) / step) * x)
			gTemp = oldG - ((float(gGap) / step) * x)
			bTemp = oldB - ((float(bGap) / step) * x)
			
			DeviceControl().setDeviceRGBState(ipAddress, deviceType, int(rTemp), int(gTemp), int(bTemp))
			
			time.sleep(delayTime)
		
		DeviceControl().setDeviceRGBState(ipAddress, deviceType, str(newR), str(newG), str(newB))
	
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