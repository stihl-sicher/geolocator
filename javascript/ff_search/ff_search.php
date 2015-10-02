<?php

session_start();

header('Content-Type: application/json');

include ('../../includes/config.inc.php');

class Search {
	var $parentKat;
	var $requestedKat;
	var $title;
	var $items;
}

class Item {
	var $type;
	var $id;
	var $img;
	var $display;
	var $favorite;
}

getSuggest();

function getSuggest()
{
	$db = mysqli_connect($GLOBALS["db_host"], $GLOBALS["db_user"], $GLOBALS["db_pwd"]);
	mysqli_select_db($db,$GLOBALS["db_name"]);


	$suchfeld = "";
	$mandant = "";

	if(isset($_REQUEST['suchtext']))
	{
	   $suchfeld = utf8_decode(rawurldecode($_REQUEST['suchtext']));
	}
	if(isset($_REQUEST['mandant']))
	{
	   $mandant = utf8_decode(rawurldecode($_REQUEST['mandant']));
	}

	$search_sql = "select fe.ID as id,ftl.value as titel,b.URL as image from foi_title_lang ftl join foi_ebene fe on fe.FK_FOI_ID = ftl.fk_foi_id join foi f on fe.FK_FOI_ID = f.ID left join foi_bild fb on fb.FK_FOI_ID = fe.FK_FOI_ID left join bild b on b.id = fb.FK_BILD_ID where (ftl.value like '%|suchbegriff|%') AND (f.BEGINN <= CURDATE() and f.ENDE >= CURDATE() or f.ENDE is null) group by fe.FK_FOI_ID order by ftl.value";
	
	$query = str_replace("|suchbegriff|", $suchfeld, $search_sql);
	// echo($query);
		
	$search = new Search();
	$itemArray = array();
	if ($result = $db->query($query)) {
		while ($row = $result->fetch_array(MYSQLI_ASSOC)) {
			$item = new Item();		
			
			$item->type = "FOI";
			$item->title = utf8_encode($row["titel"]);
			$item->id = $row["id"];
			$item->img = $row["image"];
			$item->display = in_array($row["id"], $_SESSION["visibleFOI"]);
			$item->favorite = in_array($row["id"], $_SESSION["Favoriten"]);
			$itemArray[] = $item;
		}
	}
	
	$search->parentKat = 0;//$_SESSION["AktuelleKategorie"];
	$search->requestedKat = null;
	$search->title = "Suchergebnis";
	$search->items = $itemArray;

	mysqli_free_result($result);

	mysqli_close($db);
	
	echo json_encode($search);
}

?>