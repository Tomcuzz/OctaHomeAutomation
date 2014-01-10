<?php
	require_once('/HomeControlPhpScripts/SQLFunctions.php');
	
	$selectedFan = $link = str_replace("_", " ", $_GET['fan']);
	$fans = getArrayForQuery("SELECT * FROM `TempControl` WHERE `Name`='$selectedFan'");
	$fan = $fans[0];
	//$thisFan[0] = "";
	//foreach ($devices as $item) {
	//	if ($item["Name"] == $selectedFan) {
	//		$thisFan = $item;
	//		break;
	//	}
	//}
	echo $fan["Speed"];
	//echo $thisFan["Speed"];
?>