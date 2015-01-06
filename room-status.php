<?php
date_default_timezone_set('America/Detroit');
include 'inc/config.php';
$db = new mysqli($db_host, $db_user, $db_pass, $db_database);

function checkIP(){
    global $db;
    $ip = $_SERVER['REMOTE_ADDR'];
    $ua = $_SERVER['HTTP_USER_AGENT'];
    $db->query("INSERT INTO `access_log`
            (accessid, system, ip, useragent, timestamp) VALUES
            (NULL, 'room-status', '$ip', '$ua', SYSDATE())");
    $ip = explode(".",$ip);
    if (!(
        ($ip[0] == "::1") ||
        ($ip[0] == "148" && $ip[1] == "61") ||
        ($ip[0] == "35" && $ip[1] == "40") ||
        ($ip[0] == "207" && $ip[1] == "72" &&
            ($ip[2] >= 160 && $ip[2] <= 191)
        ))

    ){
        die();
    }
}
checkIP();

function getRoomTrafficByDatabaseID($id){
	global $db;
	$query = "
	SELECT level
	 FROM traffic 
	 WHERE entryID = (
	 	SELECT MAX(entryID) 
		FROM entries )
	 AND space = $id;";
	$level = array();
    $dbResult = $db->query($query);
    $row = $dbResult->fetch_row();
    $level[$id] = $row[0];
    return json_encode($level);
}

function getRoomReservationsByEmsID($id){
	$today = new dateTime();
    $today = $today->format('Y-m-d');

    $url = 'http://gvsu.edu/reserve/files/cfc/functions.cfc?method=bookings&roomId='.$id.'&startDate='.$today.'&endDate='.$today.'';
    $xml = simplexml_load_string(file_get_contents($url));
    return json_encode($xml);
}

if (isset($_POST)){
	if ($_POST['data'] == 'traffic'){
		echo getRoomTrafficByDatabaseID($_POST['id']);
	} else if ($_POST['data'] == 'events'){
		echo getRoomReservationsByEmsID($_POST['id']);
	}
}
?>