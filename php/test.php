<?php
$servername = "webhostingdb-c1n0.cc.uga.edu";
$username = "uw_mappingthedeep";
$password = "d96972247d0-d-";
$dbname = "uw_mappingthedeep";

// Get variables from http request
$name = $_GET["name"];
$sci_name = $_GET["sci_name"];
$oxy_min = $_GET["oxy_min"];
$oxy_max = $_GET["oxy_max"];
$salt_min = $_GET["salt_min"];
$salt_max = $_GET["salt_max"];
$temp_min = $_GET["temp_min"];
$temp_max = $_GET["temp_max"];
$given_name = $_GET["given_name"];
$family_name = $_GET["family_name"];
$reference_doi = $_GET["reference_doi"];
$reference_doi_url = $_GET["reference_doi_url"];
$species_type = $_GET["species_type"];

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "INSERT INTO species (name, scientific_name, oxygen_min, oxygen_max, salt_min, salt_max, temp_min, temp_max, given_name, family_name, reference_doi, reference_doi_url, species_type)
VALUES ('".$name."', '".$sci_name."', ".$oxy_min.",".$oxy_max.",".$salt_min.",".$salt_max.",".$temp_min.",".$temp_max.",'".$given_name."','".$family_name."','".$reference_doi."','".$reference_doi_url."','".$species_type."');";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>