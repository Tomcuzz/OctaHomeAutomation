<?php
	require_once('/HomeControlPhpScripts/SQLFunctions.php');
	
	$roomName = $_GET["room"];
	$targetTemp = $_POST["value"];
	
	if ($targetTemp == "") {
		$targetTemp = "25";
	}
	
	$rooms = getArrayForQuery("UPDATE `Rooms` SET `TargetTemp`='$targetTemp' WHERE `Name`='$roomName'");
	header("HTTP/1.0 200 OK");
?>