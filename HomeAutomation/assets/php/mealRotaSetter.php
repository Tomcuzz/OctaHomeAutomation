<?php
	require_once('/HomeControlPhpScripts/SQLFunctions.php');
	require_once('/HomeControlPhpScripts/mysqlProtect.php');
	
	$name = $_POST['name'];
	$value = $_POST['value'];
	
	$value = $value - 2;
	
	$recipes = getRecipes();
	
	$setMeal = $recipes[$value]["Name"];
	
	$id = str_replace ("meal", "", $name);
	
	$cookTable = getCookTableForWeb();
	
	$day = $cookTable[$id]["day"];
	$month = $cookTable[$id]["month"];
	$year = $cookTable[$id]["year"];
	
	
	// To protect MySQL injection (more detail about MySQL injection)
	$setMeal = SqlProtectVeriable($setMeal);
	$day = SqlProtectVeriable($day);
	$month = SqlProtectVeriable($month);
	$year = SqlProtectVeriable($year);
	
	$sql = "UPDATE `mealRota` SET `meal`='$setMeal' WHERE `day`='$day' AND `month`='$month' AND `year`='$year'";
	
	performQuery($sql);
	
	header("HTTP/1.0 200 OK");
?>