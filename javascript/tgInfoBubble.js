function infoBubble (_container,_title,_content) {
	this.title = _title;
	this.content = _content;
	this.element = null;
	this.container = _container;
	
	this.container.style.position = "relative";
	
	this.element = document.createElement("div");
	var existingBubbles = 0; //dojo.query('div[id^="infoBubbleDiv"]');
	var newNumber = 0; // existingBubbles.length;
	
	this.element.setAttribute("id","infoBubbleDiv"+newNumber);
	this.element.setAttribute("class","tg_infoBubble");
	this.element.style.left = "0px";
//	this.element.style.top = this.container.style.height;
	
	this.titleSpan = document.createElement("span");
	this.titleSpan.setAttribute("class","tg_infoBubbleTitle");
	this.titleSpan.innerHTML = this.title;
	
	this.contentSpan = document.createElement("span");
	this.contentSpan.setAttribute("class","tg_infoBubbleContent");
	this.contentSpan.innerHTML = this.content;
	this.element.appendChild(this.titleSpan);
	this.element.appendChild(this.contentSpan);
	var bd = document.getElementsByTagName("body");
	this.container.appendChild(this.element);
	
	var setTitle = function(_title) {
		this.title = _title;
	}
	
	var setContent = function(_content) {
		this.title = _content;
	}
	
	var show = function() {
		this.titleSpan.innerHTML = this.title;
		this.contentSpan.innerHTML = this.content;		
		this.element.style.display = "";
	}
	
	var hide = function() {
		this.element.style.display = "none";
	}
	
	var toggle = function() {
		if (this.element.style.display === "none") {
			this.show();
		} else {
			this.hide();
		}
	}
}
