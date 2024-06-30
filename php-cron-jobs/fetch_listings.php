<?php
ini_set('max_execution_time', 7200); //600 seconds = 10 minutes 
ini_set('memory_limit', '512M');

$from = 'fetch';
$via = 'local'; //local //live

if ($via == 'local') {
    $path = "";
} else {
    $path = "/home/u110616855/domains/first1.us/public_html/php-cron-jobs/";
}

$fp = fopen($path . "locks/fetch_listings.txt", "w+");
/** /usr/bin/php /home/u110616855/domains/first1.us/public_html/cron_jobs/fetch_res.php **/
/** /bin/sh /home/u110616855/domains/first1.us/public_html/cron_jobs/fetch_res.sh **/
/** http://local.first1.us/php-cron-jobs/fetch_listings.php **/

if (flock($fp, LOCK_EX | LOCK_NB)) { // do an exclusive lock

    include_once $path . 'rets_login.php';

    /* Query Server */
    if ($login) {

        $sqlSync = "SELECT * FROM listings_sync WHERE sync_id='1' AND 
        (RES='Pending' OR RIN='Pending' OR LOT='Pending' OR COM='Pending' OR RNT='Pending' OR DOCK='Pending')";
        $syncRslt = mysqli_query($conn, $sqlSync) or die(mysqli_error($conn));
        $num_rows = mysqli_num_rows($syncRslt);

        if ($num_rows < 1) {
            die("Seems all properties class has been downloaded.");
        }

        $row = mysqli_fetch_assoc($syncRslt);
        $RES = $row['RES'];
        $RIN = $row['RIN'];
        $LOT = $row['LOT'];
        $COM = $row['COM'];
        $RNT = $row['RNT'];
        $DOCK = $row['DOCK'];

        $defaultClass = "RES";
        if ($RES == "Done") {
            if ($RIN == "Done") {
                if ($LOT == "Done") {
                    if ($RNT == "Done") {
                        if ($COM == "Done") {
                            $defaultClass = "DOCK";
                        } else {
                            $defaultClass = "COM";
                        }
                    } else {
                        $defaultClass = "RNT";
                    }
                } else {
                    $defaultClass = "LOT";
                }
            } else {
                $defaultClass = "RIN";
            }
        }

        $sqlOffset = "SELECT COUNT(property_id) AS `offset` FROM properties WHERE PropertyClass='$defaultClass'";
        $offRslt = mysqli_query($conn, $sqlOffset) or die(mysqli_error($conn));
        $off_row = mysqli_fetch_assoc($offRslt);
        // $offset = 0;
        $offset = $off_row['offset'];

        /**
        Status 
        -------
        A	A	Active
        AP	AP	Application In Progress
        P	P	Pending
        PC	PC	Pending With Contingencies
        R	R	Rented
        S	S	Sold
         **/

        //$status_ftch = 'A,S,AP,P,PC';
        $resources = 'Property';
        $status_ftch = 'A';

        $results = $rets->Search(
            "Property",
            $defaultClass,
            '(Status=|' . $status_ftch . '), (MatrixModifiedDT=1900-01-01T00:00:00+)',
            [
                'Limit' => 150,
                'Offset' => $offset,
                'QueryType' => 'DMQL2',
                'Format' => 'COMPACT-DECODED'
            ]
        );

        // echo "<pre>";
        // print_r($results->toArray());
        // echo $results->getTotalResultsCount();
        // echo "</pre>";

        $listingsExist = count($results);
        //echo $listingsExist;
        //die();

        $counter = 0;
        if ($listingsExist > 1) {
            /** it will still fetch the last id so incase it reaches end, it must be reater than 1 **/

            include_once $path . 'fetch_body.php';

            echo $counter . ' Properties added';

            $rets->Disconnect();
        } else {

            $updateSyncs = "UPDATE listings_sync SET $defaultClass='Done' WHERE sync_id='1'";
            $upRslt = mysqli_query($conn, $updateSyncs) or die(mysqli_error($conn));
            $isUpdeted = mysqli_affected_rows($conn);

            if ($isUpdeted >= 0) {
                echo $defaultClass . " is done";
            } else {
                echo "Error setting $defaultClass to Done";
            }

            $rets->Disconnect();
        }
    } else {
        $error = $rets->Error();
        print_r($error);
    }

    flock($fp, LOCK_UN); // release the lock 
} else {
    die();
}
fclose($fp);
