<?php
function getHead($pageTitle) {
	$toEcho = "<head>
    <meta charset=\"utf-8\">
    <title>".$pageTitle."</title>
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <meta name=\"description\" content=\"\">
    <meta name=\"author\" content=\"Thomas Cousin\">

    <!-- Le styles -->
    <link href=\"assets/css/sidebar-scroll-fixer.css\" rel=\"stylesheet\">
    <link href=\"assets/css/bootstrap.css\" rel=\"stylesheet\">
    <link href=\"assets/css/bootstrap-responsive.css\" rel=\"stylesheet\">
    <link href=\"assets/css/docs.css\" rel=\"stylesheet\">
    <link href=\"assets/js/google-code-prettify/prettify.css\" rel=\"stylesheet\">

    <!-- Le HTML5 shim, for IE6-8 support of HTML5 elements -->
    <!--[if lt IE 9]>
      <script src=\"assets/js/html5shiv.js\"></script>
    <![endif]-->

    <!-- Le fav and touch icons -->
    <link rel=\"apple-touch-icon-precomposed\" sizes=\"144x144\" href=\"assets/icon/icon-144.png\">
    <link rel=\"apple-touch-icon-precomposed\" sizes=\"114x114\" href=\"assets/icon/icon-114.png\">
      <link rel=\"apple-touch-icon-precomposed\" sizes=\"72x72\" href=\"assets/icon/icon-72.png\">
                    <link rel=\"apple-touch-icon-precomposed\" href=\"assets/icon/icon-57.png\">
                                   <link rel=\"shortcut icon\" href=\"assets/icon/icon.png\">

  </head>";
	return $toEcho;
}
?>