<?php

function CryptoJSAesEncrypt($passphrase, $plain_text)
{
    $salt = openssl_random_pseudo_bytes(256);
    $iv = openssl_random_pseudo_bytes(16);
    //on PHP7 can use random_bytes() istead openssl_random_pseudo_bytes()
    //or PHP5x see : https://github.com/paragonie/random_compat

    $iterations = 999;
    $key = hash_pbkdf2("sha512", $passphrase, $salt, $iterations, 64);

    $encrypted_data = openssl_encrypt(
        $plain_text,
        "aes-256-cbc",
        hex2bin($key),
        OPENSSL_RAW_DATA,
        $iv
    );

    $data = [
        "ciphertext" => base64_encode($encrypted_data),
        "iv" => bin2hex($iv),
        "salt" => bin2hex($salt),
    ];
    return json_encode($data);
}

function CryptoJSAesDecrypt($passphrase, $jsonString)
{
    $jsondata = json_decode($jsonString, true);
    try {
        $salt = hex2bin($jsondata["salt"]);
        $iv = hex2bin($jsondata["iv"]);
    } catch (Exception $e) {
        return null;
    }

    $ciphertext = base64_decode($jsondata["ciphertext"]);
    $iterations = 999; //same as js encrypting

    $key = hash_pbkdf2("sha512", $passphrase, $salt, $iterations, 64);

    $decrypted = openssl_decrypt(
        $ciphertext,
        "aes-256-cbc",
        hex2bin($key),
        OPENSSL_RAW_DATA,
        $iv
    );

    return $decrypted;
}

function encrypt_decrypt($action, $string)
{
    $output = false;
    $encrypt_method = "AES-256-CBC";
    $secret_key =
        "omjayajagadishharebandeutkalajananibaghanisahanalamuunekapagalab";
    $secret_iv = "batoibhaijauchak";
    // hash
    $key = hash("sha256", $secret_key);
    // iv - encrypt method AES-256-CBC expects 16 bytes
    $iv = substr(hash("sha256", $secret_iv), 0, 16);
    if ($action === "encrypt") {
        $output = openssl_encrypt($string, $encrypt_method, $key, 0, $iv);
        $output = base64_encode($output);
    } elseif ($action === "decrypt") {
        echo 'decrypting ...';
        $output = openssl_decrypt(
            base64_decode($string),
            $encrypt_method,
            $key,
            0,
            $iv
        );
    }
    return $output;
}

?>
