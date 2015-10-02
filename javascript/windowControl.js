/* Fenster-Steuerung */


var closeMenus = function(force) {
			require(["dojo/dom", "dojo/dom-style", "dojo/dom-class"], function(dom, domStyle, domClass) {
//				var mi = dom.byId("kategorien");
//				var ds = domStyle.get(mi,"display");
//				if (ds !== "none" && (domClass.contains("btnMenu","aktiv") || force)) {
					toggleMenu(true);
//				}
//				ds = domStyle.get(mi,"display");
//				if (ds !== "none" && domClass.contains("btnMobileSearchStart","aktiv")) {
					startMobileSearch(true);
//				}*/
//				mi = dom.byId("tools");
//				var ds = domStyle.get(mi,"display");
//				if (ds !== "none" && domClass.contains(mi,"aktiv")) {
					toggleTools(true);
//				}	
			});
		}
		
		
		function startRoutingWindow(existing) {
			require([ "dojo/dom", "dojo/dom-style"], function(dom, domStyle) {
				closeInfo();
				closeTooldivAtMobile();
			
				var mi = dom.byId("routingFenster");
				var ds = domStyle.set(mi,"display","box");
				var ds = domStyle.set(mi,"display","-moz-box");
				var ds = domStyle.set(mi,"display","-webkit-box");
				var ds = domStyle.set(mi,"display","flex");
				var ds = domStyle.set(mi,"display","-webkit-flex");
				var ds = domStyle.set(mi,"display","-ms-flex");
				if (existing) {
					domStyle.set(dom.byId("routingMinFenster"),"display","");
				} else {
					initRoutingDialog();
					checkStartRouting();			
				}
			});
		}
		
		function mapsizeUpdate() {
			if (typeof map !== "undefined" && map !== null) {
				map.updateSize();
			}
		}
		
		
		function openTesteintrag() {
			fillInformation(Info);
		}
		
		function closeMW() {
			require([ "dojo/dom", "dojo/dom-style"], function(dom, domStyle) {
				var mi = dom.byId("messWerkzeug");
				var ds = domStyle.set(mi,"display","");
				if (measureControl) {
					stopMeasuring();
				}
				if (isCircleMode) {
					stopCircleMode();
				}
			});
		}
		
		function openMW() {
			require([ "dojo/dom","dijit/Tooltip", "dojo/dom-style"], function(dom, Tooltip, domStyle) {
				
				closeTooldivAtMobile();
				
				mi = dom.byId("messWerkzeug");
				domStyle.set(mi,"display","block");
				Tooltip.defaultPosition = ["below", "above"];
				Tooltip.show("Egal ob Fläche oder Strecke, klicken Sie hier, um eine neue Messung zu beginnen",dom.byId("btnMWReset"));
				setTimeout(function() {Tooltip.hide(dom.byId("btnMWReset"));},3000);


			});
		}
		
		function toggleTools(close) {
			require(["dojo/dom", "dojo/dom-style", "dojo/dom-class"], function(dom, domStyle, domClass) {
				if (close) {
					var mi = dom.byId("tools");
					domStyle.set(mi,"display","");
					domClass.remove("btnSettings", "aktiv");
				} else {
	//				var mt = dom.byId("kategorien");		
	//				var ts = domStyle.get(mt,"display");
	//				if (ts !== "none" && !close) {
						toggleMenu(true);
	//				}
					closeInfo();
					closeRouting();
					
	//				mt = dom.byId("routingFenster");		
	//				ts = domStyle.get(mt,"display");
	//				if (ts !== "none") {
	//					closeRouting();	
	//				}
					
					var mi = dom.byId("tools");
					var ds = domStyle.get(mi,"display");
					if (ds !== "none" ) {
						domStyle.set(mi,"display","");
						domClass.remove("btnSettings", "aktiv");
						
					} else {
						domStyle.set(mi,"display","block");	
						domClass.add("btnSettings", "aktiv");	
					}
				}			
			});
		}
		
		

		
		function toggleMenu(close) {
			require(["dojo/dom", "dojo/dom-style", "dojo/dom-class"], function(dom, domStyle, domClass) {
				if (close) {
					var mi = dom.byId("kategorien");
					domStyle.set(mi,"display","");
					domClass.remove("btnMenu", "aktiv");
				} else {
					var mi = dom.byId("kategorien");
					var mt = dom.byId("tools");

					toggleTools(true);
					domClass.remove("btnMobileSearchStart","aktiv");	
					closeInfo();
					closeRouting();	
					
					var ds = domStyle.get(mi,"display");
					if (ds !== "none" && domClass.contains("btnMenu", "aktiv")) {
						domStyle.set(mi,"display","");
						domClass.remove("btnMenu", "aktiv");
					} else {
						fillKategorien();
						domStyle.set(mi,"display","block");	
						domClass.add("btnMenu", "aktiv");						
					}
				}				
			});
		}
		
		function toggleMinimizeInfo(e) {
			require(["dojo/fx/Toggler", "dojo/fx", "dojo/dom", "dojo/dom-style"], function(Toggler, coreFx, dom, domStyle) {
				var mi = dom.byId("informationenContent");
				if (domStyle.get(mi,"display") !== "none") {
					domStyle.set(mi, "display","none");
					minimizeTab();
				} else {
					domStyle.set(mi, "display","block");
				}
			});
		}
		
		
		function toggleMinimizeRouting() {
			require(["dojo/dom", "dojo/dom-style"], function(dom, domStyle) {
				var mi = dom.byId("routingContent");
				if (domStyle.get(mi,"display") !== "none") {
					domStyle.set(mi, "display","none");
					mi = dom.byId("minimizeRouting");
//					domStyle.set(mi,"background-position","-45px");
					minimizeTab();
				} else {
					domStyle.set(mi, "display","block");
					mi = dom.byId("minimizeRouting");
//					domStyle.set(mi,"background-position","-30px");				
				}
			});
		}
		
		
		function closeInfo() {
			require(["dojo/dom", "dojo/dom-style"], function(dom, domStyle) {
				var mi = dom.byId("infoFenster");
				domStyle.set(mi,"display","");
				aktuelleInfo["id"] = null;
				aktuelleInfo["type"] = null;
			});
		}
		
		function closeRouting(preserve) {
			require(["dojo/dom", "dojo/dom-style", "dijit/Tooltip"], function(dom, domStyle, Tooltip) {
				var mi = dom.byId("routingFenster");
				domStyle.set(mi,"display","");
				if (!preserve) {
					// Wieder auf letzte Karte wechseln
					if (isRoutingMode) {
						setBaselayerByName(activeMap);
					}
					// if (activeMap == "OSM" || activeMap == "BingLuftbild") {
						// setBaselayerByName(activeMap);
					// } else {
						// setBaselayerByName('Tiles');
					// }
				} else {
					domStyle.set(dom.byId("routingMinFenster"),"display","block");
					mi = dom.byId("btn_maxRouting");
					Tooltip.show("Zurückkehren zum Routing",mi);
					setTimeout(function() {Tooltip.hide(mi);},3000);

				}
			});
		}
		
		function tabSys(e) {
			require(["dojo/dom-class", "dojo/query"], function(domClass) {
				var aktivCheck = e.currentTarget.attributes["class"].value.indexOf("aktiv");
				minimizeTab();
				if (aktivCheck < 0) {
					domClass.add(e.currentTarget,"aktiv");
					var it = "#"+e.currentTarget.attributes["alt"].value;
					var ito = dojo.query(it);
					domClass.remove(ito[0],"invisible");
					
				}
			});
		}
		
		function minimizeTab() {
			require(["dojo/dom-class", "dojo/query"], function(domClass) {
			
					var a = dojo.query('#aktion .inhalt');
					for (var c =0; c < a.length;c++) {
						domClass.add(a[c],"invisible");
					}
					a = dojo.query("#aktion ul li");
					for (var c =0; c < a.length;c++) {
						domClass.remove(a[c],"aktiv");
					}
			});
		}
		
		function switchFavorit() {}
		
		function removeMWActiveClasses()
		{
			dojo.query("#messWerkzeug input").removeClass("aktiv");
		}
		
		function startMWLine() {
			require(["dojo/query", "dijit/Tooltip", "dojo/dom", "dojo/NodeList-dom"], function(query, Tooltip, dom) {				
				stopCircleMode();
				Tooltip.defaultPosition = ["below", "above"];
				Tooltip.show("Klicken/Tippen Sie in die Karte, um die Punkte der Strecke festzulegen",dom.byId("btnMWStrecke"));
				setTimeout(function() {Tooltip.hide(dom.byId("btnMWStrecke"));},3000);
				dojo.query("#btnMWStrecke").addClass("aktiv");
				
				startMeasuring('line');
			});
		}

		function startMWArea() {
			require(["dojo/query", "dijit/Tooltip", "dojo/dom", "dojo/NodeList-dom"], function(query, Tooltip,dom) {				
				stopCircleMode();
				
				dojo.query("#btnMWArea").addClass("aktiv");
				Tooltip.defaultPosition = ["below", "above"];
				Tooltip.show("Klicken/Tippen Sie in die Karte, um die Eckpunkte des Polygons festzulegen",dom.byId("btnMWArea"));
				setTimeout(function() {Tooltip.hide(dom.byId("btnMWArea"));},3000);
				
				startMeasuring('polygon');
			});
		}
		
		function startMWCircle() {
			require(["dojo/query", "dijit/Tooltip", "dojo/dom", "dojo/NodeList-dom"], function(query, Tooltip, dom) {				
				stopMeasuring(true);
				stopDatingMode();
				
				dojo.query("#btnMWCircle").addClass("aktiv");
				Tooltip.defaultPosition = ["below", "above"];
				Tooltip.show("Klicken/Tippen Sie in die Karte, um den Mittelpunkt der Umkreise festzulegen",dom.byId("btnMWCircle"));
				setTimeout(function() {Tooltip.hide(dom.byId("btnMWCircle"));},3000);
				
				startCircleMode();
			});
		}
		
		function closeTooldivAtMobile() {
			require([ "dojo/dom", "dojo/dom-style"], function(dom, domStyle) {
				var toolDiv = dom.byId("tools");
				if (domStyle.get(toolDiv,"position") === "absolute") {
					toggleTools(true);
				}
			});
		}
		
		function openAllInfos() {
			require(["dojo/dom"], function(dom) {
				dojo.query('.dijitTitlePane').forEach(function(node){dijit.getEnclosingWidget(node).set('open',true);});
				
				var openCloseBtn = dom.byId("openCloseAllInfoImg");
				dojo.query("#openCloseAllInfoImg").removeClass("openAllInfo");
				dojo.query("#openCloseAllInfoImg").addClass("closeAllInfo");
				openCloseBtn.title = "Alles zuklappen";
			});
		}
		
		function closeAllInfos() {
			require(["dojo/dom"], function(dom) {
				dojo.query('.dijitTitlePane').forEach(function(node){
					if (node.id != "Aktionen" && node.id != "Stellenangebot" && node.id != "Termin") {
						dijit.getEnclosingWidget(node).set('open',false);
						
						var openCloseBtn = dom.byId("openCloseAllInfoImg");
						dojo.query("#openCloseAllInfoImg").removeClass("closeAllInfo");
						dojo.query("#openCloseAllInfoImg").addClass("openAllInfo");
						openCloseBtn.title = "Alles aufklappen";
					}
				})
			});
		}
		
		function toggleAllInfos() {
			require(["dojo/dom", "dojo/dom-style", "dojo/NodeList-dom"], function(dom, domStyle) {
				var mi = dom.byId("informationenContent");
				var open = (domStyle.get(mi,"display") !== "none");
				dojo.query('.dijitTitlePane').forEach(function(node){open = open && dijit.getEnclosingWidget(node).get('open');});
				if (open) {
					dojo.query('.dijitTitlePane').forEach(function(node){dijit.getEnclosingWidget(node).set('open',false);});
				} else {
					dojo.query('.dijitTitlePane').forEach(function(node){dijit.getEnclosingWidget(node).set('open',true);});
					domStyle.set(mi,"display","block");
				}
								
			});
		}
		
