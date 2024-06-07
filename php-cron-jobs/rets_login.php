<?php

/** First1.us **/
$rets_login_url = 'https://matrix.swflamls.com/rets/login.ashx';
$rets_username = 'NAPNMVP1';
$rets_password = 'ag2021mv7p112';
$user_agent = 'PHRETS/2.0';
$user_agent_password = '';
$rets_version = '1.8';
/** First1.us **/

/** thecatskillsrealtor.com **
$rets_login_url = 'http://rets172lax.raprets.com:6103/Columbia/CLNY/login.aspx';
$rets_username = 'rets windsta';
$rets_password = 'RETS102623';
$user_agent = 'rets windsta';
$user_agent_password = 'RETS102623';
$rets_version = '1.7.2';
/** thecatskillsrealtor.com **/

date_default_timezone_set('America/New_York');
if ($via == 'local') {
    include "connect.php";
} else {
    include "/home/u110616855/domains/thecatskillsrealtor.us/public_html/php-cron-jobs/connect.php";
}

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
//error_reporting(0);

if ($via == 'local') {
    require_once("../vendor/autoload.php");
} else {
    require_once("/home/u110616855/domains/thecatskillsrealtor.us/public_html/vendor/autoload.php");
}

$start_time = date('Y-m-d H:i:s');

$config = new \PHRETS\Configuration;
$config->setLoginUrl($rets_login_url);
$config->setUsername($rets_username);
$config->setPassword($rets_password);

// optional.  value shown below are the defaults used when not overridden
$config->setRetsVersion($rets_version); // see constants from \PHRETS\Versions\RETSVersion
$config->setUserAgent($user_agent);
$config->setUserAgentPassword($user_agent_password); // string password, if given
$config->setHttpAuthenticationMethod('digest'); // 'digest' 'or 'basic'  if required 
$config->setOption('use_post_method', false); // boolean
$config->setOption('disable_follow_location', false); // boolean

$rets = new \PHRETS\Session($config);
$login = $rets->Login();
