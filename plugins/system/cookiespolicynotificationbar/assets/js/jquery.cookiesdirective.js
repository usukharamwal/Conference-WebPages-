/* ======================================================
# Cookies Policy Notification Bar - Joomla! Plugin v3.1.7 (PRO version)
# -------------------------------------------------------
# For Joomla! 3.x
# Author: Yiannis Christodoulou (yiannis@web357.eu)
# Copyright (©) 2009-2017 Web357. All rights reserved.
# License: GNU/GPLv3, http://www.gnu.org/licenses/gpl-3.0.html
# Website: https://www.web357.eu/
# Demo: http://demo.web357.eu/?item=cookiespolicynotificationbar
# Support: support@web357.eu
# Last modified: 05 Jul 2017, 10:57:55
========================================================= */

/* Cookies Directive - The rewrite. Now a jQuery plugin
 * Version: 2.0.1
 * Author: Ollie Phillips
 * 24 October 2013
 */

function popupwindow(url, title, w, h) {
    wLeft = window.screenLeft ? window.screenLeft : window.screenX;
    wTop = window.screenTop ? window.screenTop : window.screenY;

    var left = wLeft + (window.innerWidth / 2) - (w / 2);
    var top = wTop + (window.innerHeight / 2) - (h / 2);
    return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
}

;(function($) {
	$.cookiesDirective = function(options) {
			
		// Default Cookies Directive Settings
		var settings = $.extend({
			//Options
			w357_explicitConsent: true,
			w357_position: 'bottom',
			w357_duration: 60,
			w357_animate_duration: 2000,
			w357_limit: 0,
			w357_message: null,				
			w357_buttonText: "Ok, I've understood!",		
			w357_buttonMoreText: "More Info",
			w357_display_more_info_btn: 1,
			w357_buttonMoreLink: "",		
			cookieScripts: null,
			privacyPolicyUri: 'privacy.html',
			w357_scriptWrapper: function(){},	
			// Styling
			fontFamily: "Lato1, 'Helvetica Neue', Helvetica, Arial, sans-serif",
			w357_fontColor: '#F1F1F3',
			w357_fontSize: '12px',
			w357_backgroundColor: '#323A45',
			w357_height: 'auto',
			w357_line_height: '100%',
			w357_backgroundOpacity: '95',
			w357_linkColor: '#FFF',
			w357_cookie_name: 'cookiesDirective',
			w357_link_target: '_self',
			w357_popup_width: '800',
			w357_popup_height: '600'
		}, options);
		
		// Perform consent checks
		//if(!getCookie('cookiesDirective')) {
		if(!getCookie(settings.w357_cookie_name)) {
			if(settings.w357_limit > 0) {
				// Display limit in force, record the view
				if(!getCookie('cookiesDisclosureCount')) {
					setCookie('cookiesDisclosureCount',1,1);		
				} else {
					var disclosureCount = getCookie('cookiesDisclosureCount');
					disclosureCount ++;
					setCookie('cookiesDisclosureCount',disclosureCount,1);
				}
				
				// Have we reached the display limit, if not make disclosure
				if(settings.w357_limit >= getCookie('cookiesDisclosureCount')) {
					disclosure(settings);		
				}
			} else {
				// No display limit
				disclosure(settings);
			}		
			
			// If we don't require explicit consent, load up our script wrapping function
			if(!settings.w357_explicitConsent) {
				settings.w357_scriptWrapper.call();
			}	
		} else {
			// Cookies accepted, load script wrapping function
			settings.w357_scriptWrapper.call();
		}		
	};
	
	// Used to load external javascript files into the DOM
	$.cookiesDirective.loadScript = function(options) {
		var settings = $.extend({
			uri: 		'', 
			appendTo: 	'body'
		}, options);	
		
		var elementId = String(settings.appendTo);
		var sA = document.createElement("script");
		sA.src = settings.uri;
		sA.type = "text/javascript";
		sA.onload = sA.onreadystatechange = function() {
			if ((!sA.readyState || sA.readyState == "loaded" || sA.readyState == "complete")) {
				return;
			} 	
		}
		switch(settings.appendTo) {
			case 'head':			
				$('head').append(sA);
			  	break;
			case 'body':
				$('body').append(sA);
			  	break;
			default: 
				$('#' + elementId).append(sA);
		}
	}	 
	
	// Helper scripts
	// Get cookie
	var getCookie = function(name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	}
	
	// Set cookie
	var setCookie = function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	}
	
	// Detect IE < 9
	var checkIE = function(){
		var version;
		if (navigator.appName == 'Microsoft Internet Explorer') {
	        var ua = navigator.userAgent;
	        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
	        if (re.exec(ua) != null) {
	            version = parseFloat(RegExp.$1);
			}	
			if (version <= 8.0) {
				return true;
			} else {
				if(version == 9.0) {
					if(document.compatMode == "BackCompat") {
						// IE9 in quirks mode won't run the script properly, set to emulate IE8	
						var mA = document.createElement("meta");
						mA.content = "IE=EmulateIE8";				
						document.getElementsByTagName('head')[0].appendChild(mA);
						return true;
					} else {
						return false;
					}
				}	
				return false;
			}		
	    } else {
			return false;
		}
	}

	// Disclosure routines
	var disclosure = function(options) {
		var settings = options;
		settings.css = 'fixed';
		
		// IE 9 and lower has issues with position:fixed, either out the box or in compatibility mode - fix that
		if(checkIE()) {
			settings.w357_position = 'top';
			settings.css = 'absolute';
		}
		
		// Any cookie setting scripts to disclose
		var scriptsDisclosure = '';
		if (settings.cookieScripts) {
			var scripts = settings.cookieScripts.split(',');
			var scriptsCount = scripts.length;
			var scriptDisclosureTxt = '';
			if(scriptsCount>1) {
				for(var t=0; t < scriptsCount - 1; t++) {
					 scriptDisclosureTxt += scripts[t] + ', ';	
				}	
			}
		} 
		
		// Create overlay, vary the disclosure based on explicit/implied consent
		// Set our disclosure/message if one not supplied
		var html = ''; 
		html += '<div id="w357_cpnb">';
		html += '<div id="w357_cpnb_outer" style="position:'+ settings.css +';'+ settings.w357_position + ':-300px;left:0px;width:100%;'
		html += 'height:' + settings.w357_height + ';line-height:' + settings.w357_line_height + ';background:' + settings.w357_backgroundColor + ';opacity:'+ (settings.w357_backgroundOpacity < 100 ? '.' + settings.w357_backgroundOpacity : 1) + ';';
		html += '-ms-filter: “alpha(opacity=' + settings.w357_backgroundOpacity + ')”; filter: alpha(opacity=' + settings.w357_backgroundOpacity + ');';
		html += '-khtml-opacity: .' + settings.w357_backgroundOpacity + '; -moz-opacity: .' + settings.w357_backgroundOpacity + ';';
		html += 'color:' + settings.w357_fontColor + ';font-size:' + settings.w357_fontSize + ';';
		html += 'text-align:center;z-index:1000;">';
		//html += '<div id="w357_cpnb_inner" style="position:relative;height:auto;width:90%;padding:10px;margin-left:auto;margin-right:auto;">';
		html += '<div id="w357_cpnb_inner">';
			
		if(!settings.w357_message) {
			if(settings.w357_explicitConsent) {
				// Explicit consent message
				settings.w357_message = 'This site uses cookies. Some of the cookies we ';
				settings.w357_message += 'use are essential for parts of the site to operate and have already been set.';
			} else {
				// Implied consent message
				settings.w357_message = 'We have placed cookies on your computer to help make this website better.';
			}		
		}	
		html += '<div id="w357_cpnb_message">' + settings.w357_message + '</div>';
		
		// Build the rest of the disclosure for implied and explicit consent
		var popup_onclick = (settings.w357_link_target === 'popup') ? 'onClick="popupwindow(\'' + settings.w357_buttonMoreLink + '?cpnb=1\', \'Cookies Policy\', ' +settings.w357_popup_width + ', ' +settings.w357_popup_height + '); return false;"' : '';
		html += '<div id="w357_cpnb_buttons">';
		html += '<a class="w357_cpnb_button" id="w357_cpnb_button_ok">' + settings.w357_buttonText + '</a>';
		html += (settings.w357_buttonMoreText != '' && settings.w357_display_more_info_btn) ? '<a target="' + settings.w357_link_target + '" href="' + settings.w357_buttonMoreLink + '" class="w357_cpnb_button" id="w357_cpnb_button_more" '+ popup_onclick +'>' + settings.w357_buttonMoreText + '</a>' : '';
		html += '<div style="clear:both;"></div>';
		html += '</div>';
		html += '</div></div>';
		$('body').append(html);
		
		// Serve the disclosure, and be smarter about branching
		var dp = settings.w357_position.toLowerCase();
		if(dp != 'top' && dp!= 'bottom') {
			dp = 'top';
		}	
		var opts = new Array();
		if(dp == 'top') {
			opts['in'] = {'top':'0'};
			opts['out'] = {'top':'-300'};
		} else {
			opts['in'] = {'bottom':'0'};
			opts['out'] = {'bottom':'-300'};
		}		

		// Start animation
		$('#w357_cpnb_outer').animate(opts['in'], settings.w357_animate_duration, function() {
			// Set event handlers depending on type of disclosure
			if(settings.w357_explicitConsent) {
				// Explicit, need to check a box and click a button
				$('#explicitsubmit').click(function() {
					if($('#epdagree').is(':checked')) {	
						// Set a cookie to prevent this being displayed again
						//setCookie('cookiesDirective',1,365);	
						setCookie(settings.w357_cookie_name,1,365);	
						// Close the overlay
						$('#w357_cpnb_outer').animate(opts['out'],settings.w357_animate_duration,function() { 
							// Remove the elements from the DOM and reload page
							$('#w357_cpnb_outer').remove();
							location.reload(true);
						});
					} else {
						// We need the box checked we want "explicit consent", display message
						$('#epdnotick').css('display', 'block'); 
					}	
				});
			} else {
				// Implied consent, just a button to close it
				$('#w357_cpnb_button_ok').click(function() {
					// Set a cookie to prevent this being displayed again
					//setCookie('cookiesDirective',1,365);	
					setCookie(settings.w357_cookie_name,1,365);	
					// Close the overlay
					$('#w357_cpnb_outer').animate(opts['out'],1000,function() { 
						// Remove the elements from the DOM and reload page
						$('#w357_cpnb_outer').remove();
					});
				});
			}	
			
			// Set a timer to remove the warning after 'settings.w357_duration' seconds
			setTimeout(function(){
				$('#w357_cpnb_outer').animate({
					opacity:'0'
				},settings.w357_animate_duration, function(){
					$('#w357_cpnb_outer').css(dp,'-300px');
				});
			}, settings.w357_duration * 1000);
		});	
	}
})(jQuery);