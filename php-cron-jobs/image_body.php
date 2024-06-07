<?php
$sqlUniqueID = "SELECT property_id, matrix_unique_id, MLSNumber, PhotoCount, FullAddress FROM properties 
WHERE AllPixDownloaded='No' ORDER BY Status ASC, RAND() ASC LIMIT $limit"; //AND MLSNumber='221016013' 
$matRslt = mysqli_query($conn, $sqlUniqueID) or die(mysqli_error($conn));
$idExst = mysqli_num_rows($matRslt);
if ($idExst > 0) {

    while ($row = mysqli_fetch_array($matRslt)) {

        $property_id = $row['property_id'];
        $matrix_unique_id = $row['matrix_unique_id'];
        $MLSNumber = $row['MLSNumber'];
        $PhotoCount = $row['PhotoCount'];
        $PropertyAddress = $row['FullAddress'];

        /** LargePhoto or Photo or XLargePhoto
        Photo: listings
        XLargePhoto: property dtails
         **/

        $imgName = preg_replace("/[^a-zA-Z0-9-_]+/", "-", $PropertyAddress);
        $AllPictures = array();

        $photos = $rets->GetObject('Property', 'XLargePhoto', $matrix_unique_id, '*', 0);
        $counter = 0;

        foreach ($photos as $photo) {
            $isError = $photo->isError();
            $getError = $photo->getError(); // returns a \PHRETS\Models\RETSError
            $ContentType = $photo->getContentType();
            $image = $photo->getContent();

            $ThisImgPic = "listings_images/$imgName-$matrix_unique_id-$MLSNumber-$counter.jpeg";

            if (!file_exists($main_path . "$ThisImgPic")) {
                if (!$isError) {
                    file_put_contents($main_path . "$ThisImgPic", $image);
                } else {
                    print_r($getError);
                }
            }

            array_push($AllPictures, PROP_IMAGE_URL . "/" . $ThisImgPic);
            $counter++;
        }

        $AllPictures = json_encode($AllPictures);
        $up = "UPDATE properties SET AllPixDownloaded='Yes', Images='$AllPictures' WHERE property_id='$property_id'";
        $upRslt = mysqli_query($conn, $up) or die(mysqli_error($conn));

        echo "$counter Downloaded for $MLSNumber <br />";
    }
} else {
    echo 'Not found';
}
