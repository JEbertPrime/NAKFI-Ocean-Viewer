<?php
$servername = "webhostingdb-c1n0.cc.uga.edu";
$username = "uw_mappingthedeep";
$password = "d96972247d0-d-";
$dbname = "uw_mappingthedeep";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT*FROM species;";
$result = $conn->query($sql);
$rows = array();


if ($result->num_rows > 0) {
    // output data of each row
    while($row = $result->fetch_assoc()) {
        $rows[] = $row;
    }
} else {
    echo "0 results";
}
print json_encode($rows);
$conn->close();
?>