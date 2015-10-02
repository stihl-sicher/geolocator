/* Suchfunktionen */

function startSearch(searchString) {	
	request.post(serverUrlViewer + 'javascript/ff_search/ff_search.php', {
		data: {
			mandant: mandant,
			suchtext: searchString
		},
    	// Parse data from JSON to a JavaScript object
        handleAs: "json"
    }).then(function(data){
		
		printKategorie(data);
		
	},
    function(error){
    	// Display the error returned
        alert('Fehler bei der Suchabfrage!');
    });
}

var letzteSuche = null;

function startMobileSearch(close) {
		require(["dojo/dom", "dojo/dom-style", "dojo/dom-class"], function(dom, domStyle, domClass) {
			//var mt = dom.byId("kategorien");		
			//var ts = domStyle.get(mt,"display");
			//if (ts !== "none" && dojo.hasClass("btnMenu","aktiv")) {
				toggleMenu(true);
			//}
			//mt = dom.byId("tools");		
			//ts = domStyle.get(mt,"display");
			//if (ts !== "none") {
				toggleTools(true);
			//}
			closeInfo();
			closeRouting();				
			

			var searchString = dom.byId("mobileSuche").value;
			if ((letzteSuche === searchString  && dojo.hasClass("btnMobileSearchStart","aktiv")) || close) {
				var mi = dom.byId("kategorien");				
				domStyle.set(mi,"display","");	
				letzteSuche = null;
				domClass.remove("btnMobileSearchStart","aktiv");				
			} else {
				letzteSuche = searchString;
				startSearch(searchString);
				domClass.add("btnMobileSearchStart","aktiv");
				var mi = dom.byId("kategorien");				
				domStyle.set(mi,"display","block");	
			}
		});
	}
	
	
	
require(["dojo/dom", 'dojo/on', 'dojo/keys', "dojo/domReady!"], function(dom, on, keys) {	
	
	// SUCHE (Desktop)
		var searchField = dom.byId('searchField');
		on(searchField, "keyup", function(event) {
			var isEnoughLetters = searchField.value.length;
			if (isEnoughLetters > 2) {
				startSearch(searchField.value);
			} 
			else {
				if (isEnoughLetters == 0) {
					// wieder auf letzte Kategorie zurueck
					showEbene(parentKat);
				}
			}
		});
		
		// SUCHE (mobil)
		var searchFieldMobil = dom.byId('mobileSuche');
		on(searchFieldMobil, "keypress", function(event) {
			if (event.keyCode == keys.ENTER) {
				if (searchFieldMobil.value.length > 1) {
					/*startSearch(searchFieldMobil.value);
					
					var mi = dom.byId("kategorien");				
					domStyle.set(mi,"display","block");*/
					startMobileSearch();
				}
			}
		});

});
