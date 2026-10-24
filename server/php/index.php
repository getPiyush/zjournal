<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept, Authorization");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");

header('Content-Type:application/json');

error_reporting(E_ALL);
ini_set('display_errors', '1');

// CORS preflight: the headers above are the whole answer.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

include "auth.php";
zj_enforce_admin_auth();

include "crypto.php";
include 'getters.php';
include 'setters.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    processGetters();
}
else {
    processSetters();
}

?>
