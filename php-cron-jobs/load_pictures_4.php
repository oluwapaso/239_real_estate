<?php
ini_set('max_execution_time', 7200); //600 seconds = 10 minutes 
ini_set('memory_limit', '512M');

$via = 'local'; //local //live

if ($via == 'local') {
    $path = "";
    $main_path = "../";
} else {
    $path = "/home/u110616855/domains/first1.us/public_html/php-cron-jobs/";
    $main_path = "/home/u110616855/domains/first1.us/public_html/";
}

$fp = fopen($path . "locks/load_pictures_4.txt", "w+");
/** /usr/bin/php /home/u110616855/domains/first1.us/public_html/cron_jobs/load_pictures_4.php **/
/** /bin/sh /home/u110616855/domains/first1.us/public_html/cron_jobs/load_pictures_4.sh **/
/** http://local.first1.us/php-cron-jobs/load_pictures_4.php **/

if (flock($fp, LOCK_EX | LOCK_NB)) { // do an exclusive lock

    include_once $path . 'rets_login.php';
    $limit = 25; //25

    /* Query Server */
    if ($login) {

        include "image_body.php";

        $rets->Disconnect();
    } else {
        $error = $rets->Error();
        print_r($error);
    }

    flock($fp, LOCK_UN); // release the lock 
} else {
    die();
}
fclose($fp);
