<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");

header('Content-Type:application/json');

error_reporting(E_ALL);
ini_set('display_errors', '1');

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