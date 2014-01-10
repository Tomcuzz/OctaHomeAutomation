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
		pool = Pool(processes=1)	      # Start a worker processes.
		result = pool.apply_async(self.scrollDeviceRGBStateProcess(ipAddress, deviceType, oldR, oldG, oldB, newR, newG, newB), [], self.SetDeviceFinish()) # Evaluate "f(10)" asynchronously
	
	def scrollDeviceRGBStateProcess(self, ipAddress, deviceType, oldR, oldG, oldB, newR, newG, newB):
		if deviceType == "MaxPi":
			self.setDeviceRGBState(ipAddress, deviceType, newR, newG, newB)
			return
		tempR = int(str(oldR))
		tempG = int(str(oldG))
		tempB = int(str(oldB))
		newR = int(str(newR))
		newG = int(str(newG))
		newB = int(str(newB))
		while not ((tempR == newR) & (tempG == newG) & (tempB == newB)):
			if tempR > (newR + 4):		tempR = tempR - 4
			if tempR > newR:		tempR = tempR - 1
			elif tempR < (newR - 4):	tempR = tempR + 4
			elif tempR < newR:      	tempR = tempR + 1
			else:				tempR = newR
			
			if tempG > (newG + 4):		tempG = tempG - 4
			if tempG > newG:		tempG = tempG - 1
			elif tempG < (newG - 4):	tempG = tempG + 4
			elif tempG < newG:		tempG = tempG + 1
			else:				tempG = newG
			
			if tempB > (newB + 4):		tempB = tempB - 4
			if tempB > newB:		tempB = tempB - 1
			elif tempB < (newB - 4):	tempB = tempB + 4
			elif tempB < newB:		tempB = tempB + 1
			else:				tempB = newB
			
			self.setDeviceRGBState(ipAddress, deviceType, tempR, tempG, tempB)
			
	def SetDeviceFinish(self):
		finish = 1;
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
		
		rGap = oldR - newR
		gGap = oldG - newG
		bGap = oldB - newB
		
		delayTime = float(scrollTime)/step
		
		for x in range(1,step): 
			rTemp = oldR - ((float(rGap) / step) * x)
			gTemp = oldG - ((float(gGap) / step) * x)
			bTemp = oldB - ((float(bGap) / step) * x)
			
			self.setDeviceRGBState(ipAddress, deviceType, int(rTemp), int(gTemp), int(bTemp))
			
			time.sleep(delayTime)
		
		self.setDeviceRGBState(ipAddress, deviceType, newR, newG, newB)
	
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
		sock.sendto(message, (ipAddress, port))
	def sendHTTPGetRequest(self, ipAddress, port, urlLocation):
		conn = httplib.HTTPConnection(str(ipAddress), int(port))
		conn.request("GET", urlLocation)
		data = conn.getresponse()
		return data
