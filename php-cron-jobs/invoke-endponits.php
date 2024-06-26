<?php
error_reporting(E_ALL);
$base_url = "http://localhost:3000";
//$base_url = "https://239re.com";
$api_base_url = "https://www.239re.com";

$endpoints = array(
    // "$base_url/php-cron-jobs/fetch_listings.php", //Comment this for update_listings.php
    // //"$base_url/php-cron-jobs/update_listings.php",//Comment this for fetch_listings.php
    // "$base_url/php-cron-jobs/load_pictures_1.php",
    // "$base_url/php-cron-jobs/load_pictures_2.php",
    // "$base_url/php-cron-jobs/load_pictures_3.php",
    // "$base_url/php-cron-jobs/load_pictures_4.php",
    // "$api_base_url/api/send-alert",
    // "$api_base_url/api/send-queue-emails",
);

$mh = curl_multi_init();

foreach ($endpoints as $url) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_multi_add_handle($mh, $ch);
}

$running = null;
do {
    curl_multi_exec($mh, $running);
} while ($running > 0);

curl_multi_close($mh);
