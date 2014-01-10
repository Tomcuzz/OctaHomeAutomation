<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
	<?php
	    require_once("/var/www/assets/php/Head.php");
	    echo getHead("503 Service Unavailable");
	 ?>

  <body>

    <?php
	    require_once("/var/www/assets/php/NavBar.php");
	    echo getNavBar("");
	?>

    <div class="container">

      <h1>503 Service Unavailable</h1>
      <p>Sorry the page you have requested could not be loaded at this current time.
	<br>
		<script type="text/javascript" >
			document.write(location.href);
		</script>
	<br> All you get is this message and a barebones HTML document.
	</p>

    </div> <!-- /container -->

    <!-- Le javascript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <?php
	    require_once("/var/www/assets/php/JavaScript.php");
	    echo getJavaInports();
	 ?>

  </body>
</html>
