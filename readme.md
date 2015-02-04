<h2>Unipiazza Scan and Print</h2>
This is a simple application written using node-webkit that enables scanning nfc cards from a properly sat arduino-board. The read tag is then sent to a server, which responds with a token that is printed by a DYMO printer. The UI is built using HTML5.

<h3>System Requirements</h3>
This application is tested on MAC OSX 10.9.4 only. In order to use it on different operative systems, you should download the compatible version of node-webkit (https://github.com/nwjs/nw.js/tree/master), and re-build the serialport native module that you find inside the node_modules folder. 
In order to do that, ensure you have nodejs and node package manager (npm) installed on your machine, then run
```npm install -g nodewebkit@0.10.5``` 
```npm install -g node-pre-gyp``` 
```$ cd node_modules/serialport```
```$ node-pre-gyp build --runtime=node-webkit --target=0.10.5```

Where --target is the version of node-webkit you are using

<h3>Requirements</h3>
In order to scan scards, you should have an arduino board compatible with RFID-RC522 reader. After have connected them properly, upload the sketch you find in ```Arduino``` folder into your board using the Arduino IDE you can find here: http://arduino.cc/en/pmwiki.php?n=main/software. Pay attention to import rfid.zip as library into arduino IDE before uploading the sketch.

In order to connect to arduino through serialport, you should ensure that you have at a minimum the xCode Command Line Tools installed appropriate for your system configuration. If you recently upgraded the OS, it probably removed your installation of Command Line Tools. 

To print labels, you need to install the DYMO label manager software (v.8), that is available here: http://www.dymo.com/en-US/dymo-user-guides
And obviously, you need to have a compatible printer plugged into your computer.

<h3>Run application</h3>
Download the zip project or git clone the repository in your desktop. 

On MAC OSX, from the project's root, do:
```$ node-webkit.app/Contents/MacOS/node-webkit  ```


for different OS check the nodewebkit documentation: https://github.com/nwjs/nw.js/tree/master
