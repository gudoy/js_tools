var sniff =
{
	init: function(){ return this.all(); },
	
    all: function()
    {
//alert(navigator.userAgent);
    	
        var ua 				= navigator.userAgent || 'unknown',
            classes 		= '',
            checks 			= ['platform','browser','engine','os','osVersion','browserVersion'],
            platforms 		= ['iPhone','iPad','iPod','android','Android','Windows Phone','Windows','BlackBerry','BB10','Bada','webOS'],
            engines 		= {'AppleWebKit':'Webkit','Gecko':'Gecko','Trident':'Trident','MSIE':'Trident','Presto':'Presto','BlackBerry':'Mango','wOSBrowser':'Webkit'},
            //browsers 		= {'Chrome':'Chrome','CriOS':'Chrome','Firefox':'Firefox','Safari':'Safari','Opera':'Opera','IEMobile':'IE Mobile','MSIE':'IE','Dolfin':'Dolfin'}, 
            browsers 		= {'Chrome':'Chrome','CriOS':'Chrome','Firefox':'Firefox','BlackBerry':'BB Browser', 'BB10':'BB Browser', 'Safari':'Safari','Opera':'Opera','MSIE':'IE','Dolfin':'Dolfin','Silk':'Amazon Silk'},
            version 		= {'full': '?', 'major': '?', 'minor': '?', 'build': '?', 'revision': '?'},
            vRegExp 		= {
                'default': '.*(default)\\/([0-9\\.]*)\\s?.*',
                'ie': '.*(MSIE)\\s([0-9\\.]*)\\;.*',
                'opera': '.*(Version)\\/([0-9\\.]*)\\s?.*',
                'blackberry': '.*(BlackBerry[a-zA-Z0-9]*)\\/([0-9\\.]*)\\s.*',
                'bbbrowser': '.*(Version)\\/([0-9\\.]*)\\s?.*',
                'safari': '.*(Version)\\/([0-9\\.]*)\\s?.*'
            };
            osVRegExp 		= {
            	'android': '.*Android\\s([\\d\\.]*)\\;.*',
            	'ios': '.*iPhone\\sOS\\s([\\d\\_]*)\\s.*',
            	'wpos': '.*Windows\\sPhone\\s(?:OS\\s)?([\\d\\.]*)\\;.*',
            	'bbos': '.*Version\\/([0-9\\.]*)\\s?.*'
            }

        // Set Default values
        for (var i=0, l=checks.length; i<l; i++)    { var k = checks[i]; app[k] = 'unknown' + k.ucfirst(); }
            
        // Look for platform, browser & engines
        for (var i=0, l=platforms.length; i<l; i++) { if ( ua.indexOf(platforms[i]) !== -1 ){ app.platform 	= platforms[i].toLowerCase(); break; } }
        for (var name in browsers) 					{ if ( ua.indexOf(name) !== -1 )		{ app.browser 	= browsers[name].toLowerCase().replace(/\s/,''); break; } }
        for (var name in engines) 					{ if ( ua.indexOf(name) !== -1 )		{ app.engine 	= engines[name].toLowerCase(); break; } }

		// Since Android stock browser UA may include "Mobile Safari" while it's not Mobile Safari at all, we have to fix this
		if ( app.platform === 'android' && app.browser === 'safari' ){ app.browser = "unknownBrowser"; }
		
		if ( app.platform === 'bb10' ){ app.platform = "blackberry"; }

        // Try to get the browser version data
        if ( app.browser !== 'unknownBrowser' )
        {
            var pattern = vRegExp[app.browser] || vRegExp['default'].replace('default', app.browser.ucfirst()), // Get regex pattern to use 
                p 		= ua.replace(new RegExp(pattern, 'gi'), '$2').split('.'); 								// Split on '.'

                p.unshift(p.join('.') || '?')     // Insert the full version as the 1st element
                p.pad(5, '?')                     // Force the parts & default version arrays to have same length
            
            // Assoc default version array keys to found values
            app.browserVersion = {'full': p[0], 'major':p[1], 'minor':p[2], 'build':p[3], 'revision':p[4]};
        }
        else { app.browserVersion = version; }
        
        
        // Look for os
        if      ( ['iphone','ipad','ipod'].inArray(app.platform) ) 		{ app.os = 'ios'; }
        else if ( app.platform === 'android' ) 							{ app.os = 'android'; }
        else if ( app.platform === 'windows phone' ) 					{ app.os = 'wpos'; }
        else if ( app.platform === 'blackberry' ) 						{ app.os = 'bbos'; }
        else if ( app.plafform !== 'unknownPlatform' ) 					{ app.os = app.platform.toLowerCase(); }
        
        // Loop for os version
        if ( app.os !== 'unknownOs' && osVRegExp[app.os] )
        {
        	var pattern = ua.replace(new RegExp(osVRegExp[app.os], 'i'), '$1'),
        		p 		= pattern.replace(/_/g,'.').split('.');
        		
        		p.unshift(p.join('.') || '?')     // Insert the full version as the 1st element
        		p.pad(5, '?')                     // Force the parts & default version arrays to have same length
        		
        	app.osVersion = {'full': p[0], 'major':p[1], 'minor':p[2], 'build':p[3], 'revision':p[4]};
        }
        
        // Get or test some usefull properties 
        app.device 			= { 'screen':{w:window.screen.width, h:window.screen.height} };
        app.isSimulator 	= ua.indexOf('XDeviceEmulator') > -1;
        app.isStandalone 	= typeof navigator.standalone !== 'undefined' && navigator.standalone;
        app.isRetina 		= (window.devicePixelRatio && window.devicePixelRatio > 1) || false;
        app.isMobile 		= ua.indexOf('Mobile') !== -1;
        
        // And add retrieven data to classname on the html tag
        classes = 
            app.platform + ' ' + app.os + ' ' + app.engine + ' ' + app.browser 
            //app.platform + ' ' + app.os + ' ' + app.browser
            + (app.isStandalone ? ' ' : ' no-') + 'standalone' 
            + (app.isRetina     ? ' ' : ' no-') + 'retina' 
            + (app.isMobile     ? ' ' : ' no-') + 'mobile'
            ;
        
        $('html')
        	.addClass(classes)
        	.attr(
	        {
	            'data-platform': app.platform,
	            'data-os': app.os,
	            'data-osVersion': app.osVersion.full,
	            'data-osvMajor': app.osVersion.major,
	            'data-osvMinor': app.osVersion.minor,
	            'data-osvBuild': app.osVersion.build,
	            'data-osvRevision': app.osVersion.revision,
	            'data-browser': app.browser,
	            'data-engine': app.engine,
	            'data-browserVersion': JSON.stringify(app.browserVersion) || app.browserVersion,
	            'data-bvMajor': app.browserVersion.major,
	            'data-bvMinor': app.browserVersion.minor,
	            'data-bvBuild': app.browserVersion.build,
	            'data-bvRevision': app.browserVersion.revision
	        })
        	.removeClass('no-js');

        return this;
    },
}
