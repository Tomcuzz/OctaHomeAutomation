<?php
session_start();
?>
<!DOCTYPE html>
<html lang="en">
	<?php
	    require_once("/var/www/assets/php/Head.php");
	    echo getHead("504 Gateway Timeout");
	 ?>

  <body>

    <?php
	    require_once("/var/www/assets/php/NavBar.php");
	    echo getNavBar("");
	?>

    <div class="container">

      <h1>504 Gateway Timeout</h1>
      <p>Sorry the page you have requested could not be loaded as there was error with your proxy server.
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
