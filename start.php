<?php

$config = [
    "name" => "TV4U",
    "version" => "1.0.0",
    "parameter" => "content:https://storage.googleapis.com/tv4u/TV4U_MSX/content.json"
];

// Output as JSON if needed
echo json_encode($config, JSON_PRETTY_PRINT);

?>
