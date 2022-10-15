<?php
function getItemeById($id, $items)
{
    $item_response = null;
    foreach ($items as $item) {
        if ($item["id"] == $id) {
            $item_response = $item;
            break;
        }
    }
    return $item_response;
}

function updateKeyForBoolean($key)
{
    if ($key == "true") {
        return "1";
    } elseif ($key == "false") {
        return "0";
    } else {
        return $key;
    }
}

function getSubquerycondition($key_value, $item)
{
    $subquery = [];
    if (str_contains($key_value[0], "_")) {
        $subquery = explode("_", $key_value[0]);
        if (count($subquery) > 1 && $subquery[0] !== "") {
            if ($subquery[1] == "like") {
                // dateCreated_like=2022
                return str_contains($item[$subquery[0]], $key_value[1]);
            }
        }
    } else {
        // dateCreated=2022
        return $item[$key_value[0]] == updateKeyForBoolean($key_value[1]);
    }
}

function isSortQuery($query)
{
    $keyValue = explode("=", urldecode($query));
    $subquery = explode("_", $keyValue[0]);

    if (count($subquery) < 2) {
        return false;
    }

    // echo $subquery[0].",".$subquery[1];
    // echo ' | ';

    if (count($subquery) > 1 && $subquery[0] !== "") {
        return false;
    }

    return true;
}

function sortItemsByQuery($queryArray, $items)
{
    $sorted_array = $items;
    // _sort=dateContacted&_order=desc
    // echo "Sorting items by query " . $queryArray;
    $field = "dateContacted";
    $order = SORT_ASC; // SORT_ASC | SORT_DESC
    $map_string = "strtoupper"; //strtoupper intval strtotime

    foreach ($queryArray as $query) {
        $subquery = explode("=", $query);

        if (str_contains($query, "_sort") && count($subquery) === 2) {
            $field = $subquery[1];
        }

        if (str_contains($query, "_order") && str_contains($query, "desc")) {
            $order = SORT_DESC;
        }

        if (str_contains($query, "date")) {
            $map_string = "strtotime";
        }
    }

    array_multisort(
        array_map($map_string, array_column($sorted_array, $field)),
        $order,
        $sorted_array
    );

    return $sorted_array;
}

function getItemsByQuery($query, $items)
{
    $item_response = [];
    $keyValue = explode("=", urldecode($query));
    if (count($keyValue) == 2) {
        foreach ($items as $item) {
            if (getSubquerycondition($keyValue, $item)) {
                array_push($item_response, $item);
            }
        }
    }

    return $item_response;
}

function processGetters()
{
    $request_url_path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

    if (strlen($request_url_path) > 1) {
        // start application
        $string = file_get_contents("db.json");

        $json_object = json_decode($string, true);

        $paths = explode("/", substr($request_url_path, 1));

        $path = $paths[0];

        $response_obj = $json_object[$path];

        $sort_query = false;

        // articles/789gyut76r
        if (count($paths) == 2) {
            $item_by_id = null;

            $item_by_id = getItemeById($paths[1], $json_object[$path]);
            if ($item_by_id !== null) {
                $response_obj = $item_by_id;
            }
        }

        // categoryId=Production&published=true
        $request_url_query = parse_url($_SERVER["REQUEST_URI"], PHP_URL_QUERY);

        if (count($paths) == 1 && $request_url_query != "") {
            $request_url_query_array = explode("&", $request_url_query);

            if (count($request_url_query_array) > 0) {
                // print_r(urldecode($request_url_query_array[0]));
                $items_by_querry = $json_object[$path];
                $prev_req_qry_key = "";
                foreach ($request_url_query_array as $request_query) {
                    // _sort=dateContacted&_order=desc
                    if (isSortQuery($request_query)) {
                        $sort_query = true;
                    }

                    $req_qry_key = explode("=", urldecode($request_query)[0]);
                    if ($prev_req_qry_key == $req_qry_key) {
                        $q_items = getItemsByQuery(
                            $request_query,
                            $json_object[$path]
                        );
                        array_push($items_by_querry, ...$q_items);
                    } else {
                        $items_by_querry = getItemsByQuery(
                            $request_query,
                            $items_by_querry
                        );
                    }

                    $prev_req_qry_key = explode(
                        "=",
                        urldecode($request_query)[0]
                    );
                }

                if ($sort_query) {
                    $response_obj = sortItemsByQuery(
                        $request_url_query_array,
                        $response_obj
                    );
                } else {
                    $response_obj = $items_by_querry;
                }
            }
        }
        $passphase = "JagaBaliaShreekhetra";
        $enc_responseObj = base64_encode(CryptoJSAesEncrypt($passphase,json_encode($response_obj)));
        
        //   "zjData" => $response_obj,

        $response_obj = [
            "ezjData" => $enc_responseObj
        ];

        print_r(json_encode($response_obj));
    } else {
        echo "Welcome to zjournal Feeder";
    }
}
?>
