<?php
// Allow requests from any origin
header("Access-Control-Allow-Origin: *");

// Check if the image file was uploaded
if ($_FILES["image"]["error"] == UPLOAD_ERR_OK) {
    // Specify the folder where the image will be saved

    $upload_type = $_POST["upload_type"];

    if ($upload_type == "logo") {
        $target_dir = "../logos/";
    } else if ($upload_type == "agent_dp") {
        $target_dir = "../agents_dp/";
    } else if ($upload_type == "blog_header") {
        $target_dir = "../blog_uploads/";
    } else if ($upload_type == "header") {
        $target_dir = "../page_headers/";
    } else if ($upload_type == "community_header" || $upload_type == "city_header" || $upload_type == "service_header") {
        $target_dir = "../community_uploads/";
    }

    $tmp_name = $_FILES["image"]["tmp_name"];
    $name = basename($_FILES["image"]["name"]);
    $name = preg_replace('/[^a-zA-Z0-9]/', '-', $name);

    // Move the uploaded file to a desired location
    if (move_uploaded_file($tmp_name, $target_dir . $name)) {

        $old_logo = $_POST["old_logo"];
        if ($upload_type == "logo" && $old_logo != "") {
            unlink($old_logo);
        }

        $old_dp = $_POST["old_dp"];
        if ($upload_type == "agent_dp" && $old_dp != "") {
            unlink($old_dp);
        }

        $old_header = $_POST["old_header"];
        if ($upload_type == "header" && $old_header != "") {
            unlink($old_header);
        }

        $old_header_image_loc = $_POST["old_header_image_loc"];
        $submit_type = $_POST["submit_type"];
        $pub_image_loc = $_POST["pub_image_loc"];
        $draft_image_loc = $_POST["draft_image_loc"];
        if ($upload_type == "blog_header" || $upload_type == "community_header" || $upload_type == "service_header") {

            //Delete old image if exist
            if ($old_header_image_loc != "" && $old_header_image_loc != $pub_image_loc && $submit_type == "Draft") {
                unlink($old_header_image_loc);
            }

            //Delete old image if exist
            if ($submit_type == "Publish") {

                if ($pub_image_loc != "") {
                    unlink($pub_image_loc);
                }

                if ($old_header_image_loc != "") {
                    unlink($old_header_image_loc);
                }
            }
        }

        if ($upload_type == "city_header") {

            //Delete old image if exist
            if ($draft_image_loc != "" && $draft_image_loc != $old_header_image_loc && $submit_type == "Draft") {
                unlink($draft_image_loc);
            }

            //Delete old image if exist
            if ($submit_type == "Publish") {

                if ($old_header_image_loc != "") {
                    unlink($old_header_image_loc);
                }

                if ($draft_image_loc != "") {
                    unlink($draft_image_loc);
                }
            }
        }

        // Respond with a success message or any other data
        echo json_encode(["success" => true, "message" => "File uploaded successfully", "data" => "$target_dir$name"]);
    } else {
        // Return an error message if the file upload failed
        echo json_encode(["success" => false, "message" => "Unable to upload file"]);
    }
} else {
    // Return an error message if the file upload failed
    echo json_encode(["success" => false, "message" => "Error uploading file"]);
}
