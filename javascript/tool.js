var Tool = 
{
	getElementsByClassName : function(oElm, strTagName, strClassName)
	{
    	var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    	var arrReturnElements = new Array();
    	strClassName = strClassName.replace(/\-/g, "\\-");
    	var oRegExp = new RegExp("(^|\\s)" + strClassName + "(\\s|$)");
    	var oElement;
    	for(var i=0; i<arrElements.length; i++)
    	{
        	oElement = arrElements[i];      
        	if(oRegExp.test(oElement.className))
        	{
            	arrReturnElements.push(oElement);
        	}   
    	}
    	return (arrReturnElements)
	},
	
	getInnerWidth : function()
	{
		var x;
		if (self.innerHeight) // all except Explorer
		{
			x = self.innerWidth;
		}
		else if (document.documentElement && document.documentElement.clientHeight)
		// Explorer 6 Strict Mode
		{
			x = document.documentElement.clientWidth;
		}
		else if (document.body) // other Explorers
		{
			x = document.body.clientWidth;
		}
		return x;
	},

	getInnerHeight : function()
	{
		var y;
		if (self.innerHeight) // all except Explorer
		{
			y = self.innerHeight;
		}
		else if (document.documentElement && document.documentElement.clientHeight)
		// Explorer 6 Strict Mode
		{
			y = document.documentElement.clientHeight;
		}
		else if (document.body) // other Explorers
		{
			y = document.body.clientHeight;
		}
		
		return y;
	},
	
	lTrim : function ( value ) 
	{	
		var re = /\s*((\S+\s*)*)/;
		return value.replace(re, "$1");	
	},
	
	
	rTrim : function ( value ) 
	{
		var re = /((\s*\S+)*)\s*/;
		return value.replace(re, "$1");
	},
	
	
	trim : 	function( value ) 
	{	
		return Tool.lTrim(Tool.rTrim(value));	
	},
	
	stripQuotes: function(str)
	{
		return str.substring(1,str.length-1);
	},
	
    decToHex: function (d) 
    {
        max = Math.pow(16,8);
    
        var z = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9","A", "B", "C", "D", "E", "F");
        var x = "";
        var i = 1, v = d, r = 0;
        while (v > 15) 
        {
          v = Math.floor(v / 16);
          i++;
        }
        v = d;
        
        for (j=i; j >= 1; j--) 
        {
          x = x + z[Math.floor(v / Math.pow(16, j-1))];
          v = v - (Math.floor(v / Math.pow(16, j-1)) * Math.pow(16, j-1));
        }
      
        if(x.length == 1) x ="0" +x;
        return x;
    },
    
   _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

	encode : function (input) 
	{
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;

		while (i < input.length) 
		{

			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);

			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;

			if (isNaN(chr2)) 
			{
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) 
			{
				enc4 = 64;
			}

			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

		}

		return output;
	},

	decode : function (input) 
	{
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;

		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

		while (i < input.length) 
		{

			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));

			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;

			output = output + String.fromCharCode(chr1);

			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}

		}

		return output;

	},

	utf8_encode : function (string) 
	{
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) 
		{

			var c = string.charCodeAt(n);

			if (c < 128) 
			{
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) 
			{
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else 
			{
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}

		}

		return utftext;
	},

	utf8_decode : function (utftext) 
	{
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while ( i < utftext.length ) 
		{

			c = utftext.charCodeAt(i);

			if (c < 128) 
			{
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) 
			{
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else 
			{
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}

		}

		return string;
	},
    
    getHTML : function(node)
    {
        var str = "<" + node.nodeName + this.getNodeAttributes(node) + ">" ;
          
        str += this.getInnerHTML(node);       
            
        str += "</" + node.nodeName + ">";
          
        return str;
    },
    
    getInnerHTML : function(node)
    {
        var str = "";
   
        for (var i=0; i<node.childNodes.length; i++)
        {
            str += this.getOuterHTML(node.childNodes.item(i));
        }  
        
        return str;
    },
    
    getOuterHTML : function(node)
    {
        var str = "";

        switch (node.nodeType) 
        {
           case 1: // ELEMENT_NODE
              str += "<" + node.nodeName;
              
              str += this.getNodeAttributes(node);
              
              if (node.childNodes.length == 0)
              {
                 str += "></" + node.nodeName + ">"
              }
              else 
              {
                 str += "></" + node.nodeName + ">" + this.getInnerHTML(node);               
              }
              break;
        
           case 3:   //TEXT_NODE
              str += node.nodeValue;
              break;
        
           case 4: // CDATA_SECTION_NODE
              str += "<![CDATA[" + node.nodeValue + "]]>";
              break;
        
           case 5: // ENTITY_REFERENCE_NODE
              str += "&" + node.nodeName + ";"
              break;
        
           case 8: // COMMENT_NODE
              str += "<!--" + node.nodeValue + "-->"
              break;
            }
        return str;
    },
    
    getNodeAttributes : function(node)
    {
        var str = "";
        
        for (var i=0; i<node.attributes.length; i++) 
        {
              if (node.attributes.item(i).nodeValue != null) 
              {
                 str += " "
                 str += node.attributes.item(i).nodeName;
                 str += "=\"";
                 str += node.attributes.item(i).nodeValue;
                 str += "\"";
              }
        }
        
        return str;
    }
}

Array.prototype.binarySearch = function(item,comparator)
{
    if(this.length == 0) return -1;
    
    var left = -1;
    var right = this.length;
    var mid;

    if(!comparator)
    {
        comparator = function(item,item2)
        {
            return (item-item2);  
        }; 
    }
    
    while(right - left > 1)
    {
      mid = (left + right) >>> 1;
      if(comparator(this[mid],item) == -1 )
        left = mid;
      else
        right = mid;
    }

    if(comparator(this[right],item) != 0) return -(right + 1);

    return right;
}

if(!google.maps.Map.fromLatLngToContainerPixel) 
{
        google.maps.Map.prototype.fromLatLngToContainerPixel = function(point) 
        {
                // this is the received point, relative to the div
                var pt = this.fromLatLngToDivPixel(point);

                // these are the sw and ne bounds of the map. we need the nw corner,of course.
                var bounds = this.getBounds();
                var sw = bounds.getSouthWest();
                var ne = bounds.getNorthEast();

                // getting the nw corner and translating it into pixels: we want the northern latitude and the western longitude
                var nwPixel = this.fromLatLngToDivPixel(new google.maps.LatLng(ne.lat(), sw.lng()));
                return new google.maps.Point(pt.x - nwPixel.x, pt.y - nwPixel.y);
        }
}

// TGPosition = Class.create();

// TGPosition.prototype =
// {
    // initialize : function(center,zoom)
    // {
        // this.center = center;
        // this.zoom = zoom;
    // },
    
    // equals : function(pos)
    // {
        // if(!pos) return false;
        // return ((this.center.equals(pos.center)) && (this.zoom == pos.zoom));
    // }
// }