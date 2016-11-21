/*
Write your code in the attachEventListeners() function defintion, which starts on line 89.
 */

(function() {

	/**
	 * Keeps track of touches and determines where the toggle should be on the slider.
	 * @param {DOM node} toggle - The actual toggle that will be moving.
	 * @param {DOM node} line - The actual line that the toggle slides over.
	 */
	function ToggleTracker (toggle, line) {

		// store reference to this
		var _this = this;

		_this._touches= [];
		_this._sliding = false;

		// Eevent Listeners callback
		//   keep inside Obj reference
		_this.startSLIDE = function(e){

			//console.log('startSLIDE', e);

			e.preventDefault();

			_this._sliding = false;

			if( window.pointerEvent ){

				e.target.setPointerCapture(e.pointerId)
			}else{
				// Add mouse Listeners
				$(document).on('mousemove', _this.moveSLIDE)
						   .on('mouseup', _this.endSLIDE);
   				$(document).on('touchmove', _this.moveSLIDE)
   						   .on('touchend', _this.endSLIDE);
			}
		}


		// Eevent Listeners callback
		_this.moveSLIDE = function(e){

			//console.log('moveSLIDE',e, _this.sliding, _this.getX(e));

			if(_this._sliding) return;

			_this._sliding = true;

			_this.addMovement( _this.getX(e) );

			requestAnimationFrame(function(){
				_this.slide( toggle[0] );
			}.bind(_this));
		}

		// Eevent Listeners callback
		_this.endSLIDE = function(e){

			e.preventDefault();

			if( window.pointerEvent ){

				e.target.releasePointerCapture(e.pointerId);
			}else{
				$(document).off('mousemove', _this.moveSLIDE)
							.off('mouseup', _this.endSLIDE);
				$(document).off('touchmove', _this.moveSLIDE)
						   .off('touchend', _this.endSLIDE);
			}
			_this._sliding = false;

		};

		// init
		_this.init = function(){

			var	toggleRect = toggle[0].getBoundingClientRect(),
				lineRect = line[0].getBoundingClientRect();

			//console.log(); //return;

			_this._max = lineRect.width - toggleRect.width;
			_this._half = this._max / 2;

			_this._touchOffset = 0;

			_this.attachEventListeners(toggle);
		}
		_this.init();
	}

	ToggleTracker.prototype = {
		_touches: [],
		/**
		 * Call this to register a movement.
		 * @param {Number} posX - The current x-position of the finger/mouse.
		 */
		addMovement: function (posX) {
			this._touches[0] = this._touches[1] || posX;
			this._touches[1] = posX;
		},
		/*
		Call this to get the toggle's distance from the origin for
		the CSS property: transform: translateX()
		 */
		getTranslateX: function () {
			/*
			How far the finger actually moved
			 */
			var dx = this._touches[1] - this._touches[0];

			/*
			transform: translateX() works by translating from a starting point. The idea is to
			sum every dx to find the current distance from the origin.
			 */
			this._touchOffset = this._touchOffset + dx;

			/*
			I don't want to overwrite _touchOffset as it needs to stay constant between touches.
			 */
			var reportedValue = this._touchOffset;

			/*
			Make sure the toggle doesn't slide off the slider!
			 */
			if (reportedValue < 0) {
				reportedValue = 0;
			} else if (reportedValue > this._max) {
				reportedValue = this._max;
			}

			return reportedValue;
		},/*
		Meant to be called by requestAnimationFrame for silky smooth 60fps performance.
		#perfmatters - https://www.udacity.com/course/browser-rendering-optimization--ud860
		 */
		slide: function(toggle) {
			var translateX = this.getTranslateX();
			toggle.style.webkitTransform = "translateX(" + translateX + "px)";
			toggle.style.transform = "translateX(" + translateX + "px)";
			this._sliding = false;
		},

		getX: function(e){

			if(!e) return false;

			if( e.targetTouches ){
				return e.targetTouches[0].clientX;
			}else{
				return e.clientX;
			}
		},

		attachEventListeners: function(toggle) {
			/*
			The idea is:
				1) On start, set flag that toggle has started sliding (see the DOMContentLoaded event
				handler). Attach the event to the toggle itself	and add the first movement.
				2) On move, if sliding has been activated, then register a new movement and animate the move.
				Movement doesn't need to be limited to the toggle as it's easy for a finger/mouse to slip off.
				3) On end, set flag that the toggle has stopped sliding. Once again, it doesn't need to be
				limited to the toggle as the finger/mouse can come up anywhere in the window.
			 */

			if( window.pointerEventSupport ){
				toggle.on('pointerdown', this.startSLIDE);
				toggle.on('pointerup', this.endSLIDE);
				toggle.on('pointercancel', this.endSLIDE);

			}else {
				toggle.on('touchstart', this.startSLIDE);

				toggle.on('mousedown', this.startSLIDE);
			}
		},
	};

	/*
	Attaches all the event listeners when the page's content is ready.
	 */
	document.addEventListener("DOMContentLoaded", function(event) {

		/*
		Create Slide objects
		 */

		 $('.toggle').each(function(){

			 new ToggleTracker( $(this), $(this).next('.line') );
		 });
  });
})();
