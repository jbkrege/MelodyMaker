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

define(['style/bottom.scss', 'interface/Slider', 'Tone/core/Transport', 'interface/Orientation', 'grid/Grid', 'node_modules/precision-inputs/scripts/precision-inputs.base', 'node_modules/knob/index'],
function(bottomStyle, Slider, Transport, Orientation, Grid, PrecisionInputs, Knob) {
	var Bottom = function(container) {
		// this._ml = ml;
		this._element = document.createElement('div');
		this._element.id = 'Bottom';
		container.appendChild(this._element);
		this.container = container;

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
		this.MLActive = false;

		this._harmony = document.createElement('div');
		this._harmony.id = 'Harmony';
		this._harmony.classList.add('Button');
		this._controlsContainer.appendChild(this._harmony);
		this._harmony.addEventListener('click', this._directionClicked.bind(this));

		// this._directions = ['none', 'up', 'down', 'right', 'left'];
		this._directions = ['none', 'right'];
		this._directionIndex = 0;

		// this.slider = new Slider(this._controlsContainer);

		this.onDirection = function() {};
		this.removeML = function() {};
		this.generatePattern = function() {};

		this._orientation = new Orientation(this._rotated.bind(this));

		// Knob docs: https://www.npmjs.com/package/knob
		// Cooler lookin knob: https://www.cssscript.com/touch-enabled-knob-input-javascript-knob-input/
		this._temperatureKnob = Knob({
			label: 'Temperature',
			className: 'LofiKnob',
			value: 50,
			angleOffset: -125,
			angleArc: 250,
			min: 0,
			max: 100,
			step: 1,
			width: 60
		});
		this._temperatureKnob.id = "temperatureKnob";
		this._temperatureKnob.value = 50;
		this._controlsContainer.appendChild(this._temperatureKnob);

		this._tempoKnob = Knob({
			label: 'Tempo',
			className: 'LofiKnob',
			value: 120,
			angleOffset: -125,
			angleArc: 250,
			min: 60,
			max: 200,
			step: 2,
			width: 60
		});
		this._tempoKnob.id = "tempoKnob";
		this._tempoKnob.value = 120;
		this._tempoKnob.onchange = this._tempoChange;
		this._controlsContainer.appendChild(this._tempoKnob);

		this._settingsButton = document.createElement('div');
		this._settingsButton.id = 'settingsButton';
		this._settingsButton.classList.add('passive')
		this._settingsButton.classList.add('Button')
		this._settingsButton.classList.add('icon-svg_hamburger_menu');
		this._controlsContainer.appendChild(this._settingsButton);
		this._settingsButton.addEventListener('click',this._settingsButtonClicked.bind(this));
	};

	Bottom.prototype._tempoChange = function() {
		console.log("TempoChange",this.value);
		Transport.bpm.value = this.value;
	}

	Bottom.prototype._settingsButtonClicked = function(){
		if (this._settingsButton.classList.contains('passive')){
			this._settingsButton.classList.remove('passive');
			this._settingsButton.classList.add('active');
			// Get the modal
			var modal = document.getElementById('myModal');
			// When the user clicks on the button, open the modal 
			modal.style.display = "block";
		}
		else {
			this._settingsButton.classList.remove('active')
			this._settingsButton.classList.add('passive');
		}
	}

	Bottom.prototype._MLClicked = function(e) {
		e.preventDefault();
		if (this.MLActive === false){
			// Set buttins in interface
			this._MLButton.classList.remove('passive');
			this._MLButton.classList.add('active');
			this.MLActive = true;
			this.generatePattern(this._temperatureKnob.value);
		} else {
			this._MLButton.classList.remove('active');
			this._MLButton.classList.add('passive');
			this.MLActive = false;
			this.removeML();
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
		// if ((dir != 'none') && (this.MLActive === true)){
		// 	this._MLClicked(e);
		// }
		this._harmony.classList.add(dir);
		this.onDirection(dir);
	};

	return Bottom;
});
