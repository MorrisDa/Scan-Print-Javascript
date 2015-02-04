(*

DYMO Label Software v8 SDK

This example demonstrates how to create a new label from scratch by adding a new Counter Object and setting its attributes.

*)

tell application "Finder" to get folder of (path to me) as Unicode text
set workingDir to POSIX path of result
set B to workingDir & "../_Template/label.label"
tell application "DYMO Label"
	
	openLabel in B
	
	redrawLabel
	printLabel
	
end tell