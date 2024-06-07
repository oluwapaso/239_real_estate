<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");

function getWalkScore($lat, $lon, $address, $api_key)
{
    $address = urlencode($address);
    $url = "https://api.walkscore.com/score?format=json&address=$address";
    $url .= "&lat=$lat&lon=$lon&wsapikey=$api_key";
    $str = @file_get_contents($url);
    return $str;
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$api_key = $_GET['api_key'];
$address = stripslashes($_GET['address']);
$json = getWalkScore($lat, $lon, $address, $api_key);
echo $json;
