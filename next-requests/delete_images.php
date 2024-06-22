<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");

// Read the raw POST data
$input_data = file_get_contents("php://input");

// Decode the JSON data into a PHP array
$images_data = json_decode($input_data, true);

// Check if the images array is present
if (isset($images_data['images'])) {
    $images = $images_data['images'];

    // Loop through each image and delete it
    foreach ($images as $image) {
        // Check if the image exists and delete it
        if (file_exists($image)) {
            unlink($image);
        }
    }

    // Return a success message
    $response = array("success" => true, "message" => "Images deleted successfully");
    
} else {
    // Return an error message if the images array is missing
    $response = array("success" => false, "message" => "Images array is missing");
}

// Encode the response as JSON and output it
echo json_encode($response);
?>