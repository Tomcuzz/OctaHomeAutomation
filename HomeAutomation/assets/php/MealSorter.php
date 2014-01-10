<?php
function checkIfCorrectMealDay() {
	require_once('/HomeControlPhpScripts/SQLFunctions.php');
	
	$cookTable = getCookTableForWeb();
	
	$cookIdTable = getCookIdsTableForWeb();
	
	$firstCookTableItem = $cookTable[0];
	
	if (($firstCookTableItem['day'] != date('d')) || ($firstCookTableItem['month'] != date('m')) || ($firstCookTableItem['year'] != date('Y'))) {
		while (($firstCookTableItem['day'] != date('d')) || ($firstCookTableItem['month'] != date('m')) || ($firstCookTableItem['year'] != date('Y'))) {
			$day   = $firstCookTableItem['day'];
			$month = $firstCookTableItem['month'];
			$year  = $firstCookTableItem['year'];
			
			$lastDay = $cookTable[6]['day'];
			$lastMonth = $cookTable[6]['month'];
			$lastYear = $cookTable[6]['year'];
			
			$next7Date  = mktime(0, 0, 0, $lastMonth, $lastDay + 1, $lastYear);
			
			$next7Day = date('d', $next7Date);
			$next7Mounth = date('m', $next7Date);
			$next7Year = date('Y', $next7Date);
			$next7DoW = date('w', $next7Date);
			
			$next7CookId = $cookTable[6]["cookId"] - 1;
			if ($next7CookId < 0) $next7CookId = 2;
			$next7CleanId = $cookTable[6]["cleanerId"] - 1;
			if ($next7CleanId < 0) $next7CleanId = 2;
			
			
			performQuery("INSERT INTO `mealRota`(`day`, `month`, `year`, `weekDayId`, `cookId`, `meal`, `cleanerId`) VALUES ('$next7Day','$next7Mounth','$next7Year','$next7DoW','$next7CookId','','$next7CleanId')");
			
			performQuery("DELETE FROM `mealRota` WHERE `day`='$day'");
			
			$cookTable = getCookTableForWeb();
			
			$firstCookTableItem = $cookTable[0];
		}
		return true;
	} else {
		return false;
	}
}
?>