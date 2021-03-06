//  Profound UI Runtime  -- A Javascript Framework for Rich Displays
//  Copyright (c) 2017 Profound Logic Software, Inc.
//
//  This file is part of the Profound UI Runtime
//
//  The Profound UI Runtime is free software: you can redistribute it and/or modify
//  it under the terms of the GNU Lesser General Public License as published by
//  the Free Software Foundation, either version 3 of the License, or
//  (at your option) any later version.
//
//  The Profound UI Runtime is distributed in the hope that it will be useful,
//  but WITHOUT ANY WARRANTY; without even the implied warranty of
//  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//  GNU Lesser General Public License for more details.
//
//  You should have received a copy of the GNU Lesser General Public License
//  In the COPYING and COPYING.LESSER files included with the Profound UI Runtime.
//  If not, see <http://www.gnu.org/licenses/>.



function getTarget(e) {
	var targ;
	if (!e) e = window.event;
	if (e.touches != null && e.touches.length == 1) {  // detect touch screen device like iPad
	  return e.touches[0].target;
	}
	if (e.target) targ = e.target;
	else if (e.srcElement) targ = e.srcElement;
	if (targ.nodeType == 3) // defeat Safari bug
		targ = targ.parentNode;
  return targ;
}

function preventEvent(event) {
  if (!event) event = window.event;
  if (window.event) {
    window.event.cancelBubble = true;
    window.event.returnValue = false;
  }
  if (event.preventDefault) {
    event.cancelBubble = true;
    event.preventDefault();
  }
}


// IE cannot reliably get elements by name when the element is created/modified with javascript
// The following types of statements do not work reliably in IE6 or IE7: 
//   document.forms[formName].elements[elemName]
//   document.getElementsByName(elemName)
// This is a known IE bug. The following is a workaround:
function getElementByName_iefix(elemName) {
  var form = document.forms["main"];
  var n = form.length;
  for(i = 0; i < n; i++ ) {
    var obj = form.elements[i];
    if (obj.name == elemName) {
      return obj;
    }
  }
  return null;
}


function disableAction(e){
  if(pui["is_old_ie"] && pui["ie_mode"] >= 5){
    e.cancelBubble = true;
    e.returnValue = false;
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  else{
  	e.preventDefault();
  	e.stopPropagation();
  }
}

function preventDoubleSubmit(){

  if (pui["isServerBusy"]()) return false;

  hide_calendar();
  
  // Execute onsubmit function
  if (designScreens[0] && screenPropertiesObj[designScreens[0].screenId] != null && screenPropertiesObj[designScreens[0].screenId].screen != null) {
    var onsubmitProp = screenPropertiesObj[designScreens[0].screenId].screen["onsubmit"];
    if (onsubmitProp != null && onsubmitProp != "") {
      try {
        var onsubmitReturnVal = eval(onsubmitProp);
        if (onsubmitReturnVal == false) return false;
      }
      catch(err) {
        pui.alert("Onsubmit Error:\n" + err.message);
        return false;
      }
    }
  }
  
  pui["haltFrames"]();
  pui.submitLog(pui.genie.formSubmitted = true);
  var cursorPos = getCursorPosition(lastActiveElement);
  if (lastActiveElement != null && lastActiveElement.tagName == "INPUT" && lastActiveElement.maxLength != null && lastActiveElement.maxLength > 0 && cursorPos == lastActiveElement.maxLength) {
    // cursor beyond last character
    cursorPos -= 1;  // set to last character
  }
  document.getElementById('cursorPos').value = cursorPos;
  if (!pui.genie.config.useAjax) return true;
  var form = document.forms['main'];
  
  var hiddenField = createNamedElement("input", "ajax");
  hiddenField.type = "hidden";
  hiddenField.value = "Y";
  form.appendChild(hiddenField);
  ajaxSubmit(form, function(response) {
    newScreenHTML = response;
    prevScreenHTML = document.getElementById(appContainerId).innerHTML;
    document.getElementById(appContainerId).innerHTML = newScreenHTML;
    var scripts = document.getElementById(appContainerId).getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      var script = scripts[i].innerHTML;
      eval(script);
    }
    genie(); 
  });
  return false;
}



/***************************************************************
*  This section of code handles only allowing a set number of  *
*  keys to be pressed.  For example only allowing numbers for  *
*  a numeric field.  This also includes additional keys. These *
*  are keys that must function as normal such as \, Control, *
*  and etc.                                                    *
***************************************************************/
function numericOnly(e){
  if(!e) e = window.event;
  var target = e.srcElement || e.target;
  if (target.autoComp != null) return;
  var allowedUnicodes = new Array(8,9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,46,48,49,50,51,52,53,54,55,56,57,91,93,96,97,98,99,100,101,102,103,104,105,112,123,144,145,112,113,114,115,116,117,118,119,120,121,122,123);
  allowKeys(allowedUnicodes, e);
}
function numericDecimalOnly(e){
  if(!e) e = window.event;
  var target = e.srcElement || e.target;
  if (target.autoComp != null) return;	
  var allowedUnicodes = new Array(8,9,13,16,17,18,19,20,27,32,33,34,35,36,37,38,39,40,45,46,48,49,50,51,52,53,54,55,56,57,91,93,96,97,98,99,100,101,102,103,104,105,110,112,123,144,145,188,190,112,113,114,115,116,117,118,119,120,121,122,123,189,109);
  allowKeys(allowedUnicodes, e);
}
function numericSignOnly(e){
  if(!e) e = window.event;
  var target = e.srcElement || e.target;
  if (target.autoComp != null) return;	
  var allowedUnicodes = new Array(8,9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,46,48,49,50,51,52,53,54,55,56,57,91,93,96,97,98,99,100,101,102,103,104,105,109,112,123,144,145,112,113,114,115,116,117,118,119,120,121,122,123,189,pui["field exit key"]);
  allowKeys(allowedUnicodes, e);
}
function alphabeticOnly(e) {
  if(!e) e = window.event;
  var target = e.srcElement || e.target;
  if (target.autoComp != null) return;
  // As per 5250 manual, allow a-z, A-Z, comma, dot, hyphen, and space.	
  var allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ,.- ";
  var allowedUnicodes = new Array();
  for (var i = 0; i < allowedChars.length; i++) {
    allowedUnicodes.push(allowedChars.charCodeAt(i));
  }
  allowedUnicodes.push(8, 9, 13, 16, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 110);
  allowKeys(allowedUnicodes, e);
}


function defaultField(e){
  var allowedUnicodes = new Array(256)
  
  
  for(var i = 0; i <= 255; i++) {
    allowedUnicodes[i] = i; 
  } 
  
  if(!e) e = window.event;
  allowKeys(allowedUnicodes, e); 
}


function getCursorPosition(obj) { 
  var cur;
  if (typeof obj == "string") obj = getObj(obj);
  if (obj == null) return -1;
  if (obj.tagName != "INPUT" || !pui.isTextbox(obj)) return -1;
  if (document.selection!=null) {
    if (obj==null) obj = document.activeElement; 
    cur = document.selection.createRange(); 
  }
  var pos = 0; 
  if (obj!=null && cur!=null && obj.createTextRange!=null) {  // IE
    try {
      var tr = obj.createTextRange(); 
      if (tr) { 
        while (cur.compareEndPoints("StartToStart", tr) > 0) { 
          tr.moveStart("character", 1); 
          pos++; 
        } 
        return pos; 
      } 
    }
    catch(e) {
      return -1;
    }
  } 
  else if (obj!=null) {  // Firefox
     try {
       if (obj.selectionStart!=null) return obj.selectionStart;
     }
     catch(err) { };
  }
  return -1; 
} 

/**
 * If in Visual Designer or in Genie with Design Mode on, then returns true; else false. Note: this must
 * be called after pui.dspfDesign(), after pui.loadDependencyFiles to correctly detect Visual Designer.
 * @returns {Boolean}
 */
function inDesignMode() {
  if (toolbar == null) return false;
  if (toolbar.designer == null) return false;
  return true;
}



// Checks Ajax response for errors, and adds any messages to the 
// global "errors" object. 
// Returns either standard response object or false to indicate error with the response.
function checkAjaxResponse(ajaxRequest, operation) {

	// Check for HTTP-layer error.
	var errorId;
	var error   = "";
	var error2  = "";
	var responseObj;	
	var isXML = false;
	if (ajaxRequest.getStatus() != 200) {
		errorId = "HTTP " + ajaxRequest.getStatus();
		error = ajaxRequest.getStatusText() + ".";
	}
	// Check for application-layer error.
	// Assume success if there is an XML response (charting). 	
	else {
		isXML = (ajaxRequest.getResponseText().indexOf("<?xml") != -1);
		if (isXML == false) {
			try {
				responseObj = eval("(" + ajaxRequest.getResponseText() + ")");
				if (responseObj.success != true) {
					errorId = responseObj.errorId;
					error   = responseObj.errorText;
					error2  = responseObj.errorText2;
				}
			}
			catch(e) {
				errorId = "CPF9897";
				error = "The server response is missing or invalid.";
			}
		}
	}
	if (errorId != null) {
		errors.push({
			operation: operation,
			id: errorId,
			text: error,
			text2: error2
		});		
		return false;
	}
	else {
		if (isXML == true) return ajaxRequest.getResponseText();
		else return responseObj.response;
	}
	
}


function buildLabel(dom, labelText) {
  var label = document.createElement("div");
  label.style.position = "absolute";
  label.style.borderStyle = "none";
  label.style.backgroundColor = "transparent";
  label.innerHTML = '<label for="' + dom.id + '">' + labelText + '</label>';
  // get z-index from the original element
  if (dom.currentStyle) {
    label.style.zIndex = dom.currentStyle.zIndex;
  }
  else if (window.getComputedStyle) {
    label.style.zIndex = document.defaultView.getComputedStyle(dom, null).getPropertyValue("z-index");
  }
  else {
    label.style.zIndex = 20;  // default z-index for input fields
  }      
  var left;
  var top;
  var width = dom.offsetWidth;
  if (width < 20) width = 20;
  dom.positionMe = null;
  if (pui.isPercent(dom.style.top) || pui.isPercent(dom.style.left) || pui.isPercent(dom.style.bottom) || pui.isPercent(dom.style.right)) {
    top = dom.offsetTop;
    left = dom.offsetLeft;
    if (dom.parentNode.getAttribute("container") == "true")
    dom.positionMe = function() {
        label.style.left = dom.offsetLeft + width + "px";
        label.style.top = dom.offsetTop + "px";
    }
  }
  else {
    left = parseInt(dom.style.left);
    if (isNaN(left)) 
      left = 0;
    top = parseInt(dom.style.top);
    if (isNaN(top)) 
      top = 0;    
  }
  label.style.left = left + width + "px";
  label.style.top = top + "px";
  label.style.zIndex = dom.style.zIndex;
  label.style.visibility = dom.style.visibility;
  label.style.color = dom.style.color;
  label.style.fontFamily = dom.style.fontFamily;
  label.style.fontSize = dom.style.fontSize;
  label.style.fontStyle = dom.style.fontStyle;
  label.style.fontWeight = dom.style.fontWeight;
  label.style.backgroundColor = dom.style.backgroundColor;
  //if (context == "dspf") label.style.paddingTop = "1px";
  if (dom.style.cursor) {
    label.style.cursor = dom.style.cursor;
  }
  else {
    label.style.cursor = "pointer";
  }
  label.isLabel = true;
  dom.labelObj = label;
  dom.extraDomEls = [];
  dom.extraDomEls.push(label);
  dom.parentNode.appendChild(label);  
}

// Returns the PC-side timestamp in milliseconds since 1970/01/01 as a string.
function getTimeStamp() {

  return String(new Date().getTime());

}


pui.getPropConfig = function(namedModel, propertyName) {
  var config = namedModel[propertyName];
  if (config == null) {
    var parts = propertyName.split(" ");
    var idx = Number(parts[parts.length - 1]);
    if (!isNaN(idx) && idx > 0) {
      parts.pop();
      var configName = parts.join(" ");
      var modelConfig = namedModel[configName];
      if (modelConfig != null) {
        config = {};
        for (var prop in modelConfig) {
          var value = modelConfig[prop];
          if (prop == "name") {
            config["name"] = propertyName;
          }
          else if (typeof value == "object" && value.length != null) {  // array
            config[prop] = [];
            for (var i = 0; i < value.length; i++) {
              config[prop].push(value[i]);
            }
          }
          else {
            config[prop] = modelConfig[prop];
          }
        }
      }
    }
  }
  return config;
}


// Returns index of element in array, if found, or -1 if not.
pui.arrayIndexOf = function (array, element) {

  for (var i = 0; i < array.length; i++) {
    if (array[i] == element) return i;
  }
  return -1;

}

// Calls a function for each array element.
pui.arrayForEach = function(array, func) {

  for (var i = 0; i < array.length; i++) {
    func(array[i]);
  }
  
}


pui.safeParseInt = function(stringValue, nanValue) {
  if (nanValue == null) nanValue = 0;
  var number = parseInt(stringValue, 10);
  if (isNaN(number)) number = nanValue;
  return number;
}

/*  usage:
      addEvent(obj, 'keypress', function(e) {
        e = e || window.event;
        pui.keyFilter(e, regEx);
      });
*/
pui.keyFilter = (function() {

  var specialKeys = {
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: 'Ctrl',
    18: 'Alt',
    19: 'Pause',
    20: 'Caps Lock',
    27: 'Esc',
    33: 'Page Up',
    34: 'Page Down',
    35: 'End',
    36: 'Home',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    45: 'Insert',
    //Safari
    3: 'Enter',
    63234: 'Left',
    63235: 'Right',
    63232: 'Up',
    63233: 'Down',
    63276: 'Page Up',
    63277: 'Page Down',
    63272: 'Delete',
    63273: 'Home',
    63275: 'End'
  };
  
  var specialKeysGecko = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    27: 'Esc',
    33: 'Page Up',
    34: 'Page Down',
    35: 'End',
    36: 'Home',
    37: 'Left',
    38: 'Up',
    39: 'Right',
    40: 'Down',
    46: 'Delete'
  };
  
  var isGecko = !/webkit/.test(navigator.userAgent.toLowerCase()) &&
                /gecko/.test(navigator.userAgent.toLowerCase());
  if (pui["is_ie"]) {

    // IE11 now incl. 'gecko' in the user agent string, which throws off 
    // this code.
    isGecko = false;
  
  }
  
  return function(e, re) {
  
    var chr = String.fromCharCode(e.charCode || e.keyCode);
    
    if(e.ctrlKey ||
      (isGecko && specialKeysGecko[e.keyCode]) ||
      (!isGecko && specialKeys[e.keyCode] && !chr)){
        return;
    }
    
    if(!re.test(chr)){
      preventEvent(e);
    }
  };

})();





function allowKeys(allowedUnicodes, e) {

  // Allow user-defined key mappings in Genie.

  if (context == "genie" && pui.genie.getMappedKeyName(e) != "") {
  
    return true;
  
  }
  
  if (context == "dspf") return allowKeysSimple(allowedUnicodes, e);

  var obj;
  var key;
  var n = 0;
  var len;
  var pos;
  var success;
  var shiftKey;

  //key=(typeof event!='undefined')?window.event.keyCode:e.keyCode;
  key = e.keyCode;
  obj = e.target || e.srcElement; // IE doesn't use .target
  
  var isTextbox = pui.isTextbox(obj);
  
  if (pui.genie.formSubmitted) {
    if (pui.genie.config.enableKeyAhead) {
      if (e.modifiers) shiftKey = e.modifiers && Event.SHIFT_MASK;
      if (!e.modifiers) shiftKey = e.shiftKey;
      if (shiftKey) keyAhead.record("shift" + key);
      else keyAhead.record(key);
    }
    disableAction(e);
    return false;
  }
  
  lastActiveElement = obj;
  
  if (key == 9) {      // tab key
    if (e.modifiers) shiftKey = e.modifiers && Event.SHIFT_MASK;
    if (!e.modifiers) shiftKey = e.shiftKey;
    if (shiftKey) {
      success = goPrev(obj, 0, true);
      if (success) {
        disableAction(e);
        return false;
      }    
    }
    else {
      success = goNext(obj, true);
      if (success) {
        disableAction(e);
        return false;
      }
    }
  }
  //if (key == 8) {     // backspace key
  
    // Let's not do this anymore...
  
    //if (isTextbox) {
    //  pos = getCursorPosition(obj);
    //  if (pos == 0) {
    //    goPrev(obj);
    //    disableAction(e);
    //    return false;              
    //  }
    //}
    //else {
    //  if (obj.tagName != "TEXTAREA") goPrev(obj);
    //  disableAction(e);
    //  return false;
    //}
  //} 
  if (key == 35 && isTextbox) {     // end key
    if (obj.value != rtrim(obj.value)) {
      obj.value = rtrim(obj.value);
    }  
  }
  if (key == 37) {     // left key
    if (isTextbox) {
      pos = getCursorPosition(obj);
      if (pos == 0) {
        goPrev(obj);
        disableAction(e);
        return false;        
      }
    }
    else {
      if (obj.tagName != "TEXTAREA") {
        goPrev(obj);
        disableAction(e);
        return false;        
      }
    }
  } 
  if (key == 38 && obj.tagName != "SELECT" && obj.tagName != "TEXTAREA") {     // up key
  	
  	// Do not process up key if the field is an auto complete field and the 
  	// result pane is open.
  	if (obj.autoComp == null || obj.autoComp.isOpen() == false) {
  	  if (!pui.genie.config.browserAutoComplete) {
	      goUp(obj);
	      disableAction(e);
	      return false;
	    }
  	}
  }   
  if (key == 39) {     // right key
    if (isTextbox) {
      maxLength = Number(obj.getAttribute('maxLength'));    
      pos = getCursorPosition(obj);
      len = obj.value.length;
      if (pos >= len) {
        goNext(obj);
        disableAction(e);
        return false;        
      }
    }
    else {
      if (obj.tagName != "TEXTAREA") {
        goNext(obj);
        disableAction(e);
        return false;        
      }
    }
  }
  if (key == 40 && obj.tagName != "SELECT" && obj.tagName != "TEXTAREA") {     // down key
  	
  	// Do not process up key if the field is an auto complete field and the 
  	// result pane is open.  	
  	if (obj.autoComp == null || obj.autoComp.isOpen() == false) {  	
  	  if (!pui.genie.config.browserAutoComplete) {
  	    goDown(obj);
  	    disableAction(e);
  	    return false;
  	  }
  	}
    
  }
  if (isTextbox && pui.isFieldExit(e)) {    
    pui.storeCursorPosition(obj);
    fieldExit(obj);
    disableAction(e);
    return false;    
  }
  if (key == 109 && isTextbox) {    // numpad minus sign
    pui.storeCursorPosition(obj);
    if (fieldExit(obj, true)) {
      disableAction(e);
      return false;
    }
  }
  
  if (e.ctrlKey == true && (key == 67 || key == 86)) {  // allow ctrl-c and ctrl-v for copy/paste
    return true;
  }
      
  for( var i=0; i < allowedUnicodes.length; i++ ){
    if( allowedUnicodes[i] == key ){
      if(e.modifiers && Event.SHIFT_MASK){
        //case exits
      }
      else{
        return true;
      }
    }
  }
  disableAction(e);
  return false;
}

function fieldExit(obj, minus) {
  if (obj.readOnly == true) return false;
  var blankFill;
  var zeroFill;
  var rightAdjust = false;
  var maxLength;
  var signedNumeric = obj.getAttribute('signedNumeric');
  var needsOnchange = false;
  if (minus && (signedNumeric==null || signedNumeric!='Y')) return false;
  var pos = obj.cursorPosition;
  if (pui["is_touch"] && !pui["is_mouse_capable"]) {
     pos = getCursorPosition(obj);
  }
  if (pos == null) return false;
  if (pos < 0) return false;
  if (pos >= 0) {
	needsOnchange = (obj.value !== obj.value.substr(0, pos)); 
    obj.value = obj.value.substr(0, pos);
    blankFill = obj.getAttribute('blankFill');
    if (signedNumeric!=null && signedNumeric=='Y') blankFill = "Y";
    if (blankFill!=null && blankFill=='Y') {
      rightAdjust = true;
      fill = '                                                                                ';
    }    
    zeroFill = obj.getAttribute('zeroFill');
    if (zeroFill!=null && zeroFill=='Y') {
      rightAdjust = true;
      fill = '00000000000000000000000000000000000000000000000000000000000000000000000000000000';
    }    
    maxLength = obj.getAttribute('maxLength');    
    if (rightAdjust && maxLength!=null) {
      var newValue = fill + ltrim(obj.value);
      newValue = newValue.substr(newValue.length - maxLength);
      if (signedNumeric!=null && signedNumeric=='Y') {
        if (newValue.substr(newValue.length - 1) != '-') {
          if (minus) {
            newValue += "-";
          }
          else {
            newValue += " ";
          }
          newValue = newValue.substr(1);
        }
      }
      obj.value = newValue;
    }
  }
  if (needsOnchange && typeof obj.onchange === 'function') {
	  obj.onchange();
  }
  goNext(obj);
  return true;
}







pui.beforeUnload = function(event) {
  if ((pui["is_touch"] && !pui["is_mouse_capable"]) || pui.iPadEmulation) return;
  if (pui.observer != null) return;
  
  if (pui.confirmOnClose && !pui.skipConfirm) {
    if (context == "genie" && pui.isSignOnScreen()) return;
    var par = window;
    while (par != null && par != par.parent) {
      par = par.parent;
      if (pui.checkForAtrium(par)) return;
      try {
        if (typeof par["pui"] != "undefined") return;
      }
      catch(e) {
      }
    } 
    if (context == "genie" || !inDesignMode() || recordFormats.isDirty()) {
      var theCloseMessage;
      if (pui.codeBased) theCloseMessage = pui.closeMessage;
      else theCloseMessage = pui["getLanguageText"]("runtimeMsg", "closeMessage");
      if (context == "genie" && pui.genie.config.closeMessage != null && pui.genie.config.closeMessage != "") {
        theCloseMessage = pui.genie.config.closeMessage;
      }
      event.returnValue = theCloseMessage;
      return theCloseMessage;
    }
  }
}

pui["unload"] = function() {
  if (pui.shutdownOnClose && pui.observer == null) {
    pui["halted"] = true;
    window["puihalted"] = true;
    pui.killFrames();
    var url;
    if (pui.genie == null) url = getProgramURL("PUI0001200.pgm");
    else url = getProgramURL("PUI0002110.pgm");
    if (pui.psid != null && pui.psid != "") url += "/" + pui.psid;
	if (pui["overrideSubmitUrl"] != null && typeof pui["overrideSubmitUrl"] == "function") {
	  try {
	    url = pui["overrideSubmitUrl"](url);
	  }
	  catch(e) {
	  }
	}	
    if (navigator != null && typeof navigator["sendBeacon"] == "function") {
      navigator["sendBeacon"](url, "shutdown=1");
    }
    else {
      ajax({
        url: url,
        method: "post",
        suppressAlert: true,
        params: {
          "shutdown": "1"
        }
      });
    }
    pui.shutdownOnClose = false;
  }
}

pui.assignUnloadEvents = function() {
  if (window.attachEvent) {
    window.attachEvent("onbeforeunload", pui.beforeUnload);
    window.attachEvent("onunload", pui["unload"]);
  }
  else if (window.addEventListener) {
    window.addEventListener("beforeunload", pui.beforeUnload, false);
    window.addEventListener("unload", pui["unload"], false);        
  }
}


pui.downloadAsAttachment = function(contentType, fileName, data) {

  var form = document.createElement("form");
  form.action = getProgramURL("PUI0009106.pgm") + "?contentType=" + contentType + "&fileName=" + fileName;
  form.method = "post";
  var hiddenField = createNamedElement("input", "data");
  hiddenField.type = "hidden";
  hiddenField.value = data;
  form.appendChild(hiddenField);
  document.body.appendChild(form);
  pui.skipConfirm = true;
  form.submit();    
  setTimeout(function() {
    form.parentNode.removeChild(form);
    pui.skipConfirm = false;
  }, 0);    

}


pui.addCssClass = function(dom, clsName) {
  var cls = dom.className;
  if (cls == null) cls = "";
  var clsArray = cls.split(" ");
  var newClsArray = [];
  for (var i = 0; i < clsArray.length; i++) {
    if (clsArray[i] == clsName) return;
    if (clsArray[i] != "") newClsArray.push(clsArray[i]);
  }
  newClsArray.push(clsName);
  dom.className = newClsArray.join(" ");
  return;
};

/**
 * Change an element's .className by removing a specified class.
 * @param {type} dom      Element to affect.
 * @param {type} clsName  Name of class to remove from className.
 * @returns {undefined}
 */
pui.removeCssClass = function(dom, clsName) {
  dom.className = pui.removeFromStringList(dom.className, clsName);
};

/**
 * Remove a string from a delimiter-separated string of entries. e.g. css class name.
 * 
 * @param {String} separatedListStr   Space-separated list or other type of list string.
 * @param {String} remString          The entry to remove.
 * @param {Null|String} separator     (optional) The delimiter character. Default is space.
 * @returns {String}                  Returns the list sans remString or empty string.
 */
pui.removeFromStringList = function(separatedListStr, remString, separator){
  if (separatedListStr == null) return "";
  if (separatedListStr == "") return "";
  if (separator == null || separator == "") separator = " ";
  var clsArray = separatedListStr.split(separator);
  var newClsArray = [];
  for (var i = 0; i < clsArray.length; i++) {
    if (clsArray[i] != "" && clsArray[i] != remString) newClsArray.push(clsArray[i]);
  }
  return newClsArray.join(" ");
};


pui.setEmptyText = function(dom, emptyText) {
  if (dom.readOnly || dom.disabled) return;
  if (emptyText ==  null || emptyText == null) return;
  var box = dom;
  if (box.comboBoxWidget != null) box = box.comboBoxWidget.getBox();
  box.emptyText = emptyText;
  pui.checkEmptyText(box);
  addEvent(box, "focus", function(e) {
    var target = getTarget(e);
    if (target.value == target.emptyText) {
      target.value = "";
      pui.removeCssClass(target, "empty-text");
    }
  });
  addEvent(box, "blur", function(e) {
    var target = getTarget(e);
    pui.checkEmptyText(target);
  });
}

pui.checkEmptyText = function(dom) {
  if (dom.readOnly || dom.disabled) return;
  if (dom.emptyText ==  null || dom.emptyText == null) return;
  if (dom.value == "") {
    dom.value = dom.emptyText;
  }
  if (dom.value == dom.emptyText) {
    pui.addCssClass(dom, "empty-text");
  }
  else {
    pui.removeCssClass(dom, "empty-text");
  }
}

pui.attachOnUserActivity = function() {
  if (pui.onUserActivityAttached) return;  
  if (pui["onuseractivity"] == null && pui["client side timeout"] != true) return;
  function onUserActivity() {
    if (pui["client side timeout"] == true) pui.timeoutMonitor.timer.reset();
    if (pui["onuseractivity"] != null) pui["onuseractivity"]();
  }
  addEvent(document.body, "keydown", onUserActivity);
  addEvent(document.body, "mousemove",onUserActivity);
  addEvent(document.body, "click",onUserActivity);
  addEvent(document.body, "touchstart",onUserActivity);
  addEvent(document.body, "touchmove",onUserActivity);
  pui.onUserActivityAttached = true;
}


// Keeps the server job from timing out
pui.autoKeepAlive = {};
pui.autoKeepAlive.lastServerAccess = new Date().getTime();
pui.autoKeepAlive.started = false;
pui.autoKeepAlive.timeout = 600;  // in seconds
pui.autoKeepAlive.intervalId = null;

pui.autoKeepAlive.setup = function() {  // called when screen is rendered
  if (pui.autoKeepAlive.started) {
    pui.autoKeepAlive.reset();
    return;
  }
  if (pui["keep alive interval"] == null) return;
  pui.autoKeepAlive.timeout = pui["keep alive interval"];
  pui.autoKeepAlive.start();
}

pui.autoKeepAlive.start = function() {
  if (pui.autoKeepAlive.started) return;
  var milliseconds = pui.autoKeepAlive.timeout * 1000;
  // checking should be more frequent than timeout
  milliseconds = milliseconds / 4;
  if (milliseconds > 3000) milliseconds = 3000;  // at least every 3 seconds
  pui.autoKeepAlive.intervalId = setInterval(pui.autoKeepAlive.check, milliseconds);
  pui.autoKeepAlive.reset();
  pui.autoKeepAlive.started = true;
}

pui.autoKeepAlive.stop = function() {
  if (!pui.autoKeepAlive.started) return;
  clearInterval(pui.autoKeepAlive.intervalId);
  pui.autoKeepAlive.started = false;
}

pui.autoKeepAlive.reset = function() {
  pui.autoKeepAlive.lastServerAccess = new Date().getTime();
}

pui.autoKeepAlive.check = function() {
  var elapsedTime = (new Date().getTime()) - pui.autoKeepAlive.lastServerAccess;  // elapsed time since last server access
  if (elapsedTime >= pui.autoKeepAlive.timeout * 1000) {
    pui["keepAlive"]();
    pui.autoKeepAlive.reset();
  }
}


pui.isRightClick = function(e) {
	if (!e) var e = window.event;
	if (e.which != null) {
		if (e.which > 1) {
			return true;
		}
	}
	if (e.button != null) {
		if (e.button > 1) {
			return true;
		}
	}
	return false;
}


pui.getOffset = function(obj) {
  var curleft = 0;
  var curtop = 0;
  // Get offsets from obj and each offsetParent until there are no more parents.
  while(obj != null ){

    curleft += obj.offsetLeft;
    curtop += obj.offsetTop;

    // Compensate for content scroll position, but not for the body tag.
    // body.scrollTop/Left in Chrome, Safari, and Opera is the window scroll 
    // top/left. Offset shouldn't change when the page scrolls.
    if( obj.tagName !== "BODY") {
      curleft -= obj.scrollLeft;
      curtop -= obj.scrollTop;
    }

    // Include the style transform in the offset.
    if (obj.className == "scroller") {
      var transform = obj.style["transform"];
      if (transform == null) transform = obj.style["webkitTransform"];
      if (transform != null && typeof transform == "string" && transform.substr(0,10) == "translate(") {
        transform = transform.substr(10);
        transform = transform.split(")")[0];
        var transformParts = transform.split(",");
        var transformLeft = transformParts[0];
        var transformTop = transformParts[1];
        if (transformLeft != null && transformTop != null) {
          transformLeft = parseInt(trim(transformLeft));
          transformTop = parseInt(trim(transformTop));
          if (!isNaN(transformLeft) && !isNaN(transformTop)) {
            curleft += transformLeft;
            curtop += transformTop;
          }
        }
      }

    }
    obj = obj.offsetParent;
  }
  return [curleft,curtop];
};


/**
 * Multi-Part Class
 * @constructor
 */

pui.MultiPart = function() {

  // Public methods.
  this.addParts = function(partsArray) {

    if (typeof(partsArray.length) == "undefined") {
      partsArray = new Array(partsArray);
    }
    var part;
    for (var i = 0; i < partsArray.length; i++) {
      part = {};
      for (var j in partsArray[i]) {
        part[j.toUpperCase()] = partsArray[i][j];
      }
      parts.push(part);
    }
    
  }
  
  this.send = function(url, callback) {

    var newline = "\r\n";
    var partsString = "";
    var part;
    var contentType;
    var boundary = getBoundary();

    // Step one: Turn parts objects UTF-8 encoded part string.
    for (var i = 0; i < parts.length; i++) {
      part = parts[i];
      if (typeof(part["NAME"]) != "string" || typeof(part["VALUE"]) != "string") {
        continue;
      }
      partsString += "--" + boundary + newline;
      partsString += "Content-Disposition: form-data; name=\"" + part["NAME"] + "\"";
      if (typeof(part["FILENAME"]) == "string") {
        contentType = "application/octet-stream";
        if (typeof(part["CONTENTTYPE"]) == "string") {
          contentType = part["CONTENTTYPE"];
        }
        partsString += "; filename=\"" + part["FILENAME"] + "\"" + newline;
        partsString += "Content-Type: " + contentType;
      }
      if (part["TRANSFERENCODING"] != null) {
        partsString += newline + "Content-Transfer-Encoding: " + part["TRANSFERENCODING"];
      }
      partsString += newline + newline;
      partsString += part["VALUE"];
      partsString += newline;
    }
    partsString += "--" + boundary + "--";

    // Step two: Send.
    var req = new pui.Ajax(url);
    req["suppressAlert"] = true;
    req["async"] = true;
    req["method"] = "POST";
    req["sendAsBinary"] = false;
    req.setRequestHeader("Content-Type", "multipart/form-data; boundary=" + boundary);
    req["postData"] = partsString;
    req["onready"] = callback;
    req.send();

  }
  
  // Private fields.
  
  var me = this;
  var parts = new Array();  
  
  // Private methods.  

  function getBoundary() {

    // Generate unique boundary sequence which does not
    // appear in any part values.
    var quit = false;
    var stub = "ProfoundUIMIMEBoundary";
    var boundary;
    var value;
    var found;
    while (!quit) {
      boundary = stub + Math.ceil(1000000000 * Math.random());
      found = false;
      for (var i = 0; i < parts.length; i++) {
        value = parts[i]["VALUE"];
        if (value.indexOf(boundary) != -1) {
          found = true;
          break;
        }
      }
      if (!found) {
        quit = true;
      }
    }

    return boundary;

  }

}

pui.storeEventCursorPosition = function(e) {
   var obj = getTarget(e);
   pui.storeCursorPosition(obj);
}

pui.storeCursorPosition = function( obj ) {
   obj.cursorPosition = getCursorPosition(obj);
}

/**
 * Parse a comma-separated string of field names and return them in a list.
 * 
 * @param {String} propVal
 * @param {Boolean} stopAtFrom  When true, if " FROM " is detected outside a string
 *                              or parentheses, return fieldnames found before it.
 * @returns {Array}   Empty array if no fields parsed.
 */
pui.getFieldList = function(propVal, stopAtFrom) {

  var fields = new Array();
  var fromstr = " from ";
  var frompos = 0;
  var character = "";
  var field = "";
  var parenLevel = 0;
  var inQuote = false;
  for (var i = 0; i < propVal.length; i++) {
    
    if( stopAtFrom === true && frompos == 6){
      // Remove " from " from the last field name, and stop looking.
      field = field.substr(0, field.length - 6);
      break;
    }
    
  	character =  propVal.charAt(i);
  	if (!inQuote) {
    	if (character == "("){
        parenLevel += 1;
        frompos = 0;
      }
    	else if (character == ")"){
        parenLevel -= 1;
        frompos = 0;
      }
      else if (character == "'"){
        inQuote = true;
        frompos = 0;
      }
      else if ( parenLevel == 0 ){
        // If this character matches another character in " from ", then increase position.
        if( character.toLowerCase() == fromstr.charAt(frompos) )
          frompos++;
        else
          frompos = 0; //" from " didn't match, so reset position.
      }
      
    	if (parenLevel < 1) parenLevel = 0;
  	}
  	else {
  		if (character == "'") inQuote = false;
  	}
  	if (character == "," && parenLevel == 0 && !inQuote) {
  	  fields.push(trim(field));
  	  field = "";
      frompos = 0;
    }
    else {
  	  field += character;
    }
  }
  fields.push(trim(field));
  
  return fields;

};

pui.sqlProps = {
            
  "database file" : null,
  "database fields" : null,
  "selection criteria" : null,
  "order by" : null,
  "custom sql" : null,
  "name field" : null,
  "value field" : null,
  "summary option" : null,
  "choices database file" : null,
  "choice options field" : null,
  "choice values field" : null,
  "choices selection criteria" : null
            
};

pui.isSQLProp = function(prop) {

  return (typeof(pui.sqlProps[prop]) != "undefined");  

}

pui.getSQLVarName = function(dom) {

  var varName = context + ".";

  var id = dom.id;
  
  if (context == "genie" && dom.parentNode != pui.runtimeContainer) {
  
    // Strip window index, as the server 
    // processing is not aware of the resulting id at 
    // .scn file processing time.
    var pos = id.lastIndexOf("_W");
    if (pos != -1) {
    
      id = id.substr(0, id.lastIndexOf("_W") + 2);
    
    }
  
  }

  var inGrid = (typeof(dom.parentNode.parentNode.grid) != "undefined");
  if (!inGrid || dom.hasBoundSQLProps) {
  
    varName += id;
  
  }
  else {
  
    var len = id.lastIndexOf(".") + 1;
    varName += id.substr(0, len) + "*";
  
  }
  
  return varName;

}

pui.getSQLParams = function(properties, obj) {

  var isTextbox = (properties["field type"] == "textbox");
  var idx = 1;
  var propVal = "";
  var paramString = "";
  
  do {

    var try1 = "choices parameter value";
    var try2 = "parameter value";
    
    if (idx > 1) {
    
      try1 += " " + idx;
      try2 += " " + idx;
    
    }
    
    propVal = evalPropertyValue(properties[try1]);
    if (propVal == "") {
    
      propVal = evalPropertyValue(properties[try2]);
    
    }
    
    if (propVal != "") {
    
      var paramNum = idx;
      
      if (isTextbox) {
      
        paramNum += 1;
      
      }    
    
      if (paramString != "") {
      
        paramString += "&";
      
      } 
      
      paramString += "p" + paramNum + "=" + encodeURIComponent(propVal); 
      
      if (obj != null) {
      
        obj["p" + paramNum] = propVal;
      
      }
    
    }
  
    idx++;
  
  } while (propVal != "");
  
  if (paramString != "") {
  
    paramString += "&";
  
  }
  
  var dateFmt = pui.getSQLDateFmt();
  var timeFmt = pui.getSQLTimeFmt();
  
  paramString += "datfmt=" + encodeURIComponent(dateFmt.fmt);
  paramString += "&datsep=" + encodeURIComponent(dateFmt.sep);
  paramString += "&timfmt=" + encodeURIComponent(timeFmt.fmt);
  paramString += "&timsep=" + encodeURIComponent(timeFmt.sep);
  
  return paramString;

}



pui.isPercent = function(value) {
  if (value == null) return false;
  if (typeof value != "string") return false;
  if (value == "") return false;
  if (value.substr(value.length - 1, 1) == "%") return true;
  return false;
}


pui.isNumericString = function(value) {
  if (value == null) return false;
  if (typeof value != "string") return false;
  var num = Number(value);
  if (isNaN(num)) return false;
  if (String(num) === value) return true;
  return false;
}

// Returns checks for position/dimension style given as a number and 
// assigns px unit, if so. 

pui.getPosDimString = function(styleName, value) {

  if (styleName == "top" || styleName == "left" || styleName == "height" || styleName == "width") {
  
    if (pui.isNumericString(value)) {
    
      return value + "px";
    
    }
  
  }
  
  return value;

}

pui.getWindowScrollTop = function() {  // gets window scroll top position
  var scrOfY = 0;
  if ( typeof( window.pageYOffset ) == 'number' ) {
    //Netscape compliant
    scrOfY = window.pageYOffset;
  } else if ( document.body && document.body.scrollTop ) {
    //DOM compliant
    scrOfY = document.body.scrollTop;
  } else if ( document.documentElement && document.documentElement.scrollTop ) {
    //IE6 standards compliant mode
    scrOfY = document.documentElement.scrollTop;
  }
  return scrOfY;
}

pui.getNoConnectionMessage = function(req) {

  var msg = pui["getLanguageText"]("runtimeMsg", "no connection message");
  
  if (pui["no connection status"] == true) {
  
    msg += "\n" + req.getStatusMessage();
  
  }

  return msg;

}

pui.getSQLDateFmt = function() {

  var fmt = null;
  var sep = null;
  
  if (typeof(pui["sql date format"]) == "string") {
  
    fmt = pui.SQLDateFmts[pui["sql date format"].toUpperCase()];
  
  }  
  
  if (fmt == null) {
  
    fmt = pui.SQLDateFmts["*ISO"];
  
  }
  
  if (typeof(pui["sql date separator"]) == "string") {
  
    sep = pui.SQLDateSeps[pui["sql date separator"].toUpperCase()];
  
  }  
  
  if (sep == null) {
  
    sep = pui.SQLDateSeps["/"];
  
  }
  
  return {
  
    fmt: fmt,
    sep: sep
  
  }

}

pui.getSQLTimeFmt = function() {

  var fmt = null;
  var sep = null;
  
  if (typeof(pui["sql time format"]) == "string") {
  
    fmt = pui.SQLTimeFmts[pui["sql time format"].toUpperCase()];
  
  }  
  
  if (fmt == null) {
  
    fmt = pui.SQLTimeFmts["*ISO"];
  
  }
  
  if (typeof(pui["sql time separator"]) == "string") {
  
    sep = pui.SQLTimeSeps[pui["sql time separator"].toUpperCase()];
  
  }  
  
  if (sep == null) {
  
    sep = pui.SQLTimeSeps[":"];
  
  }
  
  return {
  
    fmt: fmt,
    sep: sep
  
  }

}


pui.getDomain = function() {
  var parts = location.href.split('://');
  var prepend = "";
  var domain = "";
  if (parts.length > 1) {
    prepend = parts[0] + '://';
    parts.splice(0, 1);
    domain = parts.join('://');
  }
  else {
    domain = location.href;
  }
  domain = prepend + domain.split('/')[0];
  return domain;
}

pui.getLink = function(path) {
  var head = document.getElementsByTagName("head")[0];
  if (head == null) return null;
  var domain = pui.getDomain();
  var links = head.getElementsByTagName("link");
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    if (link.href == path) return link;
    if (link.href == domain + path) return link;
  }
  return null;
}

pui.getScript = function(path) {
  var head = document.getElementsByTagName("head")[0];
  if (head == null) return null;
  var domain = pui.getDomain();
  var scripts = head.getElementsByTagName("script");
  for (var i = 0; i < scripts.length; i++) {
    var script = scripts[i];
    if (script.src == path) return script;
    if (script.src == domain + path) return script;
  }
  return null;
}

// syntax allowed:
//   - string (comma separated): 'A,B,C'
//   - string (json formatted): '["A","B","C"]'
//   - javascript array
pui.parseCommaSeparatedList = function(list) {
  if (typeof list != "string") {
    if (list instanceof Array) return list;
    else return [];
  }
  if (list == "") return [];
  var listArray;
  if (list.substr(0, 1) == "[" && list.substr(list.length - 1, 1) == "]") {
    try {
      listArray = eval(list);
    }
    catch(e) {
    }
  }
  if (listArray == null) listArray = list.split(",");
  return listArray;
}


pui.isHTML5InputType = function(type) {
  switch(type) {
    // provided as a choice in the "input type" property
    case "number":
    case "date":
    case "datetime":
    case "time":
    case "email":
    case "url":
    case "month":
    case "tel":
    case "url":
    // not provided as a choice in the "input type" property, but could be valid HTML5 input types
    case "color":
    case "datetime-local":
    //case "range":
    case "search":
    case "week":
      return true;
    default:
      return false;
  }
}


pui.isTextbox = function(obj) {

  if (obj.tagName == "INPUT") {
    if (obj.type == null || obj.type == "" || obj.type == "text" || pui.isHTML5InputType(obj.type) || obj.type == "password") {
      return true;
    }
  }
  
  return false;

}

pui.isFieldExit = function(e) {

  e = e || window.event;
  var key = e.keyCode;
  var fe = pui["field exit key"];
  
  if ((key == fe) && 
      (!e.shiftKey || fe == 16) && 
      (!e.ctrlKey || fe == 17)) {
  
    return true;
      
  }
  else {
  
    return false;
  
  }        
  
}

pui.hasParent = function(node) {

  var prt = node.parentNode;
  return (prt != null && (!pui["is_old_ie"] || prt.nodeName != "#document-fragment"));

}

pui.appendAuth = function(url) {  
 	if (!inDesignMode() && typeof url == "string" && url.search("AUTH=") == -1) {
 	  if (url.search(/\?/) == -1) url += '?';
 	  else url += '&';
    url += "AUTH=" + encodeURIComponent(pui["appJob"]["auth"]);
 	}
 	return url;
}



pui.validateEmail = function(email) { 
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
} 

pui.isBound = function(propVal) {
  return (propVal != null && typeof propVal == "object" && typeof propVal["fieldName"] == "string");
};

pui.isTranslated = function(propVal) {
  return (propVal != null && typeof propVal == "object"
    && typeof propVal["translations"] == "object"
    && propVal["translations"] != null
    && typeof propVal["translations"].length == "number");
};

pui.taphold = function(target, handler, threshold) {

  if (!pui["is_touch"] || !target || !target.addEventListener) return;
  if (typeof handler != "function") return;
  if (typeof threshold != "number") threshold = 750;
  
  var timeoutId;

  function start(e) {
  
    timeoutId = setTimeout(function() {
    
      timeoutId = null;
      handler(e);
    
    }, threshold);
  
  } 

  function stop(e) {
  
    clearTimeout(timeoutId);
    timeoutId = null;
      
  }  
  
  target.addEventListener("touchstart", start, false);
  target.addEventListener("touchend", stop, false);  
  
}

// Used to fix IE8 printing issue, see here: 
// http://stackoverflow.com/questions/3591464/print-page-shows-unchanged-checkbox-in-ie-with-doctype
// --DR.
pui.fixCheckPrint = function(el) {

  if (el.checked) {
  
    el.setAttribute("checked", "checked");
  
  }
  else {
  
    el.removeAttribute("checked");
  
  }

}

pui.xmlEscape = function(str) {

  str = "" + str;
  str = str.replace(/&/g, "&amp;");
  str = str.replace(/</g, "&lt;");
  str = str.replace(/>/g, "&gt;");
  str = str.replace(/"/g, "&quot;");   // " - fake comment to fix syntax highlighting
  return str;  

}


// Used to fix Redmine 692 - iFrame close error issue when not in the same domain - Firefox and Chrome 
// Function is used in this utils.js, genie.js and render.js

pui.checkForAtrium = function(parentWindow) {
  var hasAtrium = false;
  
  try {
    hasAtrium = (typeof(parentWindow["Atrium"]) != "undefined" && typeof(parentWindow["Atrium"]["api"]) != "undefined");
  }
  catch(e) {
  }

  return hasAtrium;
}


pui.isLocalStorage = function() {

try {
if (localStorage != null && typeof(window.localStorage) != "undefined")
		return true;
	
	else
		return false;
	}
	
catch(e){
	return false;
	}
}



pui.normalizeColor = function(value) {
  if (value.substr(0,1) == "#") value = value.toUpperCase();
  if (value.substr(0,4) == "rgb(" && value.substr(value.length-1, 1) == ")") {
    value = value.substr(4, value.length - 5);
    value = value.replace(/ /g, "");
    var hexCodes = value.split(",");
    value = "#";
    for (var i = 0; i < hexCodes.length; i++) {
      var hex = Number(hexCodes[i]).toString(16).toUpperCase();
      if (hex.length == 1) hex = "0" + hex;
      value += hex;
    } 
  }
  return value;
}

pui.logException = function(e, prefix) {

  var msg;
  if (e.stack) {
  
    msg = e.toString();
    var parts = e.stack.split("\n");
    if (parts.length >= 1) {
    
      if (msg.indexOf(trim(parts[0])) != 0 || parts.length < 2) {
      
        msg += " " + trim(parts[0]);
      
      }
      else {
      
        msg += " " + trim(parts[1]);
      
      }
    
    }
  
  }
  else {
  
    if (typeof prefix == "string") msg = prefix;
    msg += " " + e.toString();
  
  }
  
  console.log(msg);

}

// This fixes:
// http://redmine/issues/791

pui.posFix = function(elem) {

  if (pui["is_chrome"] && pui.isTextbox(elem)) {
  
    // Yes, that's really all there is to it!
    var temp = elem.value;
    elem.value = "";
    elem.value = temp;
  
  }

}


pui.highlightText = function(node, text) {
  if(node === undefined || !node) return;
  if (node.tagName == "SPAN" && node.className == "pui-highlight") return;

  if(node.hasChildNodes()) {
    for(var i=0; i < node.childNodes.length; i++) {
      pui.highlightText(node.childNodes[i], text);
    }
  }
  if (node.nodeType == 3) { // NODE_TEXT
    var content = node.nodeValue;
    if (content != null && typeof content == "string") {
      var contentLower = content.toLowerCase();
      while (contentLower.indexOf(String.fromCharCode(160)) != -1) {    
        contentLower = contentLower.replace(String.fromCharCode(160), " ");
      }
      var textLower = text.toLowerCase();
      var idx = contentLower.indexOf(textLower);
      if (idx >= 0) {
        var foundText = content.substr(idx, text.length);
        var hiSpan = document.createElement("span");
        hiSpan.appendChild(document.createTextNode(foundText));
        hiSpan.className = "pui-highlight";
  
        var after = node.splitText(idx);
        after.nodeValue = after.nodeValue.substring(text.length);
        node.parentNode.insertBefore(hiSpan, after);
      }
    }
  }
}


pui.dehighlightText = function(div) {
  var spans = div.getElementsByTagName("span");
  while(spans.length && (span = spans[0])) {
    var parent = span.parentNode;
    parent.replaceChild(span.firstChild, span);
    parent.normalize();
  }
}


pui.startMouseCapableMonitoring = function() {
	if (pui["is_mouse_capable"]) {
	  return;
	}

	if (pui.isLocalStorage() && localStorage["pui-is-mouse-capable"] == "true") {
		pui["is_mouse_capable"] = true;
		return;
	}

	var docElement = document.documentElement;
	if (docElement == null) return;

	// Look for 2 consecutive 'mousemove' events without an intervening
	// 'mousedown'; this excludes touch screen tap events
	var onMouseDown = function () {
		hadMouseOver = false;
	};
	var onMouseMove = function () {
		if (hadMouseOver) {
			pui["is_mouse_capable"] = true;
			if (pui.isLocalStorage()) {
				localStorage.setItem("pui-is-mouse-capable", "true");
			}
			if (pui.gridsDisplayed != null && pui.gridsDisplayed.length > 0) {
			  for (var i = 0; i < pui.gridsDisplayed.length; i++) {
			    var grid = pui.gridsDisplayed[i];
			    if (grid != null && typeof grid.setScrollBar == "function") {
			      if (grid.scrollbarObj != null) {
			        if (grid.scrollbarObj.destroy == "function") grid.scrollbarObj.destroy();
              grid.scrollbarObj = null;
			      }
			      grid.setScrollBar();
			    }
			  }
			}
			removeEvent(docElement, 'mousedown', onMouseDown);
			removeEvent(docElement, 'mousemove', onMouseMove);
		}
		hadMouseOver = true;
	};

	var hadMouseOver = false;
	addEvent(docElement, 'mousedown', onMouseDown);
	addEvent(docElement, 'mousemove', onMouseMove);
}

pui.killFrames = function() {
  
  // For Redmine #2287, Chrome doesn't seem to fire the "unload" 
  // event for iframes when a Chrome tab is closed.
  if (pui["is_chrome"]) {

    var iframes = document.getElementsByTagName("iframe");
    for (var i = 0; i < iframes.length; i++) {

      var iframe = iframes[i];
      
      var puiObj = null;
      try {
        puiObj = iframe.contentWindow["pui"];
        iframe.contentWindow["puihalted"] = true;
      }
      catch(e) { /* ignore */ }
      
      if (puiObj != null && typeof puiObj["unload"] === "function") {
        puiObj["halted"] = true;
        puiObj["unload"]();
      }
      else {
        iframe.src = "";
      } 
      
    }

  }  
  
}


pui["haltFrames"] = function() {
  
  var iframes = document.getElementsByTagName("iframe");
  for (var i = 0; i < iframes.length; i++) {

    var iframe = iframes[i];
    if( iframe != null ){
    
      var puiObj = null;
      try {
        puiObj = iframe.contentWindow["pui"];
        iframe.contentWindow["puihalted"] = true;
      }
      catch(e) { /* ignore */ }

      if (puiObj != null && typeof puiObj === "object") {
        puiObj["halted"] = true;
        if (typeof puiObj["haltFrames"] === "function") {
          puiObj["haltFrames"]();
        }
      }

      // Since haltFrames can be called in the middle of a session, avoid breaking the
      // back button behavior by removing the element before clearing "src". Issue 2503.
      if( iframe.parentNode != null )
        iframe.parentNode.removeChild(iframe);

      // Prevent the browser from trying to continue loading the document.
      iframe.src = "";
    }
  }
};

/**
 * Initialize the break-message settings, storage, and event handlers. Start
 * polling. Called by init() in runtime/5250/init.js or render() in
 * runtime/dspf/render.js.
 * 
 * Requires a browser that supports localStorage and JSON.
 * 
 * Note: un-obfuscated so that you can stop by setting pui["brkmsg enable"]=false,
 * and resume by calling pui.breakMessagesInit() from the console or 
 * user script.
 * 
 * @returns {undefined}
 */
pui["breakMessagesInit"] = function(){
  // Do nothing if local storage isn't supported or break-messages not enabled.
  if( inDesignMode() || pui["brkmsg enable"] !== true ) return;
  if( !pui.isLocalStorage() || typeof(JSON) !== "object") return;
  // Do nothing if there is no user or user is QTMHHTP1.
  if(typeof(pui.appJob) !== "object" || pui.appJob["user"].length <= 0
  || pui.appJob["user"] === "QTMHHTP1" ) return;
  
  // Ensure that polling interval is valid.
  pui["brkmsg poll interval"] = Number(pui["brkmsg poll interval"]);
  if( isNaN(pui["brkmsg poll interval"]))
    pui["brkmsg poll interval"] = 30;
  // Fastest interval allowed is 1 second.
  else if( pui["brkmsg poll interval"] < 1 )
    pui["brkmsg poll interval"] = 1;
  
  // Ensure that max-error-count exists.
  pui["brkmsg max errors"] = Number(pui["brkmsg max errors"]);
  if( isNaN(pui["brkmsg max errors"]))
    pui["brkmsg max errors"] = 3;
  
  // Maximum messages to show at once. 
  pui["brkmsg max messages"] = Number(pui["brkmsg max messages"]);
  if( isNaN(pui["brkmsg max messages"]))
    pui["brkmsg max messages"] = 10;
  
  // User polling timeout in seconds. UserId will be cleared from localStorage
  // if no polling happened for that user recently.
  pui["brkmsg user timeout"] = Number(pui["brkmsg user timeout"]);
  if( isNaN(pui["brkmsg user timeout"]))
    pui["brkmsg user timeout"] = 300;
  // Prevent unpredictable behavior when timeout happens too quickly.
  else if( pui["brkmsg user timeout"] <= pui["brkmsg poll interval"] )
    pui["brkmsg user timeout"] = pui["brkmsg poll interval"] + 10;
  
  // Current error count.
  pui.breakMessageErrors = 0;

  // Become the active poller if necessary.
  pui.breakMessagesPollCheck();

  // If we are a new session and old messages exist, then get ready to show them.
  var msgs;
  try{ msgs = JSON.parse(localStorage.getItem("brkmsgMessages_"+pui.appJob["user"])); }
  // If the messages couldn't parse, just clear them.
  catch(exc){ localStorage.setItem("brkmsgMessages_"+pui.appJob["user"], "[]"); }

  // Setup the non-Atrium container and event listener.
  if( window.parent == window || !pui.checkForAtrium(window.parent) ){
    // Create a UI container.
    var container = document.createElement("div");
    container.id = "pui-break-messages";
    container.style.zIndex = pui.windowZIndex++;
    pui.runtimeContainer.appendChild(container);

    if( pui.isLocalStorage()){
      // Avoid duplicate event handlers by removing before adding.
      removeEvent(window, "storage", pui.breakMessagesOnStorage);
      // Listen on our window for messages from storage.
      addEvent(window, "storage", pui.breakMessagesOnStorage);
      // Show pending messages.
      if(msgs) pui.breakMessagesShow(msgs);
    }
  } 
  // Setup the Atrium event handler.
  else{
    // Attach a single handler to the Atrium window for all child windows.
    removeEvent(window.parent, "storage", window.parent["Atrium"]["api"]["breakMessagesOnStorage"]);
    addEvent(window.parent, "storage", window.parent["Atrium"]["api"]["breakMessagesOnStorage"]);
    // Show pending messages.
    if(msgs) window.parent["Atrium"]["api"]["breakMessagesShow"](msgs,pui.appJob["user"]);
  }

  pui.breakMessagesStartPoll();  
};//end breakMessagesInit.

/**
 * Check if this session's job should assume the active polling role. If too
 * much time has passed since the last poll, take over as active poller and
 * return true. Otherwise, don't take over and return false.
 * Returns false if the session isn't active.
 * 
 * @returns {Boolean}
 */
pui.breakMessagesPollCheck = function(){
  if( !pui || !pui.appJob || pui.appJob["auth"].length <= 0
  || pui.appJob["user"].length <= 0 ) return false;

  //
  // See if we should take over as active poller.
  //
  var activePoller = localStorage.getItem("brkmsgActivePoller_"+pui.appJob["user"]);
  var lastPoll = Number(localStorage.getItem("brkmsgLastPoll_"+pui.appJob["user"]));
  if( isNaN(lastPoll) ) lastPoll = 0;
  
  // Calculate how many milliseconds since the last poll; calculate how many 
  // seconds is too many: the polling interval + 10 seconds.
  // Assume the other process is gone after that long.
  var now = Date.now();
  var difference_ms = now - lastPoll;
  var compareto_ms = pui["brkmsg poll interval"]*1000 + 10000;
  
  // If there was no activePoller or the last recorded one was too long ago,
  // then take over as active poller.
  if( activePoller === null
  || (difference_ms >= compareto_ms && activePoller !== pui.appJob["auth"])){
    activePoller = pui.appJob["auth"];
    localStorage.setItem("brkmsgActivePoller_"+pui.appJob["user"], activePoller);
    localStorage.setItem("brkmsgLastPoll_"+pui.appJob["user"], now );
  }
  
  //
  // Get the list of all userIds in local storage. See if we should remove any.
  //
  var userIds;
  var listChanged = false;
  try{
    userIds = JSON.parse(localStorage.getItem("brkmsgUserIds"));
  }
  catch(exc){ listChanged = true;}
  if( userIds == null || typeof(userIds.pop) !== "function") {
    userIds = [];
    listChanged = true;
  }
  
  // Make sure current user is in array.
  var activeList = [];
  if( pui.arrayIndexOf(userIds, pui.appJob["user"]) < 0 ){
    activeList.push(pui.appJob["user"]);
    listChanged = true;
  }
  
  // Look at all users from storage and see if they have been inactive too long.
  for(var i=0; i < userIds.length; i++){
    if( userIds[i] !== pui.appJob["user"]){
      var lastPoll = Number(localStorage.getItem("brkmsgLastPoll_"+userIds[i]));
      if(isNaN(lastPoll)) lastPoll = 0;

      // Users keys should be cleared.
      if( Date.now() - lastPoll >= pui["brkmsg user timeout"]*1000 ){
        localStorage.removeItem("brkmsgLastPoll_"+userIds[i]);
        localStorage.removeItem("brkmsgActivePoller_"+userIds[i]);
        localStorage.removeItem("brkmsgMessages_"+userIds[i]);
        listChanged = true;
      }
      // User is still active, keep them.
      else activeList.push(userIds[i]);
    }
  }
  if(listChanged) localStorage.setItem("brkmsgUserIds", JSON.stringify(activeList));
  
  activeList = null;
  userIds = null;
  
  return activePoller === pui.appJob["auth"];
};

/**
 * Start a new Interval function to poll for break messages. 
 * 
 * @returns {undefined}
 */
pui.breakMessagesStartPoll = function(){
  if( inDesignMode() || pui["brkmsg enable"] !== true ) return;

  // Stop a previous Interval if it existed.
  if( typeof(pui.breakMessagePoller) === "number")
    clearInterval(pui.breakMessagePoller);

  // Start a new poller.
  pui.breakMessagePoller = setInterval(function(){
    // If the user logged off or brkmsg became disabled, then stop the poller.
    if(typeof(pui.appJob) !== "object" || pui.appJob["user"].length <= 0
    || pui.appJob["user"] === "QTMHHTP1" || pui["brkmsg enable"] !== true){
      pui.breakMessagesStopPoll();
      return;
    }
    
    // See if we should assume the role as active poller or we are active poller.
    if( pui.breakMessagesPollCheck() ){
      // We are the poller, so poll the server. Otherwise, do nothing.
      ajaxJSON({
        "url": "PUI0009116.PGM",
        "method": "post",
        "async": true,
        "suppressAlert": true, /*Popup alerts every interval would be very annoying.*/
        "params": { "AUTH": pui.appJob["auth"] },
        /* Handler for errors, such as 404. */
        "onfail": function(){
          pui.breakMessageErrors++;
          // If too many errors were encountered polling, then stop polling.
          if( pui.breakMessageErrors >= pui["brkmsg max errors"] ) {
            pui.breakMessagesStopPoll();
            console.log("Stopped break-message polling; too many errors.");
          }
        },
        /* Handler for successful response. parms is a JSON object.*/
        "handler": function(parms){
          // There was an error.
          if( parms == null || typeof(parms) !== "object" || parms["error"] ){
            pui.breakMessageErrors++;
            // If too many errors were encountered polling, then stop polling.
            // Errors here are usually from session time out.
            if( pui.breakMessageErrors >= pui["brkmsg max errors"] ) {
              pui.breakMessagesStopPoll();
            }
          }
          // There was at least one new message.
          else if( parms["success"] && parms["messages"] != null
          && typeof(parms["messages"].pop) === "function"
          && parms["messages"].length > 0 ) {
          
            var brkMessages;
            // Try adding the new messages to any stored ones.
            try{
              // Get existing messages.
              brkMessages = JSON.parse(localStorage.getItem("brkmsgMessages_"+pui.appJob["user"]));
            }
            // Existing messages failed to parse. Ignore.
            catch(exc){ console.log(exc); }

            // If the existing messages aren't an array, discard them.
            if( brkMessages == null || typeof(brkMessages.pop) !== "function"){
              brkMessages = [];
            }
            // Add new messages to end of array, and store the modified array.
            brkMessages = brkMessages.concat(parms["messages"]);
            
            // Make sure the new array isn't too large.
            if( pui["brkmsg max messages"] > 0 && brkMessages.length > pui["brkmsg max messages"] ) {
              // Get the last elements from the array.
              brkMessages = brkMessages.slice(brkMessages.length - pui["brkmsg max messages"], brkMessages.length);
            }
            
            // Send the message to Atrium.
            if( window != window.parent && pui.checkForAtrium(window.parent)){
              window.parent["Atrium"]["api"]["breakMessagesShow"](brkMessages,pui.appJob["user"]);
            }
            else {
              // Non-Atrium: show the message
              pui.breakMessagesShow(brkMessages );
            }
            // Store the message, sending it to any other tabs.
            localStorage.setItem("brkmsgMessages_"+pui.appJob["user"], JSON.stringify(brkMessages));
          }
          // Else no error and success==false: there were no messages.
        }
      });

      localStorage.setItem("brkmsgLastPoll_"+pui.appJob["user"], Date.now() );
    }//done with active poll.
    
    // Fallback for IE8, which supports storage but not storage events:
    // redraw the messages from local storage in case another tab cleared or
    // caught any.
    if( pui.isLocalStorage() && typeof(window.addEventListener) === "undefined"
    && typeof(JSON) === "object" ){
      try{
        var brkMessages = JSON.parse(localStorage.getItem("brkmsgMessages_"+pui.appJob["user"]));
        if( window != window.parent && pui.checkForAtrium(window.parent)){
          window.parent["Atrium"]["api"]["breakMessagesShow"](brkMessages,pui.appJob["user"]);
        }
        else {
          // Non-Atrium: show the message
          pui.breakMessagesShow(brkMessages );
        }
      }
      catch(exc){ console.log(exc); }
    }
  }, pui["brkmsg poll interval"] * 1000 );
};

/**
 * Stop the polling interval and detach break-message storage event listeners.
 * 
 * @returns {undefined}
 */
pui.breakMessagesStopPoll = function(){
  clearInterval(pui.breakMessagePoller);
  removeEvent(window, "storage", pui.breakMessagesOnStorage);
};

/**
 * Dismiss a break message and remove it from local storage. The message will
 * also disappear from other tabs.
 * This function is the onclick handler for the message Close icon.
 * 
 * @param {Event|Object} event
 * @returns {undefined}
 */
pui.breakMessageDismiss = function(event){
  if(typeof(pui.appJob) !== "object" || pui.appJob["user"].length <= 0
  || pui.appJob["user"] === "QTMHHTP1"  ){
    return;
  }

  var target = getTarget(event);
  var msgIdx = target["msgIdx"];
  
  var brkMessages;
  // Try removing just the clicked element from the messages.
  try{
    brkMessages = JSON.parse(localStorage.getItem("brkmsgMessages_"+pui.appJob["user"]));
    if( brkMessages !== null && typeof(brkMessages.splice) === "function" ){
      // Remove the clicked message from the array.
      brkMessages.splice(msgIdx,1);
    }
    else
      brkMessages = [];
  }
  catch(exc){
    console.log(exc);
    brkMessages = [];
  }
  // Update the store, and signal any other tabs to redraw
  localStorage.setItem("brkmsgMessages_"+pui.appJob["user"], JSON.stringify(brkMessages));
  // Redraw the messages with new indices.
  pui.breakMessagesShow(brkMessages);
  brkMessages = null;
};

/**
 * Put a div on the screen for each specified message. This can be called
 * by the AJAX handler or the onStorage handler when new messages arrive.
 * 
 * @param {Array|Object} messages   An array of objects that must have these
 *   members: date, time, msg, jobName, jobUserName, jobNum, jobCurProfName.
 *   
 * @returns {undefined}
 */
pui.breakMessagesShow = function(messages ){
  if( messages == null || typeof(messages.pop) !== "function" ) return;
  
  var bkmsgcont = document.getElementById("pui-break-messages");
  if( ! bkmsgcont ) return;

  // Clear existing messages from the page. The messages argument contains the
  // same messages as the store, so make sure what is visible agrees with
  // what other tabs show.
  bkmsgcont.innerHTML = "";
  
  if( messages.length == 0) {
	  pui["unmaskScreen"]();
	  return;
  }

  pui["maskScreen"]();

  // Keep pushing the container to the top.
  pui.windowZIndex += 2;
  bkmsgcont.style.zIndex = pui.windowZIndex;
  
  var top = 10;
  var left = 10;

  // Show each message in a set of DIVs.
  for(var i=0; i < messages.length; i++ ){
    var curmsg = messages[i];
    curmsg["to"] = pui.appJob["user"];

    var msgwrap = document.createElement("div");
    msgwrap.style.top = top + "px";
    msgwrap.style.left = left + "px";
    msgwrap.className = "msg-wrap";

    var msgtitlewrap = document.createElement("div");
    msgtitlewrap.className = "msg-titlewrap";
    msgwrap.appendChild(msgtitlewrap);
    
    var msgtitle = document.createElement("div");
    msgtitle.className = "title";
    msgtitlewrap.appendChild(msgtitle);

    var closeImg = document.createElement("div");
    closeImg.className = "closeImg";
    closeImg["msgIdx"] = i; // Needed for array splice upon click.
    msgtitlewrap.appendChild(closeImg);

    addEvent(closeImg, "click", pui.breakMessageDismiss);
	  
	  var msgbody = document.createElement("div");
    msgbody.className = "msg-body";
    
    // Use the user-defined formatter if it exists.
    if( typeof(pui["breakMessageFormat"]) === "function"){
      var stringwrap = {"title":"","body":""};
      pui["breakMessageFormat"](curmsg, stringwrap);
      msgtitle.innerHTML = stringwrap.title;
      msgbody.innerHTML = stringwrap.body;
    }
    else {
      try{
        msgtitle.innerHTML = curmsg["date"]+" "+curmsg["time"] + "<br>"
          + curmsg["jobNum"] +"/"+ curmsg["jobUserName"] +"/"+ curmsg["jobName"];
        msgbody.innerHTML = curmsg["to"] +":<br>"+ curmsg["msg"];
      }
      catch(exc){ console.log(exc); }
    }
	  
	  msgwrap.appendChild(msgbody);
	  bkmsgcont.appendChild(msgwrap);
	  msgbody = null;
	  msgwrap = null;
	  msgtitle = null;
    curmsg = null;
    
    top += 1;
    left += 10;
  }
  // done showing each message.
	
  bkmsgcont = null;
};

/**
 * Handle page onstorage events: clear any existing messages, and re-draw any
 * that still exist in the local storage object. The event may fire when
 * the active poller stored a new message or when the user dismissed a visible
 * message.
 * 
 * @param {type} e
 * @returns {Boolean}
 */
pui.breakMessagesOnStorage = function(e){
  if(typeof(pui.appJob) !== "object" || pui.appJob["user"].length <= 0
  || pui.appJob["user"] === "QTMHHTP1"  ){
    return false;
  }
  
  // Only handle changes to break messages for current user.
  if(e.key !== "brkmsgMessages_"+pui.appJob["user"]) return false;
  try{
    var messages = JSON.parse(e.newValue);
    pui.breakMessagesShow( messages );
  }
  catch(exc){ console.log(exc); }
  return false;
};

pui.submitLog = function(submittingFlag) {
  
  if (!pui["submit log"])
    return;
  
  console.log("=".repeat(80));
  console.log(new Date().toString() + ": submit flag = " + submittingFlag);
  console.log("-".repeat(80));
  try {
    
    throw new Error();
    
  }
  catch(e) {
    
    var lines = e.stack.split("\n");
    if (lines[0].indexOf("Error") == 0)
      lines.shift();
    lines.shift();
    for (var i = 0; i < lines.length; i++)
      if (lines[i] != "")
        console.log(lines[i].replace(/^\s*at\s/, ""));
    
  }
  
};

if (typeof String.prototype.repeat != "function")
  String.prototype.repeat = function(n) {
    
    var val = "";
    for (var i = 0; i < n; i++)
      val += this;
    return val;
    
  };

/**
 * Do a polling wait for some condition to happen. Execute a callback when finished.
 * @param {Number} interval   Time in milliseconds to poll, using setInterval.
 * @param {Number} max        Maximum time to wait in milliseconds.
 * @param {Function} check    Callback to return true when condition is met, false when not.
 * @param {Function} proceed  Callback to execute when condition is met or max time has passed.
 *                            Accepts one parameter: true when condition is met, false when max time expired.
 * @returns {undefined}
 */
pui.wait = function(interval, max, check, proceed) {

  var elapsed = 0;
  var handle = setInterval(
    function() {

      elapsed += interval;
      if (check() === true) {
        
        clearInterval(handle);
        proceed(true);
        
      }
      else if (elapsed >= max) {

        clearInterval(handle);
        proceed(false);   
      
      }
    
    },
    interval
  );
  
};

/**
 * If the specified item has a file dependency, then add the file's URL string to a list.
 * @param {Object} item                 Input. Item/widget properties.
 * @param {Object|Array} dependencies   Output. List of URL strings
 * @param {Object|Null} formatData      Input. The "data" property of the current RDF format. This is needed
 *                                      if a conditional dependency needs to test a bound field's value.
 *                                      This is null for Genie and Designer.
 * @param {Boolean} designer            True if page is Designer. False for Genie, RDF. Needed for some 
 *                                      conditional dependencies.
 * @returns {undefined}
 */
pui.addItemDependenciesTo = function(item, dependencies, formatData, designer ){
  if( item != null ){
    var fieldtype = item["field type"] || item["field_type"]; //Genie uses "field_type"; RDF uses "field type".
    if( fieldtype != null ){
      // In pre-render time, parms items don't have widget names, which
      // is the key under which pui.widgets stores dependencies.
      // So try to resolve the widget name from "field type" and template if necessary.
      if( fieldtype == "layout" && item["template"] == "css panel" ) fieldtype = "css panel"; //special case.

      if( pui.widgets[fieldtype] != null && pui.widgets[fieldtype]["dependencies"] != null 
      && pui.widgets[fieldtype]["dependencies"].length > 0 ){
      
        // Used to avoid loading redundant dependencies.
        var scripts = document.getElementsByTagName("script");
        var links = document.getElementsByTagName("link");

        var widdep = pui.widgets[fieldtype]["dependencies"];
        
        // Get the protocol, domain, and port for comparison because some script.src include those.
        var origin = "";
        var re = /^(https?:\/\/[^\/]+)\//i;
        var matches = document.URL.match(re);
        if( matches != null && matches.length == 2) origin = matches[1];
        
        // Add each dependency to a list.
        for( var dp=0; dp < widdep.length; dp++ ){
          var dependUri = widdep[dp];
          var useDependency = false;
          if (typeof widdep[dp] == "object" && widdep[dp] != null && typeof widdep[dp]["condition"] == "function"){
            //The dependency is conditional, so load only when it passes a test.
            if (widdep[dp]["condition"](item, formatData, designer)){
              dependUri = widdep[dp]["script"];
              useDependency = true;
            }
          }else if(typeof widdep[dp] == "string"){
            useDependency = true;  //Always use dependency when it is a string.
          }
          if(useDependency){
            // Make both the relative URI and the full URL for comparison.
            var uri = pui.normalizeURL(dependUri);
            var url = pui.normalizeURL( origin + uri);

            // Avoid adding the same script multiple times by checking if it already exists.
            var scriptExists = false;  
            for(var sc=0; sc < scripts.length; sc++){
              if( scripts[sc].type.toLowerCase() == "text/javascript" && (scripts[sc].src == url || scripts[sc].src == uri)) {
                scriptExists = true;
                break;
              }
            }

            // Avoiding adding the same stylesheet multiple times by checking if it already exists
            if (links && !scriptExists) {
              for (var l=0; l<links.length; l++) {
                if (links[l].type.toLowerCase() == "text/css" && (links[l].href == url || links[l].href == uri)) {
                  scriptExists = true;
                  break;
                }
              }
            }

            // If the file wasn't already loaded in <head>, and if the
            // dependency wasn't already added to the list, add it to the list.          
            if( !scriptExists && pui.arrayIndexOf(dependencies, uri) < 0 ){
              dependencies.push(uri);
            }
          } //done if useDep.
        }//done linking each dependency.
      }
    }
  }
};

/**
 * Look for any widgets that have dependencies. Then execute the callback.
 * 
 * When dependencies exist, add script/link tags to the document.head for each dependency. Execute
 * the callback after finished loading all. This should be called once before DSPF render-time,
 * or once before loading Genie items during rendering.
 * 
 * @param {Object} parm        Contains list of items or rendering parameters with items buried inside. For
 *    Genie/RDF, this would be the JSON response from the CGI program. With Designer, it has a list of widgets.
 * @param {Function} callback  Function to execute on success or failure to load files.
 * @returns {undefined}
 */
pui.loadDependencyFiles = function(parm, callback ){
  
  // List to be populated with unique URI strings.
  var dependencies = [];
  
  if( parm != null ){
    // When called by genie() in 5250/genie.js, parm should be an entry from the global screenPropertiesObj.
    // When called by designer, parm is just an object with an "items" array and "designMode":true.
    if( parm["items"] != null && parm["items"].length > 0){
      for(var itm=0; itm < parm["items"].length; itm++){
        
        // If the "dependencies" property exists, add to a list.
        pui.addItemDependenciesTo( parm["items"][itm], dependencies, null, parm["designer"]);
      }
    }
    // When called for pui.render, parm should contain layers and formats for the RDF/genie screen.
    else if(parm["layers"] != null && parm["layers"].length > 0){
      // Look in each layer.
      for(var lay=0; lay < parm["layers"].length; lay++){
        var layer = parm["layers"][lay];
        if( layer != null && layer["formats"] != null && layer["formats"].length > 0){
          // Look in each format
          for(var fmt=0; fmt < layer["formats"].length; fmt++){
            var format = layer["formats"][fmt];
            if( format != null && format["metaData"] != null && format["metaData"]["items"] != null && format["metaData"]["items"].length > 0){
              // Look at each item.
              for(var itm=0; itm < format["metaData"]["items"].length; itm++){
                
                // If the "dependencies" property exists, add to a list.
                pui.addItemDependenciesTo( format["metaData"]["items"][itm], dependencies, format["data"], false);
              }//end look at each item.
            }
          }//end look in each format.
        }
      }//end look in each layer.
    }
  }
  
  pui.dependencies = dependencies; //Store the URLs globally to be accessed by callbacks.
  
  myonload();
  
  // Recursive method to load a css/js file and callback itself onsuccess or onerror. Overall, files
  // are loaded synchronously, one at a time, in FIFO order set in the "dependencies" property.
  function myonload(){

    if (pui.dependencies.length <= 0){
      // Stop recursion. All dependencies are loaded or timed out (or there were none).
      pui.dependencies = null;
      callback();   // Execute and return. (The callback is either pui.render or genie()/success() in 5250/genie.js.)
      return;
    }

    var url = pui.dependencies.shift(); //Remove first from queue.

    if( url != null && url.length > 0 ){      
      var head = document.getElementsByTagName("head")[0];

      var fileref;
      var extn = url.substr(-4, 4).toLowerCase();
      if (extn === ".css") {
        fileref = document.createElement("link"); 
        fileref.setAttribute("type", "text/css");
        fileref.setAttribute("rel", "stylesheet");
      }
      else {
        fileref = document.createElement("script");
        fileref.setAttribute("type", "text/javascript");
      }

      if( typeof fileref.onload == "undefined"){
        // IE8 fires the readystatechange event, not the load event.
        // fileref.onload is undefined for IE8, null for others before defined.
        fileref.onreadystatechange = function(){
          if (fileref.readyState == "complete" || fileref.readyState == "loaded") myonload();
        };
      }else{
        // IE9,10 fire for both events, so just use onload; IE11/Edge/FF/Chrome only support onload.
        fileref.onload = myonload;
        fileref.onerror = function(evt){
          evt = evt || window.event;
          if( evt != null && evt.target != null ) 
            console.log("Failed to load widget dependency file ", evt.target.src || evt.target.href );
          myonload();
        };
      }

      // It's go time! (Assume the url is already normalized...)
      if (extn === ".css") {
        fileref.setAttribute("href", url);
      }
      else {
        fileref.setAttribute("src", url); 
      }
      head.appendChild(fileref);      

    }else{
      myonload();   //If the string was empty, then look for the next dependency.
    }
  } //end myonload() recursive function.

};

/**
 * Round to a specified number of decimals.
 * Source:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
 * 
 * @param {Number} number
 * @param {Number} precision
 * @returns {Number}
 */
pui.round = function(number, precision){
  var factor = Math.pow(10, precision);
  var tempNumber = number * factor;
  var roundedTempNumber = Math.round(tempNumber);
  return roundedTempNumber / factor;  
};


/**
 * Look for EJS tags in a string of HTML. If EJS is present, then supply data from
 * the record format or screen and use the EJS renderer to process the HTML.
 * @param {String} html
 * @returns {String}
 */
pui.ejs = function(html) {
  
  if (html.indexOf("<%") < 0) return html;  // no ejs to process
  
  if (typeof window["ejs"] !== "object" || typeof window["ejs"]["render"] !== "function") {
    console.error("EJS templating library not loaded.");
    return html;
  }
  
  // First, format the data properly for ejs
  if (pui.ejsData == null) {
    var data = {};
    var flags = {};
    var layers = pui["layers"];
    if (layers == null) layers = [];
    var lastLayer = layers[layers.length - 1];
    if (lastLayer == null) lastLayer = { formats: [] };
    var formats = lastLayer.formats;
    for (var i = 0; i < formats.length; i++) {
      var format = formats[i];      
      for (var name in format.data) {
        var value = format.data[name];
        if (name.substr(0,3).toUpperCase() === "*IN") {
          var ind = name.substr(3);
          if (!isNaN(Number(ind))) ind = Number(ind);
          flags[ind] = value;
        }
        else {
          // make availalbe in both lower and upper case
          data[name.toLowerCase()] = value;
          data[name.toUpperCase()] = value;
        }
      }
      if (format.subfiles) {
        for (var subfile in format.subfiles) {
          var subfileData = format.subfiles[subfile].data;
          var fields = format.subfiles[subfile]["field names"];
          var list = [];
          for (var j = 0; j < subfileData.length; j++) {
            var recordArray = subfileData[j];
            var record = {};          
            for (var k = 0; k < fields.length; k++) {
              var fieldName = fields[k]; 
              if (fieldName.substr(0,3).toUpperCase() === "*IN") {
                var ind = fieldName.substr(3);
                if (!isNaN(Number(ind))) ind = Number(ind);
                flags[ind] = recordArray[k];
              }
              else {
                // make availalbe in both lower and upper case
                record[fieldName.toLowerCase()] = recordArray[k];
                record[fieldName.toUpperCase()] = recordArray[k];
              }
            }
            list.push(record);
          }
          // make availalbe in both lower and upper case
          data[subfile.toLowerCase()] = list;
          data[subfile.toUpperCase()] = list;
        }
      }
    }
    var useflags = false;
    for( var key in flags){ //Object.keys(flags).length > 0 would be nicer, but IE8 doesn't support Object.keys.
      useflags = true;
      break;
    }
    if (useflags) data.flags = flags;
    pui.ejsData = data;
  }
  
  try {
    html = window["ejs"]["render"](html, pui.ejsData);
  }
  catch (err) {
    console.error(err);
  }
  
  return html;

};

/**
 * Start loading the EJS library then check for EJS content. If the library is loaded, 
 * then check for EJS content. This is used by the ajax_container.
 *
 * @param {Object} dom
 * @param {String} html
 * @returns {undefined}
 */
pui.setHtmlWithEjs = function(dom, html) {
  if (pui.ejsLoading) {
    setTimeout(function() {
      pui.setHtmlWithEjs(dom, html);
    }, 100);
    return;
  }
  if (!pui.ejsLoaded) {
    pui.ejsLoading = true;
    dom.innerHTML = "";
    pui["loadJS"]({
      "path": pui.normalizeURL("/ejs/ejs.min.js"),
      "callback": function() {
        dom.innerHTML = pui.ejs(html);
        pui.ejsLoaded = true;
        pui.ejsLoading = false;
      },
      "onerror": function() {
        pui.ejsLoading = false;        
      }
    });
  }
  else {
    dom.innerHTML = pui.ejs(html);
  }
};

/**
 * Create a xlsx file from a worksheet and cause a Save As dialog to appear in the browser asynchronously.
 * Loads the necessary JavaScript libraries the first time it is called.
 * @param {String} fileName
 * @param {pui.xlsx_worksheet} worksheet
 * @returns {undefined}
 */
pui.xlsx_workbook_download = function(fileName, worksheet){
  
  // If necessary, load the required JSZip library and FileSaver "polyfill".
  var path = "/jszip/jszip.min.js";
  if (typeof JSZip == "function")
    loadSaveAsJS();
  else
    pui["loadJS"]({
      "path": path,
      "callback": loadSaveAsJS,
      "onerror": function(){
        console.log("Failed to load "+path);
      }
    });
  
  function loadSaveAsJS(){
    var path = "/jszip/FileSaver.min.js";
    // If the script is already loaded, continue. Note: loadJS doesn't callback when a script is loaded,
    // and saveAs is never setup in IE8,IE9. Checking pui.getScript() lets export work more than once.
    if (typeof saveAs == "function" || pui.getScript(pui.normalizeURL(path)) != null )
      fullyloaded();
    else
      pui["loadJS"]({
        "path": path,
        "callback": fullyloaded,
        "onerror": function(){
          console.log("Failed to load "+path);
        }
      });
  }
  
  // JSZip and the FileSaver are loaded, so build the Excel workbook.
  function fullyloaded(){

    var xmlns_package_rels = "http://schemas.openxmlformats.org/package/2006/relationships";

    // Boilerplate XML for any workbook. Some files that Excel normally includes are omitted: apparently 
    // docProps/core.xml, docprops/app.xml, x1/styles.xml, x1/theme/theme1.xml are not essential.

    //[Content_Types].xml
    var content_types = worksheet.xmlstart
    +'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
    +  '<Default Extension="rels" ContentType="'+pui.mime_openxml+'-package.relationships+xml"/>'
    +  '<Default Extension="xml" ContentType="application/xml"/>'
    +  '<Override PartName="/xl/workbook.xml" ContentType="'+pui.mime_xlsx_base+'.sheet.main+xml"/>'
    +  '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="'+pui.mime_xlsx_base+'.worksheet+xml"/>'
    +  '<Override PartName="/xl/styles.xml" ContentType="'+pui.mime_xlsx_base+'.styles+xml"/>'
    +  '<Override PartName="/xl/sharedStrings.xml" ContentType="'+pui.mime_xlsx_base+'.sharedStrings+xml"/>'
    +'</Types>';

    //_rels/.rels
    var rels = worksheet.xmlstart
    +'<Relationships xmlns="'+xmlns_package_rels+'">'
    +  '<Relationship Id="rId1" Type="'+worksheet.rel_xmlns+'/officeDocument" Target="xl/workbook.xml"/>'
    +'</Relationships>';

    //xl/workbook.xml
    var workbook = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
    +'<workbook xmlns="'+worksheet.xmlns+'" xmlns:r="'+worksheet.rel_xmlns+'">'
    +  '<sheets>'
    +    '<sheet name="Sheet1" sheetId="1" r:id="rId1"/>'
    +  '</sheets>'
    +'</workbook>';

    //xl/_rels/workbook.xml.rels
    var workbookrels = worksheet.xmlstart
    +'<Relationships xmlns="'+xmlns_package_rels+'">'
    +  '<Relationship Id="rId3" Type="'+worksheet.rel_xmlns+'/styles" Target="styles.xml"/>'
    +  '<Relationship Id="rId1" Type="'+worksheet.rel_xmlns+'/worksheet" Target="worksheets/sheet1.xml"/>'
    +  '<Relationship Id="rId4" Type="'+worksheet.rel_xmlns+'/sharedStrings" Target="sharedStrings.xml"/>'
    +'</Relationships>';

    //x1/styles.xml - at least one of each font, fill, and border is required.
    var styles = worksheet.xmlstart 
    +'<styleSheet xmlns="'+worksheet.xmlns+'">'
    +  '<fonts count="1"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts>'
    +  '<fills count="1"><fill><patternFill patternType="none"/></fill></fills>'
    +  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
    // CellStyleFormats (Formatting Records) - at least one must exist; it's referenced as xfId="0" in <xf> tags.
    +  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' 
    // Cell Formats - formatting applied to cells. 0-based index. Cells (<c>) refer to these in their "s" attribute.
    // numFmtIds 0-49 are not defined explicitly:
    // https://msdn.microsoft.com/en-us/library/office/documentformat.openxml.spreadsheet.numberingformat.aspx
    // To define formats not built into Excel, <numFmts><numFmt /></numFmts> must be specified for each.
    // For now, handle 2-decimal formating; everything else gets general formatting.
    +  '<cellXfs count="2">'
    +    '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'   // general, no formatting.
    +    '<xf numFmtId="2" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>' //number with 2 decimal places.
    +  '</cellXfs>'
    +  '<dxfs count="0"/>'
    +'</styleSheet>';

    var zip = new JSZip();

    zip["file"]("[Content_Types].xml", content_types);
    zip["file"]("_rels/.rels", rels);
    zip["file"]("xl/workbook.xml", workbook);
    zip["file"]("xl/styles.xml", styles);
    zip["file"]("xl/sharedStrings.xml", worksheet.getSharedStringsXML() );
    zip["file"]("xl/_rels/workbook.xml.rels", workbookrels);
    zip["file"]("xl/worksheets/sheet1.xml", worksheet.getSheetXML() );

    if ( typeof Blob != "function" ){
      // IE8,IE9 can't prompt to SaveAs, so they need PUI0009106 to help get it.
      var promise = zip["generateAsync"]({"type": "base64", "compression": "DEFLATE"});
      promise["then"](function (bstr){
        pui.downloadAsAttachment(pui.mime_xlsx_base+".sheet", fileName + ".xlsx", bstr);
      });
    }else{
      // Firefox, Chrome, IE10,IE11, and Edge can prompt to save from a blob.
      var promise = zip["generateAsync"]({"type": "blob", "compression": "DEFLATE",
        "mimeType": pui.mime_xlsx_base+".sheet" });
      promise["then"](function (blob){
        saveAs(blob, fileName + ".xlsx");
      });
    }
  } //end fullyloaded().
};

/**
 * Worksheet object for creating XML strings for MS Excel 2007+ workbooks.
 * @constructor
 * @param {Number} numcols
 * @returns {undefined}
 */
pui.xlsx_worksheet = function(numcols){
  
  var me = this;
  
  this.xmlstart = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  this.xmlns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  this.rel_xmlns = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

  var numColumns = numcols;
  var rows = null;
  var sst = {}; //Shared strings table. mapping of strings to values used in dataset.
  var sst_count = 0;
  
  var curCol = 0; //Needed for this.addCell.
  
  // Map from column index to the excel column names: 0=A, ..., 25=Z, 26=AA, etc.
  // Needed for the <dimension> tag and in each <row> tag.
  var map = [];
  
  this.formats = [];
  for (var i=0; i < numColumns; i++){
    me.formats[i] = {"dataType":"char"}; //Default all to char so unhandled types are set as literal text.
  }

  var charcounts = [];  //max number of characters in each column; to calculate <col width="">.
  var fontMaxDigitWidth = 7; //max pixel width of 11pt font.
  makemap();
  
  /**
   * Add a new row for cells to go. Grid should add cells and rows in a sequential order.
   * @returns {undefined}
   */
  this.newRow = function(){
    if (rows == null) rows = [];
    rows.push([]);
    curCol = 0;
  };
  
  /**
   * Set a column's format internally. The format determines XLSX style and whether a column's
   * cells need to be in the Shared Strings Table. For now, these are stored as strings:
   *   "char", "graphic", "date", "timestamp", "time".
   * Anything else is sent by value.
   * 
   * @param {Number} col      The zero-based column index.
   * @param {Object} format   References bound value object from grid's me.runtimeChildren. Includes properties:
   *   dataType (date,char,zoned,time,timestamp,graphic,...); decPos (undefined,2,...); maxLength; etc.
   * @returns {undefined}
   */
  this.setColumnFormat = function(col, format){
    if (format["dataType"] != null){
      if (format["dataType"].length == 1){
        //If DB-driven grid calls setColumnFormat, then type names are in IBM format. 
        var datatype = "char";
        switch (format["dataType"]) {
          case "L": datatype = "date"; break;
          case "T": datatype = "time"; break;
          case "Z": datatype = "timestamp"; break;
          case "G": datatype = "graphic"; break;
          case "F": datatype = "floating"; break;
          case "P": datatype = "packed"; break;
          case "B": // binary
          case "I": // integer
          case "S": // zoned decimal
          case "U": // unsigned
          case "Y": // keyboard shift of numeric only - zoned
            datatype = "zoned"; break;
        }
        me.formats[col]["dataType"] = datatype;
      }else{
        me.formats[col]["dataType"] = format["dataType"];
      }
    }
    if (format["decPos"] != null) me.formats[col]["decPos"] = format["decPos"];
  };
  
  /**
   * Append a cell to the current row. Used in Load-all grids.
   * @param {String} value
   * @param {Null|String} format
   * @returns {undefined}
   */
  this.addCell = function(value, format){
    me.setCell(curCol, value, format);
    curCol++;
  };

  /**
   * Set a cell value on the last row added to the sheet.
   * @param {Number} col          The zero-based column index.
   * @param {String} value        The numeric value for the sheet, or string value for shared-strings table.
   * @param {Null|String} format  When not null, overrides the default column format.
   * @returns {undefined}
   */
  this.setCell = function(col, value, format){
    // If this is on the first row, get the column style information from each cell.
    if (rows.length == 1){
      charcounts[col] = value.length;
    }else{
      // For other rows, track the max character length of data in each column.
      charcounts[col] = Math.max(charcounts[col], value.length );
    }
    
    var fmt = me.formats[col]["dataType"];   // Default format is set per column.
    if (format != null) fmt = format;     // Cell overrides default column format.
    
    if (fmt == "char" || fmt == "graphic" || fmt == "date" || fmt == "timestamp" || fmt == "time"){
      // Store time/date types as strings. In the future we could translate their values to native Excel data.
      
      if (sst[value] == null) sst[value] = sst_count++; //store the unique shared string and its ID, then increment the ID.
      value = sst[value]; //Value is the ID from the shared strings table.
    }

    // If the cell overrides the default column format, then store as object.
    if (format != null && format != me.formats[col]["dataType"]) value = {value:value, format:format};
    
    rows[rows.length - 1][col] = value;
  };
  
  /**
   * Return an XML document string containing the Excel shared strings table.
   * @returns {String}
   */
  this.getSharedStringsXML = function(){
    // Order the shared strings by the index id. Assume there are no gaps in indices.
    var sst_inorder = [];
    for( var str in sst ){
      var idx = sst[str];
      sst_inorder[idx] = str;
    }

    var xml = me.xmlstart + '<sst xmlns="'+me.xmlns+'" count="'
      + String(sst_inorder.length + 1) + '"  uniqueCount="' + String(sst_inorder.length) + '">';
    for (var i=0; i < sst_inorder.length; i++){
      xml += '<si><t>' + pui.xmlEscape(sst_inorder[i]) + '</t></si>';
    }
    xml += '</sst>';
    return xml;
  };
  
  /**
   * Return an XML document string containing the spreadsheet data.
   * @returns {String}
   */
  this.getSheetXML = function(){
    var xml = me.xmlstart + '<worksheet xmlns="'+me.xmlns+'"'+' xmlns:r="'+me.rel_xmlns+'">'
    +'<dimension ref="A1:'+ map[numColumns - 1] + rows.length + '"/><cols>';
  
    // Configure each column with widths, and with styles for new cells.
    for (var col=0; col < numColumns; col++){
      // Calculate column width based on number of characters. Formula comes from:
      // https://msdn.microsoft.com/en-us/library/office/documentformat.openxml.spreadsheet.column.aspx
      var width = 0;
      if (charcounts[col] != null && ! isNaN(parseInt(charcounts[col],10)) )
        width = Math.floor((charcounts[col] * fontMaxDigitWidth + 5)/fontMaxDigitWidth * 256) / 256 + 5;
      
      //If the data has 2 decimal positions, use the format our style XML says is for 2 decimal positions.
      var style = me.formats[col]["decPos"] == "2" ? 's="1"' : '';
      
      xml += '<col min="'+(col+1)+'" max="'+(col+1)+'" width="'+width+'" '+style+ ' customWidth="1"/>';
    }
    xml += '</cols><sheetData>';
    
    // Output each row with either numeric data or reference to shared-strings table.
    for (var row=0; row < rows.length; row++){
      var r = String(row+1);
      xml += '<row r="'+r+'">';
      
      for (var col=0; col < numColumns; col++){
        xml += '<c r="' + map[col] + r + '"';
        
        var fmt = me.formats[col]["dataType"]; //Default each cell in a column to the column format.
        
        // Some cells (e.g. headers) override default format; extract value and format.
        if (typeof rows[row][col] == "object" && rows[row][col].format != null){
          fmt = rows[row][col].format;
          rows[row][col] = rows[row][col].value;
        }
        
        if (fmt == "char" || fmt == "graphic" || fmt == "date" || fmt == "timestamp" || fmt == "time"){
          // TODO: date/time values could be converted to native excel formats if all variations are handled.
          xml += ' t="s"';
        }else if(me.formats[col]["decPos"] == "2"){
          xml += ' s="1"'; //Use the 2nd cell format (defined in <cellXfs>).
        }
        if (rows[row][col] == null) rows[row][col] = '';
        xml += '><v>' + rows[row][col] + '</v></c>';
      }
      
      xml += '</row>';
    }
    xml += '</sheetData></worksheet>';
    
    return xml;
  };

  /**
   * Fill the map of column indexes to excel-style column names for as many columns as needed.
   * @returns {undefined}
   */
  function makemap(){
    var mapctr = 0;

    var digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var d3 = "";
    var d2 = "";

    // Loop over the digits to create the map for as many columns that are used.
    // The left-most digit is blank until the 2nd and 3rd pass ZZ.
    for(var i=-1; i < 26 && mapctr < numcols; i++){

      var d2start = -1; //Let the k loop run once with no 2nd digit; then 2nd digits are included.
      if (i >= 0) d2start = 0;  //passed ZZ: 2nd digit should start at "A" instead of "".

      // Loop for the middle digit, which is blank until the 3rd digit passes Z the first time.
      for(var j=d2start; j < 26 && mapctr < numcols; j++){

        for(var k=0; k < 26 && mapctr < numcols; k++){
          map[mapctr] = d3 + d2 + digits[k];
          mapctr++;
        }
        d2 = digits[(j + 1) % 26 ];    //get the next digit; wraps around to 0 if next is 26.
      }
      d3 = digits[i + 1]; //note: the last time this runs, it will return undefined; but no matter.
    }
  }
  
};


/**
 * Returns the column descriptions for a database file or SQL statement.
 * @param {parm} object with "file" optionally "library", or "customSQL" 
 * @param  cb - gets called with the {request} object
 * 
 *  **** IMPORTANT NOTE ******************************************
 *   The fields array returned for database file is different than
 *   the fields array returned for custom SQL statements.  
 *  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^    
 *  Database File:
 *  Always returned: "field", "longName", "text", "type", "use", "canNull", "length" 
 *  Conditionally: "decPos", "key", "generatedBy", "ccsid"
 *  
 *  Custom SQL:
 *  Always returned: "DB2_COLUMN_NAME", "DB2_SYSTEM_COLUMN_NAME", "DB2_LABEL", "SQLTYPE",
 *                   "DATETIME_INTERVAL_CODE", "LENGTH", "PRECISION", "SCALE", "DB2_CCSID",
 *                   "DB2_COLUMN_GENERATED", "DB2_COLUMN_GENERATION_TYPE", "NULLABLE" 
 *  
 */
pui.getFieldDescriptions = function(parm, cb){
	var library=parm["library"] || "", 
	    file=parm["file"] || "", 
	    customSql=parm["customSql"] || "";
    if (context == "genie") url = getProgramURL("PUI0009101.PGM");
    if (context == "dspf") url = getProgramURL("PUI0009101.PGM", null, true);  // use auth
    var request = new pui.Ajax(url);
    request["async"] = true;
    request["method"] = "post";
    request["postData"] = "file=" + encodeURIComponent(file);
    request["postData"] += "&library=" + encodeURIComponent(library);
    request["postData"] += "&customSql=" + encodeURIComponent(customSql);
    
    console.log(request["postData"]);
    
    if (context == "genie") request["postData"] += "&AUTH=" + GENIE_AUTH;
    request["postData"] += "&context=" + context;
    request["suppressAlert"] = true;
	var theCallback = function() {
		cb(request);
	}
    request["onready"] = theCallback;
    request.send();
};


/**
 *
 * Code to execute the "ondbload" event when data is loaded into a database-driven widget:
 * 
 *    @param {String}  func - event code to run
 *    @param {boolean} success - boolean true/false whether load succeeded
 *    @param {Object}  widget - id of widget to pass to event
 *
 * @return {boolean} true if the event was executed successful, false otherwise
 * 
 */
pui.executeDatabaseLoadEvent = function(func, success, widget) {
 
   // create a "de-obfuscated" copy of the global errors array.
  
   var myError = null;
   if (errors.length > 0) {
     var lastError = errors.length - 1;
     myError = { 
       "operation": errors[lastError].operation,
       "id": errors[lastError].id,
       "text": errors[lastError].text,
         "text2": errors[lastError].text2
     };
   }

   
   // Run the event  
   
   try {
     pui["temporary_property"] = myError;
     eval("var response = { success: arguments[1], id: arguments[2], error: pui.temporary_property };");
     var customFunction = eval(func);
     if (typeof customFunction == "function") {
       customFunction();
     }
   }
   catch(err) {
     pui.alert("OndbLoad Error:\n" + err.message);
     return false;
   }

   return true;
};
