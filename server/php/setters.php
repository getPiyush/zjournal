<?php
include "propeties.php";

function addRecord($record, $path)
{
    $string = file_get_contents("db.json");
    $json_object = json_decode($string, true);
    $record->id = uniqid();
    // var_dump($record);
    $record_list = $json_object[$path];
    array_push($record_list, $record);
    $json_object[$path] = $record_list;

    file_put_contents("db.json", json_encode($json_object));

    return $record;
}

function updateRecord($record, $path)
{
    $string = file_get_contents("db.json");
    $json_object = json_decode($string, true);

    $paths = explode("/", $path);

    // articles/789gyut76r
    if (count($paths) == 2) {
        $item_list = $json_object[$paths[0]];
        $item_id = $paths[1];
        $found = false;

        if ($item_list && count($item_list) > 0) {
            foreach ($item_list as $index => $item) {
                if ($item["id"] === $item_id) {
                    $item_list[$index] = $record;
                    $found = true;
                }
            }

            if ($found) {
                $json_object[$paths[0]] = $item_list;
                file_put_contents("db.json", json_encode($json_object));
            }
        }

        if (!$found) {
            return null;
        }
    }
    elseif (count($paths) == 1) {
        $item = $json_object[$paths[0]];
        if ($item) {
            $json_object[$paths[0]] = $record;
            file_put_contents("db.json", json_encode($json_object));
        }
    }

    // print_r(json_encode($json_object[$paths[0]]));

    return $record;
}

function deleteRecord($path)
{
    $paths = explode("/", $path);

    // articles/789gyut76r
    if (count($paths) == 2) {
        $string = file_get_contents("db.json");
        $json_object = json_decode($string, true);
        $deleted_item = null;
        $item_list = $json_object[$paths[0]];
        $item_id = $paths[1];

        if ($item_list && count($item_list) > 0) {
            $updated_list = array();
            foreach ($item_list as $index => $item) {
                if ($item["id"] !== $item_id) {
                    array_push($updated_list, $item);
                }
                else {
                    $deleted_item = $item;
                }
            }

            if ($deleted_item !== null) {
                $json_object[$paths[0]] = $updated_list;
                file_put_contents("db.json", json_encode($json_object));
            }
        }
    }

    // print_r(json_encode($json_object[$paths[0]]));

    return $deleted_item;
}

function decodedPayloadData($data)
{
    global $passphase;

    if ($data) {
        $data = json_decode($data);
        //  print_r($data->ezjData);

        $encrypted_string = $data->ezjData;
        if ($encrypted_string) {
            return CryptoJSAesDecrypt($passphase, base64_decode($encrypted_string));
        }
        else {
            return $data;
        }
    }
}

function processSetters()
{
    global $passphase, $encryptionEnabled;

    $response_obj = [];
    $request_url_path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
    $request_url_path = substr($request_url_path, 1);

    $payload_encrypted = file_get_contents("php://input");
    $payload_decrypted = $encryptionEnabled ? decodedPayloadData($payload_encrypted) : $payload_encrypted;

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $data = json_decode($payload_decrypted);

        if ($request_url_path !== "") {
            $response_obj = addRecord($data, $request_url_path);
            http_response_code(201);
        }
    }

    if ($_SERVER["REQUEST_METHOD"] === "PUT") {
        $record = json_decode($payload_decrypted);
        $response_obj = updateRecord($record, $request_url_path);
    }

    if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
        $response_obj = deleteRecord($request_url_path);
    }

    if ($response_obj === null) {
        http_response_code(404);
        $response_obj = [
            "error" => [
                "code" => "NOT_FOUND",
                "message" => "No item with that id"
            ]
        ];
    }

    if ($encryptionEnabled) {
        $enc_responseObj = base64_encode(
            CryptoJSAesEncrypt($passphase, json_encode($response_obj))
        );

        $response_obj = [
            "ezjData" => $enc_responseObj,
        ];
    }

    print_r(json_encode($response_obj));
}

?>