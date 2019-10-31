<?php
$servername = "localhost";
$username = "uw_mappingthedeep";
$password = "d96972247d0-d-";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
echo "Connected successfully";
?>