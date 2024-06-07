<?php
ini_set('max_execution_time', 7200); //600 seconds = 10 minutes 
ini_set('memory_limit', '512M');

$from = 'update';
$via = 'local'; //local //live

if ($via == 'local') {
    $path = "";
} else {
    $path = "/home/u110616855/domains/first1.us/public_html/php-cron-jobs/";
}

$fp = fopen($path . "locks/update_listings.txt", "w+");
/** /usr/bin/php /home/u110616855/domains/first1.us/public_html/cron_jobs/update_listings.php **/
/** /bin/sh /home/u110616855/domains/first1.us/public_html/cron_jobs/update_listings.sh **/
/** http://local.first1.us/php-cron-jobs/update_listings.php **/

if (flock($fp, LOCK_EX | LOCK_NB)) { // do an exclusive lock

    include_once $path . 'rets_login.php';

    /* Query Server */
    if ($login) {

        //$classes = ["RES", "RIN", "LOT", "COM", "RNT", "DOCK"];
        $classes = ["RNT"];
        $limit = 3;

        foreach ($classes as $defaultClass) {

            $skip_col_date = $defaultClass . "_Date";
            $skip_col_count = $defaultClass . "_Skip";
            $modified_date = "";
            $offset = 0;

            $sqlSkips = "SELECT $skip_col_date, $skip_col_count FROM refresh_skips WHERE skip_id='1' ";
            $skipRslt = mysqli_query($conn, $sqlSkips) or die(mysqli_error($conn));
            $skip_row = mysqli_fetch_assoc($skipRslt);
            $skip_date = $skip_row[$skip_col_date];
            $skip_count = intval($skip_row[$skip_col_count]);

            if ($skip_date && $skip_date != "" && $skip_date != "0000-00-00 00:00:00" && $skip_count > 0) {

                $modified_date = $skip_date;
                $modified_date = str_replace(" ", "T", $modified_date) . "+";
                $offset = $skip_count;
                echo "Using skipped<br/>";
            } else {

                $sqlNewest = "SELECT MatrixModifiedDT FROM properties WHERE PropertyClass='$defaultClass' ORDER BY MatrixModifiedDT DESC LIMIT 1 ";
                $newestRslt = mysqli_query($conn, $sqlNewest) or die(mysqli_error($conn));
                $new_row = mysqli_fetch_assoc($newestRslt);
                if ($new_row) {
                    $modified_date = $new_row['MatrixModifiedDT'];
                    $modified_date = str_replace(" ", "T", $modified_date) . "+";
                } else {
                    $modified_date = "1900-01-01T00:00:00+";
                }
                echo "Using newest<br/>";
            }

            //$status_ftch = 'A,S,AP,P,PC';
            $status_ftch = 'A';

            $results = $rets->Search(
                "Property",
                $defaultClass,
                '(Status=|' . $status_ftch . '), (MatrixModifiedDT=' . $modified_date . ')',
                [
                    'Limit' => $limit,
                    'Offset' => $offset,
                    'QueryType' => 'DMQL2',
                    'Format' => 'COMPACT-DECODED'
                ]
            );

            // echo "<pre>";
            // print_r($results->toArray());
            // echo $results->getTotalResultsCount();
            // echo "</pre>";

            $total_listings = $results->getTotalResultsCount();
            $listingsExist = count($results);
            // echo "$total_listings - $listingsExist";
            // die();

            $counter = 0;
            if ($listingsExist > 0) {

                include $path . 'fetch_body.php';

                echo $counter . ' Properties updated out of ' . $listingsExist . ' <br/>';

                $new_skip = $skip_count + $counter;

                if ($total_listings > $new_skip) {
                    $modifiedDate = str_replace("T", " ", $modified_date);
                    $modifiedDate = str_replace("+", "", $modifiedDate);
                    $updateSkips = "UPDATE refresh_skips SET $skip_col_date='$modifiedDate', $skip_col_count='$new_skip' WHERE skip_id='1'";
                } else {
                    $updateSkips = "UPDATE refresh_skips SET $skip_col_date=NULL, $skip_col_count='0' WHERE skip_id='1'";
                }

                $upRslt = mysqli_query($conn, $updateSkips) or die(mysqli_error($conn));
                $isUpdeted = mysqli_affected_rows($conn);

                if ($isUpdeted >= 0) {
                    echo  "$skip_col_date will now skip $new_skip properties";
                } else {
                    echo "Error updating $skip_col_date skips";
                }
            } else {

                $updateSkips = "UPDATE refresh_skips SET $skip_col_date=NULL, $skip_col_count='0' WHERE skip_id='1'";
                $upRslt = mysqli_query($conn, $updateSkips) or die(mysqli_error($conn));
                $isUpdeted = mysqli_affected_rows($conn);

                if ($isUpdeted >= 0) {
                    echo  "$skip_col_date will now skip 0 properties";
                } else {
                    echo "Error resetting $skip_col_date skips";
                }
            }
        }

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
