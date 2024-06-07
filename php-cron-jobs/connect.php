<?php

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
