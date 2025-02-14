<?php
session_start();
header('Content-Type: application/json');

/**
 * generateCode – Returns a four-digit random numeric code.
 *
 * @return string A four-digit code as a string.
 */
function generateCode() {
    return strval(rand(1000, 9999));
}

/**
 * getTempFilename – Builds a temporary filename using a prefix and a code.
 *
 * @param string $prefix The file prefix.
 * @param string $code   The generated code.
 * @return string The temporary filename.
 */
function getTempFilename($prefix, $code) {
    $folder = __DIR__ . DIRECTORY_SEPARATOR . "data";
    if (!file_exists($folder)) {
        mkdir($folder, 0777, true);
    }
    return $folder . DIRECTORY_SEPARATOR . $prefix . "_" . $code . ".dat";
}


$command = isset($_REQUEST['c']) ? $_REQUEST['c'] : '';

switch ($command) {

    case 'get_var':
        // Save a simple setting (name/value pair) and return a 4-digit code.
        $name  = isset($_REQUEST['n']) ? $_REQUEST['n'] : '';
        $value = isset($_REQUEST['v']) ? $_REQUEST['v'] : '';
        $code = generateCode();
        // Save this generated code into the session so we can check it later.
        $_SESSION['generated_code'] = $code;
        $data = array('name' => $name, 'value' => $value);
        $filename = getTempFilename("a", $code);
        if (file_put_contents($filename, json_encode($data)) !== false) {
            echo json_encode(array('status' => 'success', 'code' => $code));
        } else {
            echo json_encode(array('status' => 'error', 'message' => 'Could not write setting.'));
        }
        break;

    case 'get_val':
        // Retrieve a setting by its code.
        $code = isset($_REQUEST['d']) ? $_REQUEST['d'] : '';
        $filename = getTempFilename("a", $code);
        if (file_exists($filename)) {
            $data = json_decode(file_get_contents($filename), true);
            echo json_encode(array('status' => 'success', 'data' => $data));
        } else {
            echo json_encode(array('status' => 'forbidden'));
        }
        break;

    case 'send':
        // Save a full settings XML (or any data string) and return a 4-digit code.
        $xml = isset($_REQUEST['d']) ? $_REQUEST['d'] : '';
        if (!$xml) {
            echo json_encode(array('status' => 'error', 'message' => 'No data provided.'));
            break;
        }
        $code = generateCode();
        $filename = getTempFilename("a_full", $code);
        if (file_put_contents($filename, $xml) !== false) {
            echo json_encode(array('status' => 'success', 'code' => $code));
        } else {
            echo json_encode(array('status' => 'error', 'message' => 'Failed to save full settings.'));
        }
        break;

    case 'get':
        // Retrieve full settings XML (or data) by code.
        $code = isset($_REQUEST['d']) ? $_REQUEST['d'] : '';
        $filename = getTempFilename("a_full", $code);
        if (file_exists($filename)) {
            $xml = file_get_contents($filename);
            echo json_encode(array('status' => 'success', 'data' => $xml));
        } else {
            echo json_encode(array('status' => 'error', 'message' => 'Settings not found.'));
        }
        break;

    case 'get_m3u':
        // Return the contents of an M3U playlist.
        $playlistFile = __DIR__ . DIRECTORY_SEPARATOR . "m3u.txt";
        if (file_exists($playlistFile)) {
            header('Content-Type: text/plain');
            echo file_get_contents($playlistFile);
        } else {
            echo "No playlist found.";
        }
        break;

    case 'get_cod_m3u':
        // Generate and return a new 4-digit code for use with M3U editing.
        $code = generateCode();
        echo json_encode(array('status' => 'success', 'code' => $code));
        break;
        
    case 'check':
        // Check the code sent by the user. If it matches the code stored in the session,
        // return the playlist URL and "burn" the code (so it cannot be reused).
        $enteredCode = isset($_REQUEST['d']) ? trim($_REQUEST['d']) : '';
        if (isset($_SESSION['generated_code']) && $enteredCode === trim($_SESSION['generated_code'])) {
            // Remove the code from the session to prevent reuse.
            unset($_SESSION['generated_code']);
            echo json_encode([
                "status"   => "success",
                "data"     => "playlist",
                "playlist" => "http://troya.info/pl/13/kcn0q3jrc0pw8/playlist.m3u8"
            ]);
        } else {
            echo json_encode([
                "status"  => "error",
                "message" => "Invalid code"
            ]);
        }
        break;

    default:
        echo json_encode(array('status' => 'error', 'message' => 'Invalid command.'));
        break;
}
?>
