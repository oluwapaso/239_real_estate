<?php

include "rets-fields.php"; //Contains $resFeild

foreach ($results as $record) {

    echo "$defaultClass - MLSNumber : matrix_unique_id<br/>";

    $keys = explode(",", $resFeild); //inside "rets-fields.php";
    $escapedValues = array();

    foreach ($keys as $key) {
        $trimmedKey = trim($key); // Trim whitespace around the key
        if (isset($record[$trimmedKey])) {
            $escapedValues[$trimmedKey] = filterThis($record[$trimmedKey], $conn);
        } else {
            $escapedValues[$trimmedKey] = null; // Or set a default value if the key is not present
        }
    }

    $insValues = "";
    //print_r($escapedValues);
    foreach ($escapedValues as $key => $escapedValue) {
        // Create a variable variable
        $trimmedKey = trim($key);
        ${$trimmedKey} = $escapedValue;
        $insValues .= "'{${$trimmedKey}}',";
    }
    $insValues = rtrim($insValues, ",");

    $City = ucwords(strtolower($City));
    $Development = ucwords(strtolower($Development));
    $DevelopmentName = ucwords(strtolower($DevelopmentName));

    $PropertyAddress = $StreetNumber . ' ' . $StreetName . ' ' . $StreetSuffix . ', ' . $City . ', ' . $StateOrProvince . ' ' . $PostalCode;

    $DefaultPic = "";
    $AllPixDownloaded = "";

    $imgName = preg_replace("/[^a-zA-Z0-9-_]+/", "-", $PropertyAddress);
    $DefaultPic = "listings_images/$imgName-$matrix_unique_id-$MLSNumber-0.jpeg";

    if ($via == 'local') {
        $main_path = "../";
    } else {
        $main_path = "/home/u110616855/domains/first1.us/public_html/";
    }

    if (!file_exists($main_path . "$DefaultPic")) {

        $photos = $rets->GetObject('Property', 'LargePhoto', $matrix_unique_id, '0', 0);
        foreach ($photos as $photo) {
            $isError = $photo->isError();
            $getError = $photo->getError(); // returns a \PHRETS\Models\RETSError
            $ContentType = $photo->getContentType();
            $image = $photo->getContent();

            if (!$isError) {
                file_put_contents($main_path . "$DefaultPic", $image);
            } else {
                print_r($getError);
            }
        }
    }

    if (($MLSNumber != '') && ($matrix_unique_id != '')) {

        echo "$defaultClass - $MLSNumber : $matrix_unique_id<br/>";
        /** Build for update **/
        $insFields = "";
        $upFields = "";
        foreach ($keys as $ths_feild) {
            $ths_feild = trim($ths_feild);
            if ($ths_feild) {
                $insFields .= "`$ths_feild`,";
                $upFields .= " `$ths_feild`=VALUES(`$ths_feild`),";
            }
        }
        $insFields = rtrim($insFields, ",");
        //$upFields = rtrim($upFields, ",");
        $upFields .= "`PropertyClass`='$defaultClass', `DefaultPic`='$DefaultPic', `AllPixDownloaded`='No'";
        /** Build for update **/

        $date = date("Y-m-d");
        $addOneByOne = "INSERT INTO properties(`PropertyClass`,$insFields,`DefaultPic`,`AllPixDownloaded`,`DateAdded`) VALUES ('$defaultClass',$insValues,'$DefaultPic','No','$date') ON DUPLICATE KEY UPDATE $upFields";
        $oneByOneRslt = mysqli_query($conn, $addOneByOne) or die(mysqli_error($conn));

        if ($oneByOneRslt) {
            echo "Property: $matrix_unique_id($Status) added<br/>";
        } else {
            echo "Unable to add $matrix_unique_id <br/>";
        }

        $counter++;
    } else {
        echo "Something is missing $MLSNumber -- $matrix_unique_id <br/>";
    }
}
