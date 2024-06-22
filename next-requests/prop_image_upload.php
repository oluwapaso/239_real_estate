<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");

// Check if the image file was uploaded
if ($_FILES["image"]["error"] == UPLOAD_ERR_OK) {
    // Specify the folder where the image will be saved
    $target_dir = "../property_images/";
    // Get the temporary file name of the uploaded file
    $temp_name = $_FILES["image"]["tmp_name"];
    // Generate a unique file name for the image
    $target_file = $target_dir . basename($_FILES["image"]["name"]);

    // Create an image object from the uploaded file
    $image = imagecreatefromjpeg($temp_name);
    
    // Reduce the quality of the image to 50% (change 50 to your desired quality)
    imagejpeg($image, $target_file, 50);

    // Return the path to the uploaded image
    echo $target_file;
} else {
    // Return an error message if the file upload failed
    echo "Error uploading file";
}
?>