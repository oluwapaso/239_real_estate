<?php
define('SENDGRID', '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');
define('WEBMAPAPI', 'AIzaSyBQwpzlVeV9AI6FETYYUmLt730XEKRdfAY');
define('WEBWALKSCOREAPI', 'cf66cfb898e43c9bffe844b3409e589f');
define('FBAPPID', '347251250481799'); //347251250481799
define('FBAPPSECRET', '8088455fa7bd64322caec2d13d78d222'); //8088455fa7bd64322caec2d13d78d222
define('PROP_IMAGE_URL', 'http://local.first1.us');

//define('FBAPPID','574803049948658');
//define('FBAPPSECRET','96c78630a36d5f964da10e44bc397f2b');

error_reporting(0);
$conn = mysqli_connect("localhost", "root", "", "first_1_us");
//$conn = mysqli_connect("localhost","u110616855_hybrid_pro","J#i1qwPNBQ","u110616855_real_estate");

// Check connection
if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
} else {
    //echo 'connected';
}

function filterThis($string, $conn)
{
    $string = strip_tags($string, '<br /><br/><br>');
    $string = mysqli_real_escape_string($conn, $string);
    $string = trim($string);
    //$string = htmlentities($string);
    return $string;
}
