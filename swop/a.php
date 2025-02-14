<?php
session_start();

if (!isset($_SESSION['session_code'])) {
    // Generate a random six-digit code.
    $_SESSION['session_code'] = rand(100000, 999999);
}

// Optionally, if you receive a device identifier (like a MAC address) via the request,
// you can save that together with the code for extra validation.
$deviceId = isset($_REQUEST['device_id']) ? $_REQUEST['device_id'] : '';

// If the command is to get the code...
if (isset($_REQUEST['c']) && $_REQUEST['c'] === 'get_code') {
    // You might also store $deviceId in a database or file together with the code.
    echo json_encode([
        "data" => "code",
        "code" => $_SESSION['session_code']
    ]);
    exit;
}

if (isset($_REQUEST['c']) && $_REQUEST['c'] === 'check') {
    $enteredCode = isset($_REQUEST['d']) ? $_REQUEST['d'] : '';
    if ($enteredCode === $_SESSION['session_code']) {
        echo json_encode([
            "data"     => "playlist",
            "playlist" => "http://yourdomain.com/playlist.m3u"  // your hard-coded playlist URL
        ]);
    } else {
        echo json_encode([
            "data"    => "error",
            "message" => "Invalid code"
        ]);
    }
    exit;
}
