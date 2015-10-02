function ff_search_init()
{
	// check, ob globale Suche
	if (typeof(parameters_string) == "undefined")
	{
		parameters_string = "mandant=global";
	}
	
	var suchfeld = document.getElementById('suchfeld');
	new Ajax.Autocompleter("suchfeld", "autocomplete_choices_ff", serverUrl + "ff_search/ff_search.php", {	
		minChars: 3,
		updateElement: ff_search_afterSelect,
		parameters: parameters_string
	});
}

function ff_search_afterSelect(text)
{
	var mid = text.childNodes[0].firstChild.data;
	var geostatus = 0;
	if (text.childNodes.length == 3)
	{
		geostatus = text.childNodes[1].firstChild.data;
	}
	
	if (typeof(datingMarker_array) == "undefined")
	{
		datingMarker_array = new Array();
	}	
	if (!datingMarker_array)
	{
		datingMarker_array = new Array();
	}
	datingMarker_array[0] = mid;
	datingMarker_array[1] = geostatus;
	
	// check, ob globale Suche
	if (typeof(aufrufender_mandant) == "undefined")
	{
		if (text.childNodes.length == 3)
		{
			aufrufender_mandant = text.childNodes[1].innerHTML;
		}
		
		parent.window.location="http://" + server + "/" + aufrufender_mandant + "/?mid=" + mid + "&gtyp=0";

	}
	else
	{
		setDatingMarker();		
	}
	
	var suchfeld = document.getElementById('suchfeld');
	suchfeld.value = 'Hier Suchbegriff eingeben ...';
}

// Textfeld leeren
function initTf_ff_search(el, value) {
	if (value == el.value)
		el.value = "";
}