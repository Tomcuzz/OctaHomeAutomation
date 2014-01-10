<?php
	require_once('/HomeControlPhpScripts/SQLFunctions.php');
	
	$selectedFan = $link = str_replace("_", " ", $_GET['fan']);
	$devices = getArrayForQuery("SELECT * FROM `TempControl` WHERE 1");
	
	$thisFan[0] = "";
	foreach ($devices as $item) {
		if ($item["Name"] == $selectedFan) {
			$thisFan = $item;
			break;
		}
	}
	
	echo $thisFan["TwistState"];
?>