<?php
error_reporting(E_ALL);
ini_set("display_errors", "1");

include "crypto.php";

if (
    file_exists($_FILES["file"]["tmp_name"]) ||
    is_uploaded_file($_FILES["file"]["tmp_name"])
) {
    if ($_FILES["file"]["error"] > 0) {
        echo "Error: " . $_FILES["file"]["error"] . "<br />";
    } elseif ($_FILES["file"]["type"] !== "text/plain") {
        echo "File must be a .txt";
    } else {
        $contents = file_get_contents($_FILES["file"]["tmp_name"]);
        echo gettype($contents).'<br/>';

        $json_data = encrypt_decrypt("decrypt", $contents);
        
        echo gettype($json_data).'<br/>';
        
        if ($json_data) {
            print_r($json_data);
        } else {
            echo "error in decrypting text";
        }
    }
}
?>

<form action="decryptfile.php" method="post" enctype="multipart/form-data">
   <label for="file">Filename:</label> <input type="file" name="file" id="file"/>
<input type="submit" value="Submit">
</form>