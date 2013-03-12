/*
window.log = function()
{
    //TODO: only activate logs in DEV env?
    
    if ( this.console ){ console.log(arguments); }
    
    $('#consoleLogs').prepend('<p class="log">' + arguments[0] + '</p>');
    
};*/
//window.console = function(){ window.console ? window. || winlog(); }

if ( typeof window.console === "undefined" )
//{ window.console = {log: window.log()} ; }
{
	window.console = {
		log:function(str){
			if ( navigator.debugConsole ){ navigator.debugConsole.log(str); }
			else
			{
				// In case log messages are received before device ready
				//window.external.Notify("Info:" + str);
			}
		}
	};
}


(function(){
"use strict";
var app = 
{
    conf:
    {
    	env: 'dev', // dev, preprod, prod 
		debug: true,
    	
    	hideUrlBar: true,
    	//fullscreen: true
    	allowFullScreen: true
    },
    
    support:
    {
        init: function()
        {
        	this.hasOverflowScroll();
			
			return this;	
        },
        hasOverflowScroll: function()
        {
			// For those that cannot handle overflow scrolling with a good ux (either natively or using javascript fallback)
			if ( app.os === 'wpos' && app.osVersion.major == 7 ){ $('html').addClass('no-touchscroll'); }
        }
    },

    init: function()
    {
    	// Overload this method in your code
    },

    prepare: function()
    {
    	var self 	= this,
    		$window = $(window);
    	
        this
        	.sniff() 				// Will try to detect things like os, platform, engine, browser, ... and some others
        	.handleOrientation() 	// Will handle orientation change 
    		.makeFullScreen() 		// Will force the app to use the full size of the screen and hide the url bar
    		.preventBouncing() 		//
    	
    	// For iOS and Android > 4, do it also when the orientation change 
        if ( app.os === 'ios' )
        {
			$window.on('orientationchange', function(){ self.makeFullScreen(); })
        }
    	// For iOS and Android > 4 
        else if ( app.os === 'android' && app.osVersion.major >= 4 )
        {        	
        	// Android support orientationchange event since version 3
        	// But it seems not to reliabily updates the window dimensions after the orientation changed. So we cannot use it safely for the moment
        	// Instead, fallback using the resize event
			//$window.on('orientationchange', function(){ self.makeFullScreen(); })
        	$window.on('resize', function(){ self.makeFullScreen(); })
			
			// Required for Android < 4.1
			if ( app.osVersion.minor == 0 ){ $window.on('load', function(){ self.makeFullScreen(); }) }
        }
        // But for Android < 4 that does not support this event, use the resize event instead
        else if ( app.os === 'android' && app.osVersion.major < 4 )
        {
    		//$window.on('load', function(){ self.makeFullScreen(); })
    		$window
    			.on('resize', function()
    			{
    				// Let at least 1 second before trying to make fullscreen since android trigger resize events when the page is scrolled by the user 
    				// With a smaller delay, the user will no longer be able to display the url bar
    				//window.setTimeout(function(){ self.makeFullScreen(); }, 1);
    				window.setTimeout(function(){ self.makeFullScreen(); }, 1000);
    			})
        }
        
        this.support.init();
        
        // Virtual & crossbrowser events
		this.vtap 				= typeof $.zepto !== 'undefined' ? 'tap click' : 'click';
		this.vmousedown         = 'touchstart mousedown';
		this.vmousemove         = 'touchmove mousemove';
		this.vmouseup 			= 'touchend mouseup';
		this.vmousecancel 		= 'touchcancel';
		
		this.transStartEvent 	= 'webkitTransitionStart transitionstart';
        this.transEndEvent   	= 'webkitTransitionEnd transitionend';
        
        return this;
    },
    
    sniff: function()
    {
//alert(navigator.userAgent);
		var ucfirst 		= function(str){ return str.substr(0,1).toUpperCase() + str.substr(1,str.length); },
			pad 			= function(arr,s,v){ var l = s - arr.length; for (var i = 0; i<l; i++){ arr.push(v); } return arr; }, 
        	ua 				= navigator.userAgent || 'unknown',
            classes 		= '',
            checks 			= ['platform','browser','engine','os','osVersion','browserVersion'],
            platforms 		= ['iPhone','iPad','iPod','android','Android','Windows Phone','Windows', 'Mac OS X','Linux','BlackBerry','BB10','Bada','webOS','Tizen'],
            engines 		= {'AppleWebKit':'Webkit','Gecko':'Gecko','Trident':'Trident','MSIE':'Trident','Presto':'Presto','BlackBerry':'Mango','wOSBrowser':'Webkit'}, 
            browsers 		= {'Chrome':'Chrome','CriOS':'Chrome','Firefox':'Firefox','BlackBerry':'BB Browser', 'BB10':'BB Browser', 'Safari':'Safari','Opera':'Opera','MSIE':'IE','Dolfin':'Dolfin','Silk':'Amazon Silk'},
            version 		= {'full': '?', 'major': '?', 'minor': '?', 'build': '?', 'revision': '?'},
            vRegExp 		= {
                'default': '.*(default)\\/([0-9\\.]*)\\s?.*',
                'ie': '.*(MSIE)\\s([0-9\\.]*)\\;.*',
                'opera': '.*(Version)\\/([0-9\\.]*)\\s?.*',
                'blackberry': '.*(BlackBerry[a-zA-Z0-9]*)\\/([0-9\\.]*)\\s.*',
                'bbbrowser': '.*(Version)\\/([0-9\\.]*)\\s?.*',
                'safari': '.*(Version)\\/([0-9\\.]*)\\s?.*'
            },
            osVRegExp 		= {
            	'android': '.*Android\\s([\\d\\.]*)\\;.*',
            	'ios': '.*CPU\\s(?:iPhone\\s)?OS\\s([\\d\\_]*)\\s.*',
            	'wpos': '.*Windows\\sPhone\\s(?:OS\\s)?([\\d\\.]*)\\;.*',
            	'bbos': '.*Version\\/([0-9\\.]*)\\s?.*'
            }

        // Set Default values
        for (var i=0, l=checks.length; i<l; i++)    { var k = checks[i]; app[k] = 'unknown' + ucfirst(k); }
            
        // Look for platform, browser & engines
        for (var i=0, l=platforms.length; i<l; i++) { if ( ua.indexOf(platforms[i]) !== -1 ){ app.platform 	= platforms[i].toLowerCase().replace(/\s/,''); break; } }
        for (var name in browsers) 					{ if ( ua.indexOf(name) !== -1 )		{ app.browser 	= browsers[name].toLowerCase().replace(/\s/,''); break; } }
        for (var name in engines) 					{ if ( ua.indexOf(name) !== -1 )		{ app.engine 	= engines[name].toLowerCase(); break; } }

		// Specific cases
		// Android stock browser UA may include "Mobile Safari" while it's not
		if 		( app.platform === 'android' && app.browser === 'safari' )	{ app.browser = "unknownBrowser"; }
		// Blackberry 10 no longer contains the blackberry string 
		else if ( app.platform === 'bb10' )									{ app.platform = "blackberry"; }
		// 
		else if ( app.platform === 'tizen' )	{ app.browser = "tizenBrowser"; }
		
		// TODO: is app.browser === 'firefox' && app.os !== 'android ==> app.os = 'firefoxos' 
		
        // Look for os
        //if      ( ['iphone','ipad','ipod'].inArray(app.platform) ) 		{ app.os = 'ios'; }
        if      ( /ip(hone|ad|od)/.test(app.platform) ) 				{ app.os = 'ios'; }
        else if ( app.platform === 'android' ) 							{ app.os = 'android'; }
        else if ( app.platform === 'windows phone' ) 					{ app.os = 'wpos'; }
        else if ( app.platform === 'blackberry' ) 						{ app.os = 'bbos'; }
        else if ( app.platform === 'windows' ) 							{ app.os = 'windows'; }
        else if ( app.platform === 'macosxx' ) 							{ app.os = 'macos'; }
        //else if ( app.plafform !== 'unknownPlatform' ) 					{ app.os = app.platform.toLowerCase(); }

        // Try to get the browser version data
        if ( app.browser !== 'unknownBrowser' )
        {
            var pattern = vRegExp[app.browser] || vRegExp['default'].replace('default', ucfirst(app.browser)), // Get regex pattern to use 
                p 		= ua.replace(new RegExp(pattern, 'gi'), '$2').split('.'); 								// Split on '.'

                p.unshift(p.join('.') || '?'); 		// Insert the full version as the 1st element
                pad(p, 5, '?'); 					// Force the parts & default version arrays to have same length
            
            // Assoc default version array keys to found values
            app.browserVersion = {'full': p[0], 'major':p[1], 'minor':p[2], 'build':p[3], 'revision':p[4]};
        }
        else { app.browserVersion = version; }
        
        // Look for os version
        if ( app.os !== 'unknownOs' && osVRegExp[app.os] )
        {
        	var pattern = ua.replace(new RegExp(osVRegExp[app.os], 'i'), '$1').replace(/_/g,'.'),
        		p 		= ( pattern.indexOf(' ') === -1 ? pattern : '?.?.?.?').split('.');
        		
        		p.unshift(p.join('.') || '?'); 		// Insert the full version as the 1st element
        		pad(p, 5, '?'); 					// Force the parts & default version arrays to have same length
        		
            // Assoc default version array keys to found values
        	app.osVersion = {'full': p[0], 'major':p[1], 'minor':p[2], 'build':p[3], 'revision':p[4]};
        }
        else { app.osVersion = version; }

        // Get viewport dimensions        	
        app.pixelRatio 		= window.devicePixelRatio;
        app.vw 				= Math.round(window.outerWidth/app.pixelRatio);
        app.vh 				= Math.round(window.outerHeight/app.pixelRatio);
        
        // Get or test some usefull properties 
        app.device 			= { 'screen':{w:window.screen.width, h:window.screen.height} };
        app.isSimulator 	= ua.indexOf('XDeviceEmulator') > -1;
        app.isStandalone 	= typeof navigator.standalone !== 'undefined' && navigator.standalone;
        app.isRetina 		= (window.devicePixelRatio && window.devicePixelRatio > 1) || false;
        app.isTv 			= false;
        app.isMobile 		= ua.indexOf('Mobile') !== -1 || ( app.os === 'android' && !app.isTV ); // Touch only
        app.isDesktop 		= !app.isMobile && !app.isTv; 											// Mouse (+touch)
        
//alert(window.innerWidth + 'x' + window.innerHeight)
//alert(window.outerWidth + 'x' + window.outerHeight)
//alert(window.devicePixelRatio)

//alert('isDesktop:' + app.isDesktop);
        
		var attrs 	= {},
			classes = '',
			props 	= ['platform', 'os', 'engine', 'browser', 'pixelRatio', 'vw','vh'],
			tests 	= ['simulator','standalone','retina','mobile','desktop'],
			vtests 	= {'os':'os', 'browser':'b'};
		
		// Add retrieved data as classnames & data attributes on the html tag
		for (var i=0, len=props.length; i<len; i++){ var k = props[i]; classes += app[k]  + ' '; attrs['data-' + k] = app[k]; }
		for (var i=0, len=tests.length; i<len; i++){ var k = tests[i]; classes += ( app['is' + ucfirst(k)] ? ' ' : ' no-' ) + k; }
		for ( var k in vtests)
		{
			var alias 	= vtests[k],
				prop 	= k + 'Version'; 
			attrs['data-' + prop] = app[prop].full;
			for (var p in version){ attrs['data-' + alias + 'v' + ucfirst(p)] = app[prop][p]; }
		}
        
        $('html').addClass(classes).removeClass('no-js').attr(attrs);

        return this;
    },
    
    handleOrientation: function()
    {    	
    	var self 			= this,
    		$html 			= $('html'),
    		updateClasses 	= function(){ $html.removeClass('landscape portrait').addClass(app.orientation); }, 
    		getOrient 		= function()
	        {
	            if ( typeof window.orientation == 'undefined' && typeof window.onmozorientation == 'undefined' ){ return this; }
	            
	            app.orientation = Math.abs(window.orientation || window.onmozorientation) === 90 ? 'landscape' : 'portrait';
	        };
        
        // Get the current orientation
        getOrient();
        
        // Store it as the initial orientation
        this.initialOrientation = this.orientation;
        
        // And when it changes, get the new one
        $(window).on('orientationchange', function(e)
        {
        	getOrient(); 
        	updateClasses();
        })
        
        return this;
    },
    
    makeFullScreen: function()
    {
    	// Do not continue any longer if fullscreen is not allowed for this app 
    	if ( !this.conf.allowFullScreen ){ return this; }
    	
    	// We will store bars height
    	this.barsHeight = null;
    	this.fullSize 	= this.fullSize || {portrait:{w:null, h:null}, landscape:{w:null, h:null}};
    	
    	var $html 		= $('html'),
    		$body 		= $('body'),
			isWebapp 	= $html.hasClass('webapp');

        // On iOS
        if ( app.os === 'ios' && !location.hash )
        {
        	// On iPad, the url bar can't be hidden
        	if ( app.platform === 'ipad' ){ return this; }
        	
        	// Bars height is taskbar height (only in safari, not in webapp) + status bar height (only in landscape)
        	this.barsHeight = app.browser === 'safari' && !app.standalone ? (app.orientation === 'landscape' ? 30 + 20 : 44) : 0;
        	
        	// If the full screen available height as already been computed for the current orientation, directly set it
        	if 	( !this.fullSize[app.orientation].h )
        	{
	        	// In portrait: screen.availHeight = 460 (status bar is NOT counted) 
		        // In lanscape: screen.availHeight = 320 (status bar is counted)
	        	var iH 		= window.screen['avail' + (app.orientation === 'landscape' ? 'Width' : 'Height')];

	            // Set the value for the current orientation
	            //this.fullSize[app.orientation].h = iH - this.barsHeight;
	            this.fullSize[app.orientation].h = iH - this.barsHeight;
        	}

			$body.css({'min-height':this.fullSize[app.orientation].h + 'px'});
        }
        // On Android
        else if ( app.os === 'android' )
        {
        	// Only handle Android Stock Browser since Chrome url bar cannot be hidden
        	if ( app.browser !== 'unknownBrowser' && app.browser !== 'stockBrowser' ) { return this; }
        	
        	// Making the app fullscreen has side effect on input when focused
//if ( app.osVersion.major < 4 ) { return this; }

			// Removing the overflow:hidden on the html seems to be required on some devices (ex: Motorola Atrix)
			// for the page to be scrolled
			if ( app.osVersion.major < 4 && !$html.hasClass('fullscreenfix') ){ $html.addClass('fullscreenfix') }
	        	
        	// Prevent getting the proper size more than once for each orientation by storing the value for re-use
        	if 	( !this.fullSize[app.orientation].h )
        	{	        	
	        	this.fullSize[app.orientation].h = parseInt(window.outerHeight/window.devicePixelRatio, 10);
	        }
	        
	        
//alert(window.outerHeight);
//alert(window.devicePixelRatio);
//alert(this.fullSize[app.orientation].h);
//this.fullSize[app.orientation].h = 960;
	        
	        $body.css({
	        	'height':this.fullSize[app.orientation].h + 'px'
	        });
	        
//alert($body.width())
//alert($body.height())
        }
        // On Blackberry
        else if ( app.platform === 'blackberry' )
        {
        	// nothing for the moment
        }
        // On Windows Phone 7, since scrolling experience in fixed height containers is poor, fix page height
        // and let it stretch (allowing native scroll with momentum)
        else if ( app.os === 'wpos' && app.osVersion.major == 7 )
        {
			// Get the highest height among main content sections
        	var hH 		= $('#header')[0].scrollHeight || 0,
        		bH 		= $('#body').scrollHeight || 0,
        		fH 		= $('#footer').scrollHeight || 0,
        		htmlH 	= $('html').scrollHeight || 0,
        		h 		= [hH, bH, fH, htmlH].sort()[3];
        	
        	$body.children('.page').css('min-height', h);
        	$('#body').css('min-height', h);
        } 
        
        this.hideUrlBar();
        
        return this;
    },
    
    hideUrlBar: function()
    {
    	// Do not continue if hiding url bar is not allowed for this app
    	if ( !this.conf.hideUrlBar ){ return; }
    	
        // On iOS devices
        if ( app.os === 'ios' && !location.hash )
        {
        	setTimeout(function() { window.scrollTo(0, 0); }, 1);
        }
        // On Android
        else if ( app.os === 'android' )
        {
//if ( app.osVersion.major < 4 ) { return this; }
        	
        	setTimeout(function() { window.scrollTo(0, 1); }, 1);
        }
        
        return this; 
    },
    
    preventBouncing: function()
    {
/*
$('window')
	.on('touchmove', function(e){ e.stopPropagation(); })
        
$('#main, #body, .page, body')
	.on('touchmove', function(e){ e.stopPropagation(); })
	//.on('touchend', function(e){ e.stopPropagation(); })
	//.on('touchcancel', function(e){ e.stopPropagation(); })
*/
  
$(document)
	.on('touchmove', function(e)
	{
//alert( e.target.type )
		//if ( e.target.type === 'range' ){ return; }
		//e.preventDefault();
	})
$('#mainContent')
	//.on('touchstart', function(e){ e.stopPropagation(); })
	//.on('touchmove', function(e){ e.stopPropagation(); })
	//.on('touchend', function(e){ e.stopPropagation(); })
	//.on('touchcancel', function(e){ e.stopPropagation(); })
    	
    	return this;
    },
    
    
    // From: https://gist.github.com/mathiasbynens/901295
	fixIosViewportScaleBug: function()
	{
		// This bug seems to have been fixed in ios 6
		if ( app.os !== 'ios' || app.osVersion.major >= 6 ){ return; }
		
		var doc 		= document,		 
			addEvent 	= 'addEventListener',
		    type 		= 'gesturestart',
		    qsa 		= 'querySelectorAll',
		    scales 		= [1, 1],
		    meta 		= qsa in doc ? doc[qsa]('meta[name=viewport]') : [];
	 
		function fix() {
			meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
			doc.removeEventListener(type, fix, true);
		}
	 
		if ( (meta = meta[meta.length - 1]) && addEvent in doc)
		{
			fix();
			scales = [.25, 1.6];
			doc[addEvent](type, fix, true);
		}
		
		return this;
	},
    
	fixScroll: function(selector)
	{
		if ( app.os !== 'android' || app.osVersion.major >= 3 || Modernizr.overflowscrolling ){ return; }
		//if ( app.os !== 'android' || Modernizr.overflowscrolling ){ return; }
		
		var $p = $(selector); // parent
		
		// Do not continue if the element does not exists
		if ( !$p.lenght ){ return this; }
		
		// Pevent fixing the scroll more than one time
		if ( $p.hasClass('scrollFixed') ){ return this; }
		
		var args 	= arguments, 
			o 		= $.extend({
				scrollingX: false,
				scrollingY: true,
				zooming: false,
				bouncing: true,
				snapping: false,
				locking: true,
				animationDuration: 200,
				speedMultiplier: 2
			}, args[1] || {}),
			//pCss 	= scrollingX ? {'overflow':'hidden', 'overflow-x':'hidden', 'overflow-y':'hidden'},
			//$p 		= $(selector).css({'overflow':'hidden'}), 											// parent
			pId 	= selector, 																		// parent id
			pW 		= $p.width(), 																		// parent width
			pH 		= $p.height(), 																		// parent height
			$w 		= $('<div class="scrollWrapper" id="' + pId + 'ScrollWrapper"></div>').height(pH), 	//
			$c 		= $('<div class="scrollContent" id="' + pId + 'ScrollContent"></div>'); 			//

			
		// Wrap scrollable content with the container and the wrapper
		$p.children().appendTo($c);
		$c.appendTo($w);
		$w.appendTo($p);
		
		// Mark scroll as fixed
		$p.addClass('scrollFixed');
		
		var scroller = new EasyScroller($w[0], o);
		scroller.scroller.setDimensions(pW, pH, $p[0].scrollWidth, $p[0].scrollHeight);
		
		$(window)
			.on('resize orientationchange', function()
			{
				var pW 		= $p.width(), 										// parent width
					pH 		= $p.height(), 										// parent height
					pVPad 	= (parseInt($p.css('padding-top'), 10) || 0) 
								+ (parseInt($p.css('padding-bottom'), 10) || 0) // parent vertical padding
					
				//scroller.scroller.setDimensions(pW, pH, $p[0].scrollWidth, $p[0].scrollHeight);
				scroller.scroller.setDimensions(pW, pH, $p[0].scrollWidth, $p[0].scrollHeight + pVPad);					
			})
		
		return this;
	},
    
    notifier:
    {
        init: function()
        {
            return this;
        },
        
        add: function()
        {
            var args     = arguments,
                o         = $.extend(
                {
                    type: 'info',     // error, warning, info, success
                    actions:{},     // params: url, label, title, id, target
                    modal: false,    // 
                    msg: null
                },args[0] || {})
            
            if ( !o.msg ){ return this; }
            
            alert(o.msg);
            
            return this;    
        }
    },
    
	changePage:function()
	{
		var self 	= this,
			args 	= arguments || [],
			to 		= args[0] || null,
			o 		= $.extend({
				transition: 'fadein fadeout'
			}, args[1] || {}),
			$html 			= $('html'),
			$body 			= $('body'),
			$css 			= $('link[rel="stylesheet"]', 'head'),
			$js 			= $('script'),
			$cur 			= $body.children('.page.current');
			
		// Do not continue any longer if no valid url has been passed
		if ( !to ){ return; }		
		
		$.ajax(
		{
			url: to,
			type: 'get',
			dataType: 'html',
			success: function(response)
			{
				var $pg 		= $(response).filter('.page'), 	// Get page in response
					curPgId 	= $cur.attr('id'), 				// Current page id
					pgId 		= $pg.attr('id'), 				// New page id
					initPage 	= function() 					//
					{
						// Cache some page data
						self.$page 	= $pg;
						self.pgid 	= pgId;
						
						// Init page controller (if any)
						if ( typeof self[pgId] !== 'undefined' && self[pgId].init !== 'function' 
							//&& (typeof self[pgId].inited === 'undefined' || !self[pgId].inited || self[pgId].alwaysReInit) 
							)
						{
							self[pgId].init.apply(self[pgId]);
							self[pgId].inited = true;
						}
					} 
				
				// Do not continue any longer if no page has been found
				if ( !$pg.length ){ return; }
				
				// Load new page css (if not already present)
				if ( !$css.filter('link[href$="/' + pgId + '.css"]').length )
				{
					var $lastcss = $css.last(); 
					$lastcss.clone().attr('href','public/css/pages/' + pgId + '.css').insertAfter($lastcss);
				}
				
				// Insert the page into the DOM (required before executing the page init function)
				$pg.prependTo($body);
				
				// Load new page specific script (if not already present)
				if ( !$js.filter('script[src$="/' + pgId + '.js"]').length )
				{
					var pgjs 		= document.createElement('script');
						
					pgjs.async 		= true;
					pgjs.charset 	= 'utf-8';
					pgjs.src 		= 'public/js/pages/' + pgId + '.js';
					
					// When the script is loaded
					pgjs.onload = pgjs.onreadystatechange = function()
					{
						if ( !pgjs.readyState || /loaded|complete/.test( pgjs.readyState ) ) {
	
							pgjs.onload = pgjs.onreadystatechange = null;
	
							// Remove the script
							//if ( pgjs.parentNode ) { pgjs.parentNode.removeChild(pgjs); }
	
							pgjs = null;

							initPage();
						}
					}
					
					// Insert the script in the page
					$('head').append(pgjs);
				}
				// Otherwise, 
				else { initPage(); }

				
				var tmp 		= (o.transition || '').split(' '),
					trans 		= [ (tmp[0] && tmp[0] !== 'none' ? tmp[0] : null), (tmp[1] && tmp[1] !== 'none' ? tmp[1] : null)],
					callback 	= function()
					{
						// Cache some page data
						//self.$page 	= $pg;
						//self.pgid 	= pgId; 
						
						// Update html classes & id
						$('html').removeClass(curPgId + 'Page').addClass(pgId + 'Page').attr('id', pgId  + 'Page');
						
						// Update history
						// !!! note the 'H' (uppercased) here: do not use native history (lowercase) but rely on history.js polyfill !!!
						// Using HTML5 default History API
						//if ( Modernizr.hashchange )
						if ( history.pushState )
						{
							//window.history.pushState(null, null, pgId + '.html');
							window.history.pushState(null, null, pgId);
						}
						// Using History.js Polyfill
						else
						{
							//window.History.pushState({}, pgId, pgId + '.html');
							//window.History.pushState({}, pgId, pgId + '.html');
						}
						
						// Remove transition classes
						$pg.filter('.animating').removeClass('animating');
						$cur.filter('.animating').removeClass('animating');
						if ( trans[0] ){ $cur.filter(trans[0]).removeClass(trans[0]); }
						if ( trans[1] ){ $pg.filter(trans[1]).removeClass(trans[1]); }
						
						// Remove previous page
						app.pages 			= app.pages || {};
						app.pages.prev 		= app.pages.prev || {};  
						app.pages.url 		= window.location.url; 
						app.pages.prev.html = $cur.remove();
					}

				$cur.removeClass('current').addClass('previous');
					
				// If at least 1 page is transitioned
				//if ( trans[0] || trans[1] )
				if ( Modernizr.csstransitions && (trans[0] || trans[1]) )
				{
					var $transPg = trans[1] ? $pg : $cur;
					
					// When page(s) transition ends
					$transPg.off(app.transEndEvent).on(app.transEndEvent, function(e){ callback();})
					
					// Prepare transition on current & new current pages
					if ( trans[0] ){ $cur.addClass(trans[0] + ' off'); }
					if ( trans[1] ){ $pg.addClass(trans[1] + ' off'); }
					
					// Trigger transitions on current & new current pages
					// force reflow before addin the 'in' class (to force transition)
					$pg.css('left')
					$cur.addClass('animating').removeClass('off');
					$pg.addClass('animating').removeClass('off');					
				}
				else
				{
					callback();	
				}

			}
		});
		
		return this;
	},
	
	_logged: false,
    isLogged: function()
    {
    	// Overload this method in your code
    }
};

// Expose App to the global object
window.app = app;

})()