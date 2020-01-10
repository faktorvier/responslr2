function Responslr() {
	/* Public properties */
	this.settings = {};
	this.rootElement = document.querySelector('html');

	/* Private properties */
	var self = this;

	/* Public: Init responslr */
	this.init = function() {
		// Load settings
		loadSettings();

		// Add classes to root
		addFeatureClasses();
		addOSClasses();
		addDeviceClasses();
		addBrowserClasses();

		// Load grid
		self.grid = new ResponslrGrid();
		self.grid.init();
	};

	/* Public: Check if host name is exactly */
	this.hostIs = function(...hosts) {
		var match = false;

		for(hostIndex in hosts) {
			match = document.location.hostname.match(new RegExp('^' + hosts[hostIndex] + '$', 'i')) !== null;

			if(match) {
				break;
			}
		}

		return match;
	}

	/* Public: Check if host name begins with */
	this.hostBeginsWith = function(...hosts) {
		var match = false;

		for(hostIndex in hosts) {
			match = document.location.hostname.match(new RegExp('^' + hosts[hostIndex], 'i')) !== null;

			if(match) {
				break;
			}
		}

		return match;
	}

	/* Public: Get css variable */
	this.getCssVariable = function(name, defaultValue) {
		defaultValue = defaultValue || null;

		let value = getComputedStyle(document.documentElement).getPropertyValue('--rr-' + name);

		if(value === '') {
			value = defaultValue;
		}

		value = value.replace(/^\s+|\s+$/g,'');

		try {
			if(value.indexOf('"') === 0 || value.indexOf("'") === 0) {
				value = value.substring(1, value.length - 1);
			}
		} catch(e) {}

		return value;
	};

	/* Public: Add class to root element */
	this.addClassToRoot = function(name) {
		if(name) {
			if(Array.isArray(name)) {
				self.rootElement.classList.add(...name);
			} else {
				self.rootElement.classList.add(name);
			}
		}
	};

	/* Private: Load settings from css */
	var loadSettings = function() {
		let settingsJson = self.getCssVariable('settings');
		let settings = null;

		try {
			settings = JSON.parse(settingsJson.replace(/\\/g, ''));
		} catch(e) {}

		self.settings = settings;
	};

	/* Private: Add features classes to root */
	var addFeatureClasses = function() {
		// Can hover
		if(self.getCssVariable('can-hover')) {
			self.addClassToRoot(self.settings.core.canHoverClass);
		}

		// Can touch
		if(self.getCssVariable('can-touch')) {
			self.addClassToRoot(self.settings.core.canTouchClass);
		}
	};

	/* Private: Add OS classes to root */
	var addOSClasses = function() {
		// OS to check
		let os = [
			{
				classes: ['win'],
				pattern: /(Windows)/i
			},
			{
				classes: ['mac'],
				pattern: /(Macintosh)/i
			},
			{
				classes: ['linux'],
				pattern: /(Linux)/i
			}
		];

		// Check OS
		for(let osIndex in os) {
			if(os[osIndex].pattern.test(navigator.userAgent)) {
				self.addClassToRoot(os[osIndex].classes);
				break;
			}
		};
	}

	/* Private: Add device classes to root */
	var addDeviceClasses = function() {
		// Devices to check
		let devices = [
			{
				classes: ['mobile', 'iphone', 'ios', 'fb'],
				pattern: /iPhone.*?FBIOS/i
			},
			{
				classes: ['tablet', 'ipad', 'ios', 'fb'],
				pattern: /iPad.*?FBIOS/i
			},
			{
				classes: ['mobile', 'iphone', 'ios'],
				pattern: /iPhone/i
			},
			{
				classes: ['tablet', 'ipad', 'ios'],
				pattern: /iPad/i
			},
			{
				classes: ['mobile', 'android'],
				pattern: /Android.*Mobile/i
			},
			{
				classes: ['tablet', 'android'],
				pattern: /Android/i
			},
			{
				classes: ['mobile', 'windowsphone'],
				pattern: /Windows Phone/i
			},
			{
				classes: ['mobile', 'blackberry'],
				pattern: /BlackBerry/i
			},
			{
				classes: ['tablet', 'playbook'],
				pattern: /PlayBook/i
			},
			{
				classes: ['mobile', 'operamobile'],
				pattern: /Opera Mobi/i
			},
			{
				classes: ['tablet', 'kindlefire'],
				pattern: /Kindle Fire/i
			},
			{
				classes: ['tablet', 'kindle'],
				pattern: /Kindle/i
			}
		];

		// Check devices
		for(let deviceIndex in devices) {
			if(devices[deviceIndex].pattern.test(navigator.userAgent)) {
				self.addClassToRoot(devices[deviceIndex].classes);
				break;
			}
		};
	}

	/* Private: Add browser classes to root */
	var addBrowserClasses = function() {
		// Browser to check
		let browser = [
			{
				classes: ['ie', 'ie8', 'trident'],
				pattern: /(MSIE 8)/i
			},
			{
				classes: ['ie', 'ie9', 'trident'],
				pattern: /(MSIE 9)/i
			},
			{
				classes: ['ie', 'trident'],
				pattern: /(MSIE|Trident)/i
			},
			{
				classes: ['edge', 'trident'],
				pattern: /(Edge\/)/i
			},
			{
				classes: ['chrome', 'webkit', 'blink'],
				pattern: /(Chrome\/)/i
			},
			{
				classes: ['safari', 'webkit'],
				pattern: /(Version\/.*Safari\/)/i
			},
			{
				classes: ['firefox', 'gecko'],
				pattern: /(Gecko\/.*Firefox\/)/i
			}
		];

		// Check browser
		for(let browserIndex in browser) {
			if(browser[browserIndex].pattern.test(navigator.userAgent)) {
				self.addClassToRoot(browser[browserIndex].classes);
				break;
			}
		};
	}
}

function ResponslrGrid() {
	/* Public properties */
	this.settings = {};
	this.breakpoint = null;
	this.breakpointPrevious = null;
	this.breakpoints = {};
	this.breakpointNames = [];

	/* Private properties */
	let self = this;
	let $helperInfo = null;

	/* Public: Init responslr */
	this.init = function() {
		// Set settings
		self.settings = responslr.settings.grid;

		// Set current breakpoint
		self.breakpoint = responslr.getCssVariable('current-breakpoint');

		// Set breakpoints
		self.breakpoints = self.settings.breakpoints;
		self.breakpointNames = Object.keys(self.breakpoints);

		// Add changed.breakpoint event
		jQuery(window).off('resize.responslr').on('resize.responslr', function() {
			self.checkBreakpointChange();
		});
	};

	/* Public: Check if current breakpoint is*/
	this.is = function(...name) {
		return name.includes(self.breakpoint);
	};

	/* Public: Check if current breakpoint up */
	this.up = function(name) {
		return self.breakpointNames.indexOf(self.breakpoint) >= self.breakpointNames.indexOf(name);
	};

	/* Public: Check if current breakpoint down */
	this.down = function(name) {
		return self.breakpointNames.indexOf(self.breakpoint) <= self.breakpointNames.indexOf(name);
	};

	/* Public: Trigger breakpoint init */
	this.initBreakpoints = function() {
		self.checkBreakpointChange();
	};

	/* Public: Check for breakpoint change */
	this.checkBreakpointChange = function() {
		self.breakpoint = responslr.getCssVariable('current-breakpoint');

		if(self.breakpoint !== self.breakpointPrevious) {
			setHelperColumns();
			self.breakpointChanged();
		}

		if(self.settings.helper.enabled) {
			$helperInfo.attr('data-rr-window-width', window.innerWidth);
		}
	};

	/* Public: Trigger breakpoint change */
	this.breakpointChanged = function() {
		jQuery(window).trigger('changed.breakpoint', [self.breakpointPrevious, self.breakpoint]);
		self.breakpointPrevious = self.breakpoint;
	};

	/* Private: Set helper columns */
	var setHelperColumns = function() {
		if(self.settings.helper.enabled) {
			let columnsCount = self.settings.breakpoints[self.breakpoint].columns;
			let $row = jQuery('.' + self.settings.helper.gridClass).children();

			// Skip if column count not changed
			if(columnsCount === $row.children().length) {
				return;
			}

			// Reset previous columns
			$row.html('');

			// Add classes
			let classes = [self.settings.classes.column];

			self.breakpointNames.forEach(function(name) {
				classes.push(name + self.settings.classes.delimiter + '1');
			});

			// Append columns
			for(let columnIndex = 1; columnIndex <= columnsCount; columnIndex++) {
				jQuery('<div class="' + classes.join(' ') + '"></div>').appendTo($row);
			}
		}
	}

	/* Public: Show helper */
	this.showHelper = function() {
		if(self.settings.helper.enabled) {
			// Create elements
			let $toggle = jQuery('<input type="checkbox" />');
			let $info = jQuery('<div class="' + self.settings.helper.infoClass + '"></div>');
			let $grid = jQuery('<div class="' + self.settings.helper.gridClass + '"></div>');
			let $row = jQuery('<div class="' + self.settings.classes.row + ' ' + self.settings.classes.container + '"></div>');

			// Bind events
			$toggle.on('change.responslr', function() {
				$grid.toggleClass(self.settings.helper.gridShowerClass);
			});

			$toggle.on('click.responslr', function(e) {
				e.stopPropagation();
			});

			// $info.on('click.responslr', function(e) {
			// 	if($info.css('left') !== 'auto') {
			// 		$info.css({
			// 			'left': 'auto',
			// 			'right': $info.css('left')
			// 		});
			// 	} else {
			// 		$info.css({
			// 			'left': $info.css('right'),
			// 			'right': 'auto'
			// 		});
			// 	}
			// });

			// Append grid to document
			$row.appendTo($grid);
			$grid.appendTo('body');

			// Append info to document
			$toggle.appendTo($info);
			$info.appendTo('body');

			$helperInfo = $info;

			// Set columns
			setHelperColumns();
		}
	};

	/* Public: Hide helper */
	this.hideHelper = function() {
		jQuery('.' + self.settings.helper.infoClass).remove();
		jQuery('.' + self.settings.helper.gridClass).remove();
	};
}

var responslr = new Responslr();

