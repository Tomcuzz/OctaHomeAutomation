<?php
function getNavBar($page) {
	$toEcho = "<div class=\"navbar navbar-fixed-top\">
	<div class=\"navbar-inner\">
	<div class=\"container-fluid\">
	<button type=\"button\" class=\"btn btn-navbar\" data-toggle=\"collapse\" data-target=\".nav-collapse\">
	<span class=\"icon-bar\"></span>
	<span class=\"icon-bar\"></span>
	<span class=\"icon-bar\"></span>
	</button>
	<a class=\"brand\" href=\"./index.html\">DecadeDev</a>
	<div class=\"nav-collapse collapse\">
	<p class=\"navbar-text pull-right\">
	".returnLogin()."
	</p>
		<ul class=\"nav\">
		  	<li class=\"".checkActiveForPlace($page, "Home")."\">
			  	<a href=\"./home.php\">Home</a>
			</li>
		  	<li class=\"".checkActiveForPlace($page, "Home Stats")."\">
				<a href=\"./home-stats.php\">Home Stats</a>
			</li>
		 	<li class=\"".checkActiveForPlace($page, "Security")."\">
				<a href=\"./security.php\">Security</a>
			</li>
		  	<li class=\"".checkActiveForPlace($page, "Lights")."\">
				<a href=\"./light-control.php\">Lights</a>
			</li>
			</li>
		  	<li class=\"".checkActiveForPlace($page, "Alarm")."\">
				<a href=\"./alarm.php\">Alarm</a>
			</li>
		  	<li class=\"".checkActiveForPlace($page, "Curtains")."\">
				<a href=\"./curtains.php\">Curtains</a>
			</li>
		  	<li class=\"".checkActiveForPlace($page, "Temperature")."\">
		    	<a href=\"./temp-control.php\">Temperature</a>
		    </li>
			<li class=\"".checkActiveForPlace($page, "Audio/Visual")."\">
				<a href=\"./audio-visual.php\">Audio/Visual</a>
			</li>
	      	<li class=\"".checkActiveForPlace($page, "Meals")."\">
	        	<a href=\"./meals.php\">Meals</a>
	        </li>
			<li class=\"".checkActiveForPlace($page, "Recipes")."\">
				<a href=\"./recipes.php\">Recipes</a>
			</li>
	      	<li class=\"".checkActiveForPlace($page, "Account")."\">
	        	<a href=\"./account.php\">Account</a>
	        </li>
	      </ul>
	    </div>
	  </div>
	</div>
	</div>";
	return $toEcho;
}

function checkActiveForPlace($page, $place) {
	if ($page == $place) {
		return "active";
	} else {
		return "";
	}
}

function returnLogin() {
	if ($_SESSION['username'] != "") {
		return "Logged in as <a href=\"./account.php\" class=\"navbar-link\">".$_SESSION['username']."</a>";
	} else {
		return "Not Logged In";
	}
}
?>