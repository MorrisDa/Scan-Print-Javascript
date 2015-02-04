
/* 
 * Typical pin layout used:
 * ------------------------------------------------------------
 *             MFRC522      Arduino       Arduino   Arduino
 *             Reader/PCD   Uno           Mega      Nano v3
 * Signal      Pin          Pin           Pin       Pin
 * ------------------------------------------------------------
 * RST/Reset   RST          9             5         D9
 * SPI SS      SDA(SS)      10            53        D10
 * SPI MOSI    MOSI         11 / ICSP-4   51        D11
 * SPI MISO    MISO         12 / ICSP-1   50        D12
 * SPI SCK     SCK          13 / ICSP-3   52        D13
 */

#include <SPI.h>
#include <MFRC522.h> //be sure of including this library available at: https://github.com/miguelbalboa/rfid
 

#define RST_PIN         9           // Configurable, see typical pin layout above
#define SS_PIN          10          // Configurable, see typical pin layout above

MFRC522 mfrc522(SS_PIN, RST_PIN);   // Create MFRC522 instance.

/**
 * Initialize.
 */
void setup() {
    Serial.begin(9600); // Initialize serial communications with the PC, using standard baudrate
    SPI.begin();     // Init SPI bus
    
    mfrc522.PCD_Init(); // Init MFRC522 card reader
    
    //initialize digital pin 5 as an output.
    pinMode(5, OUTPUT);
}

/**
 * Main loop.
 */
byte is;
void loop() {

    // Look for new cards
    if (!mfrc522.PICC_IsNewCardPresent())
      return;

    // Select one of the cards
    if ( ! mfrc522.PICC_ReadCardSerial())
      return;//stop the loop
   
    dump_byte_array(mfrc522.uid.uidByte, mfrc522.uid.size);
    
    mfrc522.PICC_HaltA(); //prevent form re-reading the just read card;
    
  //Led on on pin 5. 
  digitalWrite(5, HIGH);   // turn the LED on (HIGH is the voltage level)
  delay(500);              // wait for half a second
  digitalWrite(5, LOW);    // turn the LED off by making the voltage LOW 
}

/**
 * Helper routine to dump a byte array as hex values to Serial.
 */
void dump_byte_array(byte *buffer, byte bufferSize) {
  //Baud Rate doesn't allow data to be sent in a single packet, so we use w to identify beginning of packet and z to identify the end
  Serial.print("w");
    for (byte i = 0; i < bufferSize; i++) {
        Serial.print(buffer[i] < 0x10 ? "0" : "");
        Serial.print(buffer[i], HEX);
    }
   Serial.print("z");
}
