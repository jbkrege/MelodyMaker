/**
 * Copyright 2016 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

define(['style/bottom.scss', 'interface/Slider', 'Tone/core/Transport', 'interface/Orientation', 'grid/Grid'],
function(bottomStyle, Slider, Transport, Orientation, Grid) {
	var Bottom = function(container, ml) {
		this._ml = ml;
		this._element = document.createElement('div');
		this._element.id = 'Bottom';
		container.appendChild(this._element);

		this._controlsContainer = document.createElement('div');
		this._controlsContainer.id = 'Controls';
		this._element.appendChild(this._controlsContainer);

		this._playButton = document.createElement('div');
		this._playButton.id = 'PlayButton';
		this._playButton.classList.add('Button');
		this._playButton.classList.add("icon-svg_play");
		this._controlsContainer.appendChild(this._playButton);
		this._playButton.addEventListener('click', this._playClicked.bind(this));

		this._MLButton = document.createElement('div');
		this._MLButton.id = 'MLButton';
		this._MLButton.classList.add('passive')
		this._MLButton.classList.add('Button')
		this._MLButton.classList.add('icon-svg_computer');
		this._controlsContainer.appendChild(this._MLButton);
		this._MLButton.addEventListener('click',this._MLClicked.bind(this));

		this._harmony = document.createElement('div');
		this._harmony.id = 'Harmony';
		this._harmony.classList.add('Button');
		this._controlsContainer.appendChild(this._harmony);
		this._harmony.addEventListener('click', this._directionClicked.bind(this));

		// this._directions = ['none', 'up', 'down', 'right', 'left'];
		this._directions = ['none', 'right'];
		this._directionIndex = 0;

		this.slider = new Slider(this._controlsContainer);

		this.onDirection = function() {};

		this._orientation = new Orientation(this._rotated.bind(this));
	};

	Bottom.prototype._MLClicked = function(e) {
		e.preventDefault();
		console.log("ML Button Pressed");
		if (this._ml.active === false){
			// Set buttins in interface
			this._MLButton.classList.remove('passive');
			this._MLButton.classList.add('active');
			this._ml.active = true;
			if (this._directions[this._directionIndex] != 'none'){
				this._directionClicked(e);
			}
			this._ml.generatePattern();
		} else {
			this._MLButton.classList.remove('active');
			this._MLButton.classList.add('passive');
			this._ml.active = false;
			Grid.removeML();
		}
	}

	Bottom.prototype._playClicked = function(e) {
		e.preventDefault();
		if (Transport.state === 'started') {
			this._playButton.classList.remove('Playing');
			this._playButton.classList.add('icon-svg_play');
			this._playButton.classList.remove('icon-svg_pause');
			Transport.stop();
		} else {
			this._playButton.classList.add('Playing');
			this._playButton.classList.remove('icon-svg_play');
			this._playButton.classList.add('icon-svg_pause');
			Transport.start('+0.1');
		}
	};

	Bottom.prototype._rotated = function() {
		//
		// For mobile
		//
		if (Transport.state === 'started') {
			this._playButton.classList.remove('Playing');
			this._playButton.classList.add('icon-svg_play');
			this._playButton.classList.remove('icon-svg_pause');
			Transport.stop();
		}
	};


	Bottom.prototype._directionClicked = function(e) {
		e.preventDefault();
		var formerDir = this._directions[this._directionIndex];
		this._harmony.classList.remove(formerDir);
		this._directionIndex = (this._directionIndex + 1) % this._directions.length;
		var dir = this._directions[this._directionIndex];
		if ((dir != 'none') && (this.ml.active === true)){
			this._MLClicked(e);
		}
		this._harmony.classList.add(dir);
		this.onDirection(dir);
	};

	return Bottom;
});
