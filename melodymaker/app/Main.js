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

require(['domready', 'style/main.scss', 'grid/Grid', 'interface/Bottom', 'sound/Sequencer', 
	'Tone/core/Transport', 'sound/Player', 'node_modules/startaudiocontext', 'grid/ML', 'data/Config'],
function(domReady, mainStyle, Grid, Bottom, Sequencer, Transport, Player, StartAudioContext, ML, Config) {
	domReady(function() {
		Config.gridWidth = Config.subdivisions*Config.beatsPerMeasure*Config.numMeasures;
		window.parent.postMessage("loaded", "*");
		var grid = new Grid(document.body);
		var ml = new ML(document.body);
		var bottom = new Bottom(document.body);

		bottom.onDirection = function(dir) {
			grid.setDirection(dir);
		};

		bottom.removeML = function() {
			grid.removeML();
		};

		ml.addTile = function(x, y, hover, ml, prob){
			grid._addTile(x, y, hover, ml, prob);
		};

		ml.getGridState = function(){
			return grid.getState();
		};

		bottom.generatePattern = function(temperature) {
			ml.generatePattern(temperature);
		};

		var player = new Player();

		var seq = new Sequencer(function(time, step) {
			var notes = grid.select(step);
			player.play(notes, time);
		});

		grid.onNote = function(note) {
			player.tap(note);
		};

		Transport.on('stop', function() {
			grid.select(-1);
		});

		//
		// Modal
		//
		// TODO: Refactor this into its own file

		// Get the <span> element that closes the modal
		var settingsSpan = document.getElementById("closeSettings");
        var introSpan = document.getElementById("closeIntro");

		// Get the modal
		var introModal = document.getElementById('introModal');
        var settingsModal = document.getElementById("settingsModal")

        //
		// When the user clicks on <span> (x), close the modal
		//
        settingsSpan.onclick = function() {
		    settingsModal.style.display = "none";
		    bottom._settingsButtonClicked();
		}

        introSpan.onclick = function() {
            introModal.style.display = "none";
        }

        //
		// When the user clicks anywhere outside of the modal, close it
		//
        window.onclick = function(event) {
		    if (event.target == settingsModal) {
		        settingsModal.style.display = "none";
		        bottom._settingsButtonClicked();
		    }
            else if (event.target == introModal) {
                introModal.style.display = "none";
            }
		}

		// Add models to settings modal
		var modelDiv = document.getElementById("ModelSettings");
		for (var i = 0; i < Config.modelNames.length; i++){
			var button = document.createElement("input");
			button.setAttribute("name","model");
			button.setAttribute("type","radio");
			button.modelIndex = i;
			if (i == Config.activeModel) {
				button.checked = true;
			}
			var label = document.createElement("span");
			label.innerHTML = Config.modelNames[i];
			modelDiv.appendChild(button);
			modelDiv.appendChild(label);
			modelDiv.appendChild(document.createElement("br"));
			
			// Update settings on click
			button.addEventListener("click", function(){
				Config.activeModel = this.modelIndex;
				ml._initModel(this.modelIndex);
			})
		}

		// Grid Settings functionality
		var measureNumInput = document.getElementById("MeasureNum");
		measureNumInput.defaultValue = Config.numMeasures;
		measureNumInput.onchange = function(){

			Config.numMeasures = this.value;
			Config.gridWidth = Config.subdivisions*Config.beatsPerMeasure*Config.numMeasures;
			grid._resize();
		};
 
		//
		// Keyboard shortcuts
		//
		document.body.addEventListener('keyup', function(e) {
			var key = e.which;
			//
			// Pause/play on spacebar
			//
			if (key === 32){
				bottom._playClicked(e);
			}
			//
			// Move last note on arrow press
			//
			else if (key === 37){
				// Left arrow pressed
				// grid.lastDragTile
			}
			else if (key === 39){
				// Right arrow pressed
			}
			else if (key === 38){
				// Up arrow pressed
			}
			else if (key === 40){
				// Down arrow pressed
			}
		})

		//send the ready message to the parent
		var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
		var isAndroid = /Android/.test(navigator.userAgent) && !window.MSStream;

		//full screen button on iOS
		if (isIOS || isAndroid){
			//make a full screen element and put it in front
			var iOSTapper = document.createElement("div");
			iOSTapper.id = "iOSTap";
			document.body.appendChild(iOSTapper);
			new StartAudioContext(Transport.context, iOSTapper).then(function() {
				iOSTapper.remove();
				window.parent.postMessage('ready','*');
			});
		} else {
			window.parent.postMessage('ready','*');
		}
	});
});
