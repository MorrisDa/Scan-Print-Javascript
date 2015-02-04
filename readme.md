<h2>Unipiazza Scan and Print</h2>
This application is used at unipiazza for scanning NFC devices, send the tag to the server, and print the server generated token on a label. 

<h3>Hardware requirements</h3>
- an Arduino Board (http://arduino.cc/); (or any PIC)
- an RFID-MFRC522 module for Arduino (http://playground.arduino.cc/Learning/MFRC522, (or any nfc reader compatible with your pic) http://www.nxp.com/documents/data_sheet/MFRC522.pdf);
- a Dymo printer;


<h3>Hardware installation</h3>
There's a ready sketch in ```arduino``` folder already configured for this application. You can upload it into your Arduino Board using the Arduino IDE (http://arduino.cc/en/pmwiki.php?n=main/software). Note that you have to install the rfid.zip library (https://github.com/miguelbalboa/rfid) before using the sketch. From the arduino IDE, simply do ```Sketch > Import Library``` and choose ```rfid.zip``` from the ```arduino``` folder.
<br/><br>
You can also use a different PIC just writing on the serial port you set in config.json the NFG tag (14, hex) as buffer each time is read, preceded by a 'w' and followed by 'z'. (e.g.: ```w125a4b8f4f8v7cz```). 
With these control-characters you can send fragmented packets because of baudRate and the application will care to compose them properly.

<h3>System Requirements</h3>
This application is built using standard web technologies: HTML5, CSS3, Javascript. It uses some native and third party nodejs modules for accessing serial ports. 
It is run by node-webkit and it should be compatible with any node-webkit supported OS (Mac, Windows, Linux). 

Please note this application has been tested on Mac Os 10.9.4 only.

<h3>Software requirements</h3>
- node-webkit (https://github.com/nwjs) 
<br/>
The fastest way to install node-webkit is using node package manager (npm). You can install the node-webkit version that best fit your OS. 
Ensure to have ```nodejs``` and ```npm``` installed on your machine before running ```$ npm```.
<br/><br/>
```npm install -g nodewebkit@0.10.5``` 
<br/><br/>
Check https://github.com/nwjs/nw.js/tree/master#downloads to choose the version that most fit your OS instead of 0.10.5.
<br/><br/>
- Dyno Label v.8 or later. (http://www.dymo.com/en-US/dymo-user-guides) <br/>this is need just for printing
There's a fast installer for windows and Mac.
<br/><br/>
- If something doesn't work as expected when you run the application, Ensure to have all requirements listed here: https://github.com/voodootikigod/node-serialport#installation-special-cases

<h3>Installation</h3>
If you have node-webkit installed, you are almost near to go.
There is a further step for using serial port on your computer for communicating with the PIC: this application includes a C++ addon for nodejs that should be built depending on the OS and depending on your node-webkit version. <br/>This can be done using a third party module like https://github.com/mapbox/node-pre-gyp
<br/><br/>Install node-pre-gyp:<br/>
```$ npm install -g node-pre-gyp``` <br/>
<br/>From the project route, change directory into the module that should be built:<br/>
```$ cd node_modules/serialport```<br/>
<br/>Build the module using node-pre-gyp, where target is the version of node-webkit you have installed:<br/>
```$ node-pre-gyp build --runtime=node-webkit --target=0.10.5```
<br/><br/>

<h3>Go</h3>
You are ready to go, cd with terminal into the root folder of the project (where ```package.json``` is) and simply do: 
<br/><br/>
```$ nodewebkit``` <br/><br/>

<h3>Configuration</h3>
In file config.json you can set some application's settings, like if storing the password locally for token refresh, the API endpoints for authentication and communication with server and the serial port the application will try to connect to.

<h3>Known Issues and Limitations</h3>
-On linux, node-pre-gyp need nw-gyp module installed before running<br/>
-On linux, you have to set permission of serial port to 777, otherwise the application will crash reporting and erro 'Cannot Open serialpor'. 

