<h2>unipiazza Scan and Print</h2>
This application is used at unipiazza for scanning NFC devices, send the tag to the server, and print the server generated token on a label. 

<h3>Hardware requirements</h3>
- an Arduino Board (http://arduino.cc/);
- an RFID-MFRC522 module for Arduino (http://playground.arduino.cc/Learning/MFRC522, http://www.nxp.com/documents/data_sheet/MFRC522.pdf);
- a Dymo printer;

<h3>System Requirements</h3>
This application is built using standard web technologies: HTML5, CSS3, Javascript. It uses some native and third party nodejs modules for accessing serial ports and DYMO printer. 
It is run by node-webkit and it should be compatible with any node-webkit supported OS (Mac, Windows, Linux). 

Please note this application has been tested only on Mac Os 10.9.4.

<h3>Installation</h3>
The fastest way to install node-webkit is using node package manager (npm). Ensure to have ```nodejs``` and ```npm``` installed on your machine before running ```$ npm```.
```npm install -g nodewebkit@0.10.5``` 
```npm install -g node-pre-gyp``` 
```$ cd node_modules/serialport```
```$ node-pre-gyp build --runtime=node-webkit --target=0.10.5```

Where--target is the version of node-webkit you are using



