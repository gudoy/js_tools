var sniff =
{
	init: function(){ return this; },
	
	all: function()
	{
		var that 		= this,
			ua 			= navigator.userAgent || 'unknown',
			classes 	= '',
			platforms 	= ['iPhone','iPad','iPod','android','Android','Windows Phone','Windows','BlackBerry','Bada','webOS'],
			engines 	= {'AppleWebKit':'Webkit','Gecko':'Gecko','Trident':'Trident','MSIE':'Trident','Presto':'Presto','BlackBerry':'Mango','wOSBrowser':'Webkit'},
			browsers 	= {'Chrome':'Chrome','CriOS':'Chrome','Firefox':'Firefox','Safari':'Safari','Opera':'Opera','IEMobile':'IE Mobile','MSIE':'IE','Dolfin':'Dolfin'}, 
			version 	= {'full': '?', 'major': '?', 'minor': '?', 'build': '?', 'revision': '?'},
			vRegExp 	= {
				'default': '.*(default)\\/([0-9\\.]*)\\s?.*',
				'ie': '.*(MSIE)\\s([0-9\\.]*)\\;.*',
				'opera': '.*(Version)\\/([0-9\.]*)\\s?.*',
				'safari': '.*(Version)\\/([0-9\.]*)\\s?.*',
				'blackberry': '.*(BlackBerry[a-zA-Z0-9]*)\\/([0-9\\.]*)\\s.*'
			}

		// Set Default values
		for (var k in ['platform','browser','engine','os','browserVersion']){ app[k] = 'unknown' + k.ucfirst(); }
			
		// Look for platform, browser & engines
		for (var i in platforms)	{ if ( ua.indexOf(platforms[i]) !== -1 ){ app.platform = platforms[i].toLowerCase(); break; } }
		for (var name in browsers)	{ if ( ua.indexOf(name) !== -1 ){ app.browser 	= browsers[name].toLowerCase().replace(/\s/,''); break; } }
		for (var name in engines)	{ if ( ua.indexOf(name) !== -1 ){ app.engine 	= engines[name].toLowerCase(); break; } }

//console.log(ua);
//alert(ua);	

		// Try to get the browser version data
		if ( app.browser !== 'unknownBrowser' )
		{
			var pattern 	= vRegExp[app.browser] || vRegExp['default'].replace('default', app.browser.ucfirst()); 	// Get regex pattern to use 
				p 			= ua.replace(new RegExp(pattern, 'gi'), '$2').split('.'); 					// Split on '.'


//console.log(pattern);
//console.log(p);
				p.unshift(p.join('.') || '?') 	// Insert the full version as the 1st element
				p.pad(5, '?') 					// Force the parts & default version arrays to have same length
//console.log(p)
			
			// Assoc default version array keys to found values
			//app.browserVersion = [].combine(version, p);
			app.browserVersion = {'full': p[0], 'major':p[1], 'minor':p[2], 'build':p[3], 'revision':p[4]};
			
alert(app.browserVersion.full);
		}
		
		// Look for os
		if 		( ['iphone','ipad','ipod'].inArray(app.platform) )	{ app.os = 'ios'; }
		else if ( app.platform === 'windows phone' )				{ app.os = 'wpos'; }
		else if ( app.plafform !== 'unknownPlatform' ) 				{ app.os = app.platform.toLowerCase(); }
		
		app.device 			= { 'screen':{w:window.screen.width, h:window.screen.height} };
		app.isSimulator 	= ua.indexOf('XDeviceEmulator') > -1;
		app.isStandalone 	= typeof navigator.standalone !== 'undefined' && navigator.standalone;
		app.isRetina 		= (window.devicePixelRatio && window.devicePixelRatio > 1) || false;
		app.isMobile 		= ua.indexOf('Mobile') !== -1;
		
		classes = 
			app.platform + ' ' + app.os + ' ' + app.engine + ' ' + app.browser 
			+ (app.isStandalone ? ' ' : ' no-') + 'standalone' 
			+ (app.isRetina 	? ' ' : ' no-') + 'retina' 
			+ (app.isMobile 	? ' ' : ' no-') + 'mobile';
		
		$('html').addClass(classes).attr(
		{
			'data-platform': app.platform,
			'data-os': app.os,
			'data-browser': app.browser,
			'data-engine': app.engine,
			'data-browserVersion': app.browserVersion,
		})
		.removeClass('no-js');

		return this;
	},
}
