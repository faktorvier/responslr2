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

	/* Public: Get css variable */
	this.getCssVariable = function(name, defaultValue) {
		defaultValue = defaultValue || null;

		let value = getComputedStyle(document.documentElement).getPropertyValue('--rr-' + name);

		if(value === '') {
			value = defaultValue;
		}

		return JSON.parse(value.replace(/^\s+|\s+$/g,''));
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
			settings = JSON.parse(settingsJson);
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
	this.breakpoints = {};
	this.breakpointNames = [];

	/* Private properties */
	let self = this;

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
		let previousBreakpoint = self.breakpoint;

		jQuery(window).off('resize.responslr').on('resize.responslr', function() {
			self.breakpoint = responslr.getCssVariable('current-breakpoint');

			if(self.breakpoint !== previousBreakpoint) {
				setHelperColumns();
				jQuery(window).trigger('changed.breakpoint', [previousBreakpoint, self.breakpoint]);
			}

			previousBreakpoint = self.breakpoint;
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

	/* Private: Set helper columns */
	var setHelperColumns = function() {
		if(self.settings.helper.enabled) {
			let $row = jQuery('.responslr-grid-helper').children();

			// Reset previous columns
			$row.html('');

			// Add classes
			let classes = [self.settings.classes.column];

			self.breakpointNames.forEach(function(name) {
				classes.push(name + self.settings.classes.delimiter + '1');
			});

			// Append columns
			for(let columnIndex = 1; columnIndex <= self.settings.breakpoints[self.breakpoint].columns; columnIndex++) {
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

			// Bind toggle event
			$toggle.on('change.responslr', function() {
				$grid.toggleClass(self.settings.helper.gridShowerClass);
			});

			// Append grid to document
			$row.appendTo($grid);
			$grid.appendTo('body');

			// Append info to document
			$toggle.appendTo($info);
			$info.appendTo('body');

			// Set columns
			setHelperColumns();
		}
	};

	/* Public: Hide helper */
	this.hideHelper = function() {
		$('.' + self.settings.helper.infoClass).remove();
		$('.' + self.settings.helper.gridClass).remove();
	};
}

var responslr = new Responslr();

///////
// TODO
///////

// MAYBE: Is document.addEventListener('touchstart', function(){}, true); still needed? (Touch device hover fix)
// MAYBE: Is one resize trigger on load still useful/needed?
