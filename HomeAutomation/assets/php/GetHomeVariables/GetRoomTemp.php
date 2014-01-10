<?php
	require_once('/HomeControlPhpScripts/SQLFunctions.php');
	
	$roomName = $_GET["room"];
	$rooms = getArrayForQuery("SELECT * FROM `Rooms` WHERE `Name`='$roomName'");
    $room = $rooms[0];
    echo $room["Temperature"];
?>