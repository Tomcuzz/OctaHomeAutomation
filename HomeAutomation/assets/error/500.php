<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">

	<?php
	    require_once("/var/www/assets/php/Head.php");
	    echo getHead("500 Internal Error");
	 ?>

  <body>

    <?php
	    require_once("/var/www/assets/php/NavBar.php");
	    echo getNavBar("");
	?>

    <div class="container">

      <h1>500 Internal Error</h1>
      <p>Sorry the page you have requested could not be loaded as there was an internal server error.
	<br>
		<script type="text/javascript" >
			document.write(location.href);
		</script>
	<br>
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
