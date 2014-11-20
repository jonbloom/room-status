<?php
date_default_timezone_set('America/Detroit');
include 'inc/config.php';
$db = new mysqli($db_host, $db_user, $db_pass, $db_database);

function getRoomTrafficByDatabaseID($id){
	global $db;
	$query = 
	" SELECT level" . 
	" FROM traffic " .
	" WHERE entryID = (" . 
	    "SELECT MAX(entryID) ".
	    "FROM entries )" .
	" AND space = $id;";
	$level = array();
    $level[$id] = $db->query($query);
    $level[$id] = $level[$id]->fetch_row();
    $level[$id] = $level[$id][0];
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