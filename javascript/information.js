var parentKat = 0;
var aktuelleInfo = new Array();
aktuelleInfo["id"] = null;
aktuelleInfo["type"] = null;

function rotateGalery(etv) {
	var test = carousel1.currentView.getShowingView();
	var temp = carousel1.currentView.getSiblingViews();
	if (test !== temp[(temp.length -1)]) {
		carousel1.currentView.goTo(1);
	} else {
		carousel1.currentView.goTo(1,temp[0]);
	}
	imageRotateTimeout = setTimeout(rotateGalery,5000);	
}


function showEbene(eID) {
	require(["dojo/request"], function(request){
		request.post(serverUrlViewer+"php/ebenen/index.php", {
			data: {	
				mandant: 1,
				ebeneID: eID,
				langID: 1
			}
		}).then(function(response){
			parentKat = eID;
			printKategorie(JSON.parse(response));
		});
	});
}



function VisibleEbene(eID, elm) {
	require(["dojo/request"], function(request){
		if (elm.getAttribute("src") === "framework/eye_on.png") {
			request.post(serverUrlViewer+"php/mapElements/index.php", {
				data: {	
					ebeneID: eID,
					foiID: 0,
					favID:0,
					func: "removeVisEbene",
					zoom: map.getZoom() +  parseInt(zoomOffset)
				}
			}).then(function(response){
				elm.setAttribute("src","framework/eye_off.png");		
				//alert((JSON.parse(response)).Ebenen.join());
				printOnMap(JSON.parse(response));
			});
		} else {
			request.post("php/mapElements/index.php", {
				data: {	
					ebeneID: eID,
					foiID: 0,
					favID:0,
					func: "addVisEbene",
					zoom: map.getZoom() +  parseInt(zoomOffset)
				}
			}).then(function(response){
				elm.setAttribute("src","framework/eye_on.png");
				//alert((JSON.parse(response)).Ebenen.join());
				printOnMap(JSON.parse(response));
			});
		}
	});

}


function setFavorite(foiID, elm) {
	require(["dojo/request","dojo/dom-style", "dojo/dom", "dojo/query", "dojo/dom-class"], function(request,domStyle, dom, query, domClass){
		var pr = elm.getAttribute("src");
		if (pr === null) {
			pr = elm.getAttribute("style");
		}
		if (pr !== null && pr.indexOf("framework/fav_on")>-1) {
			request.post(serverUrlViewer+"php/mapElements/index.php", {
				data: {	
					ebeneID: 0,
					foiID: 0,
					favID:foiID,
					func: "removeFav",
					zoom: map.getZoom() +  parseInt(zoomOffset)
				}
			}).then(function(response){
				var resp = JSON.parse(response);
				if (resp.parentKats.indexOf(parentKat) && !domClass.contains("btnMobileSearchStart","aktiv")) {
					showEbene(parentKat);
				}
				if (aktuelleInfo.id === resp.id && aktuelleInfo.type === resp.type) {
					domStyle.set(dom.byId("favButtonInfo"),"background-image","url('framework/fav_off.png')");
					query("#infoFav label")[0].innerHTML = "Zu Favoriten hinzufügen";
				} else {
					elm.setAttribute("src","framework/fav_off.png");
				}
			});
		} else {
			request.post(serverUrlViewer+"php/mapElements/index.php", {
				data: {	
					ebeneID: 0,
					foiID: 0,
					favID:foiID,
					func: "addFav",
					zoom: map.getZoom() +  parseInt(zoomOffset)
				}
			}).then(function(response){
				var resp = JSON.parse(response);
				if (resp.parentKats.indexOf(parentKat) && !domClass.contains("btnMobileSearchStart","aktiv")) {
					
					showEbene(parentKat);
				}
				if (aktuelleInfo.id === resp.id && aktuelleInfo.type === resp.type) {
					domStyle.set(dom.byId("favButtonInfo"),"background-image","url('framework/fav_on.png')");
					query("#infoFav label")[0].innerHTML = "Als Favorit markiert";
				} else {
					elm.setAttribute("src","framework/fav_on.png");
				}
			});
		}
	});

}


function VisibleFOI(foiID, elm) {
	require(["dojo/request"], function(request){
		if (elm.getAttribute("src") === "framework/eye_on.png") {
			request.post(serverUrlViewer+"php/mapElements/index.php", {
				data: {	
					ebeneID: 0,
					foiID: foiID,
					favID:0,
					func: "removeVisFOI",
					zoom: map.getZoom() +  parseInt(zoomOffset)
				}
			}).then(function(response){
				elm.setAttribute("src","framework/eye_off.png");
				printOnMap(JSON.parse(response));
			});
		} else {
			request.post(serverUrlViewer+"php/mapElements/index.php", {
				data: {	
					ebeneID: 0,
					foiID: foiID,
					favID:0,
					func: "addVisFOI",
					zoom: map.getZoom() +  parseInt(zoomOffset)
				}
			}).then(function(response){
				elm.setAttribute("src","framework/eye_on.png");
				printOnMap(JSON.parse(response));
			});
		}
	});

}


function printOnMap(res) {
	//alert("DUMMY FOI zeichnen");
	addPoints(res,[])
}
			
function fillKategorien() {
	if (typeof parentKat === "undefined" || parentKat === null) {
		showEbene(0);
	} else {
		showEbene(parentKat);
	}
}


function showFoiInfo(_foiID, _foiType) {
		require(["dojo/request"], function(request){
		aktuelleInfo["id"] = _foiID;
		aktuelleInfo["type"] = _foiType;
		request.post(serverUrlViewer+"php/info/index.php", {
			data: {	
				mandant: 1,
				oID: _foiID,
				oType: _foiType,
				langID: 1
			}
		}).then(function(response){
				var info = JSON.parse(response);
				fillInformation(info);
				highlightFeature(info.marker[0]);
		});
	});
}

function executePowerlink(_foiID, _foiType) {
		require(["dojo/request"], function(request){
		aktuelleInfo["id"] = _foiID;
		aktuelleInfo["type"] = _foiType;
		request.post(serverUrlViewer+"php/info/index.php", {
			data: {	
				mandant: 1,
				oID: _foiID,
				oType: _foiType,
				langID: 1
			}
		}).then(function(response){
				var info = JSON.parse(response);
				fillInformation(info);
				// Kontrollieren ob beim highlighten zentriert werden soll
				if (paramsObj.lat && paramsObj.lon && paramsObj.print == 1) {
					highlightFeature(info.marker[0], false);
				} else {
					highlightFeature(info.marker[0], true);
				}
		});
	});
}



function printKategorie(res) {
require(["dojo/on"], function(on){


	var list = document.createElement("ul");
	var item = null;
	var lib, eye;
	if (res.parentKat !== null) { 
		lib = document.createElement("li");	
		lib.className += " back";
		eye = document.createElement("img");
		eye.setAttribute("src","framework/arr_left.png");
		eye.setAttribute("class","backArr");
		on(lib, "click", function(evt){
					showEbene(res.parentKat);
				});
		lib.appendChild(eye);
		lib.appendChild(document.createTextNode(res.title));
		list.appendChild(lib);
	}

	var fav = null;
	var img = null;
	var label = [];
	
	for (var i=0; i < res.items.length; i++) {
		item = res.items[i];
		lib = document.createElement("li");
		if (item.type === "Kategorie") {
			lib.className = "cat";
			if (item.display) {
				eye = document.createElement("img");
				eye.setAttribute("src","framework/eye_on.png");
				eye.setAttribute("class","catEye");
				lib.appendChild(eye);
			} else {
				eye = document.createElement("img");
				eye.setAttribute("src","framework/eye_off.png");
				eye.setAttribute("class","catEye");
				lib.appendChild(eye);
			}
			(function (_label,_item) {
           		on(_label, "click", function(evt){
					VisibleEbene(_item.id,_label);
				});
        	})(eye,item);
			
			
			label	 = document.createElement("label");
			label.appendChild(document.createTextNode(item.title));
			(function (_label,_item) {
           		on(_label, "click", function(evt){
					showEbene(_item.id);
				});
        	})(label,item);
			
			
			lib.appendChild(label);
		}	else {
			lib.className = "dog";
			img = document.createElement("img");
			if (item.img === null) {
				img.setAttribute("src","framework/photo.png");
			} else {
				img.setAttribute("src",item.img);
			}
			img.setAttribute("class","itemPic");
			lib.appendChild(img);
			label = document.createElement("label");
			label.appendChild(document.createTextNode(item.title));
			lib.appendChild(label);
			(function (_label,_item) {
           		on(_label, "click", function(evt){
					showFoiInfo(_item.id, _item.type);
				});
        	})(label,item);
			(function (_label,_item) {
           		on(_label, "click", function(evt){
					showFoiInfo(_item.id, _item.type);
				});
        	})(img,item);

			div = document.createElement("div");
			if (item.display) {
				eye = document.createElement("img");
				eye.setAttribute("src","framework/eye_on.png");
				div.appendChild(eye);
			} else {
				eye = document.createElement("img");
				eye.setAttribute("src","framework/eye_off.png");
				div.appendChild(eye);
			}
			(function (_label,_item) {
           		on(_label, "click", function(evt){
					VisibleFOI(_item.id,_label);
				});
        	})(eye,item);

			if (item.favorite) {
				fav = document.createElement("img");
				fav.setAttribute("src","framework/fav_on.png");
				div.appendChild(fav);
			} else {
				fav = document.createElement("img");
				fav.setAttribute("src","framework/fav_off.png");
				div.appendChild(fav);
			}
			(function (_label,_item) {
           		on(_label, "click", function(evt){
					setFavorite(_item.id,_label);
				});
        	})(fav,item);

			
			lib.appendChild(div);
		}
		list.appendChild(lib);
	
	}
	
	document.getElementById("kategorien").innerHTML = "";
	document.getElementById("kategorien").appendChild(list);
});	
}


var imageRotateTimeout = null;

	var fillInformation = function(infoJSON) {
			closeRouting();
			updateLinkForPrint(infoJSON.id);
			//closeMenus();

			require([
					"dojox/mobile/DataCarousel",
					"dojo/data/ItemFileReadStore",
					"dojox/image/Lightbox",
					"dojo/_base/connect",
					"dijit/TitlePane", 
					"dojo/dom", 
					"dojo/dom-construct", 
					"dojo/dom-style", 
					"dojo/dom-attr",
					"dojo/dom-class",
					"dojo/query",
					"dojo/on",
    				"dojox/mobile",
    				"dojox/mobile/parser"], 
			function(DataCarousel,ItemFileReadStore,Lightbox,connect,TitlePane, dom, domConstruct, domStyle, domAttr, domClass, query, on){
			if (imageRotateTimeout != null) {
				clearTimeout(imageRotateTimeout);
			}

			domStyle.set(dom.byId("operating"),"display","block");
			domStyle.set(dom.byId("informationenContent"),"display","none");
	
			var ic = dom.byId("informationenContent");
			var it = dom.byId("FOITitelText");
			var io = dom.byId("operating");

			// Alte Informationen löschen
			domConstruct.empty("informationenContent");
			
			// Neue Informationen generieren
			it.innerHTML = infoJSON.title;
			domConstruct.empty("infoFav");
			var img = document.createElement("input");
			img.setAttribute("id","favButtonInfo");
			img.setAttribute("type","button");
			var label = document.createElement("label");
			label.setAttribute("for","favButtonInfo");
			if (infoJSON.favorite) {
				img.setAttribute("style","background-image:url('framework/fav_on.png')");
				var tN = document.createTextNode("Als Favorit markiert");
				label.appendChild(tN);
			} else {
				img.setAttribute("style","background-image:url('framework/fav_off.png')");
				var tN = document.createTextNode("Zu Favoriten hinzufügen");
				label.appendChild(tN);
			}
			var iF = document.getElementById("infoFav");
			iF.appendChild(img);
			iF.appendChild(label);
			(function (_label,_item) {
           		on(_label, "click", function(evt){
					setFavorite(_item.id,_label);
				});
        	})(img,infoJSON);
			
			
			var tp = null;
			for (var c = 0; c < infoJSON.infotexte.length; c++) {
				tp = new TitlePane({
        			title:infoJSON.infotexte[c].title,
       		 		content:infoJSON.infotexte[c].text,
        			open:false
   				});
    			ic.appendChild(tp.domNode);
			}
			var picHeight = 0;
			if (infoJSON.pictures.length > 0) {
				picHeight = 250;
				domStyle.set(dom.byId("infoImgGal"),"display","");
				var jd = {items:infoJSON.pictures};
				store1 = new ItemFileReadStore({data:jd});
		 		store1.clearOnClose = true;	
	
				if (carousel1 === null) {		
					carousel1 = new DataCarousel({
   	     	    		height:"250px",
   	         			navButton:true,
   	         			numVisible:1,
   	    		     	title:"",
   	         			store:store1,
   	         			selectable:true
		        		}, "infoImgGal");
   	     	
        			var hh = domStyle.get(dom.byId("head"),"height");
        			if (hh !== 40) {
	        				connect.subscribe("/dojox/mobile/carouselSelect", function(carousel, itemWidget, itemObject, index){
           	 		
	         			  	function clearOldList(size, request){
   	        					if (lbA.length > 0) {
   	        						dijit.byId("dojoxLightboxDialog").destroy();
   	        						for (var cnt =0; cnt < lbA.length; cnt++) {
				           				lbA[cnt].destroy();
   	     			   			}
           					}
           					lbA = [];
		    			}	
	
			       		// Callback for processing a returned list of items.
	       				function gotItems(items, request){
			        	   	var i;
	    	       	 		for(i = 0; i < items.length; i++){
   		     	     			var item = items[i];
   		     	     			lbA.push(new dojox.image.Lightbox({ title:"", group:"groupLB", href:carousel.store.getValue(item, "hsrc") }));
   		     	     			lbA[i].startup();
   	        	  			}
  		       			}
      	 
	  		     		// Callback for if the lookup fails.
	  		     		function fetchFailed(error, request){
  	 			       		alert("lookup failed.");
  	 		   	 		}
  	 
   		 		       	carousel.store.fetch({onBegin: clearOldList, onComplete: gotItems, onError: fetchFailed}); 	
   		     		   	lbA[index].show(); 	
   		     		   	query(".dijitDialogUnderlayWrapper").style("display","block");
       		 		});
					}				
					carousel1.startup();
				} else {
					// carousel refresh..
					carousel1.setStore(store1);
			  		carousel1.refresh();
				}
				imageRotateTimeout = setTimeout(rotateGalery,5000);
				// Click-Event auf PageIndicator
				var pIClick = on(document, ".mblPageIndicatorDot:click",function(evt) {
					var t = evt.target;
					var pc = query(".mblPageIndicatorDot");
					var a = 0;
					var clickNum = 0;
					var aktW = 0;
					for (a = 0; a < pc.length; a++) {
						if (pc[a] === t) {
							clickedNum = a;
						}
						if (domClass.contains(pc[a],"mblPageIndicatorDotSelected")) {
							aktW = a;
						}
					}
					if (clickedNum === aktW) {
						return;
					}
					var dir = (clickedNum < aktW) ? -1 : 1;
					var cnt = 0;
		
					var sV = carousel1.currentView.getSiblingViews();		
					carousel1.instantiateView(sV[clickedNum]);		
					carousel1.currentView.goTo(dir,sV[clickedNum].id);

				});
			
	        	if (jd.length < 2) {
					query('.mblCarouselBtnContainer').style('display','none'); 
   		     	} else {
        			query('.mblCarouselBtnContainer').style('display','none'); 
        		}
        	} else {
        		domStyle.set(dom.byId("infoImgGal"),"display","none");
        	}
			
			query("#aktion ul li").style('display','none');
			query("#aktion>div").style("display","none");
			if (infoJSON.aktion !== null) {
				dijit.byId("Aktionen").set("title",infoJSON.aktion.title);
				dijit.byId("Aktionen").set("content",infoJSON.aktion.text);
				query("#aktion div#Aktionen").style("display","");
				query("#aktion ul li.aktion").style("display","");
				
			}	
			if (handleShowInMapButton !== null) {
				handleShowInMapButton.remove();
			}
			(function (_label,_item) {
           		handleShowInMapButton = on(_label, "click", function(evt){
						highlightFeature(_item.marker[0]);
						closeMenus(true);
						closeInfo();
					});
        	})(query("#infoMapButton"),infoJSON); 
			 
			 
			
			if (infoJSON.termin !== null) {
				dijit.byId("Termin").set("title",infoJSON.termin.title);
				dijit.byId("Termin").set("content",infoJSON.termin.text);
				query("#aktion div#Termin").style("display","");
				query("#aktion ul li.termin").style("display","");
			}
			
			if (infoJSON.stelle !== null) {
				dijit.byId("Stellenangebot").set("title",infoJSON.stelle.title);
				dijit.byId("Stellenangebot").set("content",infoJSON.stelle.text);
				query("#aktion div#Stellenangebot").style("display","");
				query("#aktion ul li.stelle").style("display","");
			}
		
			var browserInfo = getBrowserInfo();
			if (browserInfo.indexOf('IE ') > -1) {
				var hhh = window.innerHeight - 270 - picHeight;
				domStyle.set(dom.byId("informationenContent"),"max-height",hhh+"px");
			}
			domStyle.set(dom.byId("operating"),"display","none");
			domStyle.set(dom.byId("informationenContent"),"display","");
			domStyle.set(dom.byId("infoFenster"),"display","-webkit-box");
			domStyle.set(dom.byId("infoFenster"),"display","box");
			domStyle.set(dom.byId("infoFenster"),"display","flex");
			domStyle.set(dom.byId("infoFenster"),"display","-webkit-flex");
			});
			
			openAllInfos();
		}
