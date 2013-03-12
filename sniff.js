var sniff =
{
	init: function(){ return this.all(); },
	
    all: function()
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
    }
}
