import time, os
from random import randint

import socket
UDP_IP = "10.101.10.2"
UDP_PORT = 100
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

def fill(r,g,b):
    #max = 255
    #r = (max/255.0) * int(r)
    #g = (max/255.0) * int(g)
    #b = (max/255.0) * int(b)
    #pwm(0, r)
    #pwm(1, g)
    #pwm(2, b)
    #print "filling", r, g, b, r+g+b
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
    sock.sendto("r="+str(int(r))+",g="+str(int(g))+",b="+str(int(b))+",", (UDP_IP, UDP_PORT))
    print "r="+str(int(r))+",g="+str(int(g))+",b="+str(int(b))+","
 
def set(l,r,g,b):
    #pwm(0, r)
    #pwm(1, g)
    #pwm(2, b)
    
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
    sock.sendto("r="+str(int(r))+",g="+str(int(g))+",b="+str(int(b))+",", (UDP_IP, UDP_PORT))
    print "r="+str(int(r))+",g="+str(int(g))+",b="+str(int(b))+","
 
def pwm(pin, angle):
	
    if pin == 0:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
        sock.sendto("r="+str(int(angle)), (UDP_IP, UDP_PORT))
        print "r="+str(int(angle))
        #os.system("echo 5="+str(angle)+" > /dev/pi-blaster" )
    if pin == 1:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
        sock.sendto("g="+str(int(angle)), (UDP_IP, UDP_PORT))
        print "g="+str(int(angle))
        #os.system("echo 2="+str(angle)+" > /dev/pi-blaster" )
    if pin == 2:
        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) # UDP
        sock.sendto("b="+str(int(angle)), (UDP_IP, UDP_PORT))
        print "b="+str(int(angle))
        #os.system("echo 6="+str(angle)+" > /dev/pi-blaster" )

current = [0,0,0]
def fade(r,g,b,fadetime):
    global current
    rstep = (r - current[0]) / float(fadetime)
    gstep = (g - current[1]) / float(fadetime)
    bstep = (b - current[2]) / float(fadetime)
    for i in range(fadetime):
        current[0] += rstep
        current[1] += gstep
        current[2] += bstep
        fill(current[0],current[1],current[2])
        time.sleep(0.002)
 	time.sleep(0.1)
fadetime = 500
sleeptime = 20
 
#while True:
#    fill(randint(0,255),randint(0,255),randint(0,255))
 
 
fadeto = fade(randint(0,255),randint(0,255),randint(0,255),fadetime)    
fadeto
while True:
    oldfadeto = fadeto
    if oldfadeto == fadeto:
        fadeto = fade(randint(0,255),randint(0,255),randint(0,255),randint(100,300))    
        continue
    time.sleep(sleeptime)
    time.sleep(1)
