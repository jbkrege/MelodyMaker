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
	'Tone/core/Transport', 'sound/Player',
	 'node_modules/startaudiocontext', 'grid/ML', 'data/Config',
	  'node_modules/firebase/app'], //'node_modules/@google-cloud/storage'],
function(domReady, mainStyle, Grid, Bottom, Sequencer, Transport,
 Player, StartAudioContext, ML, Config, Firebase) {
	domReady(function() {

		var fConfig = {
		    apiKey: "AIzaSyCj6NshDarYyN80l06qQjxYRuu1hbQYqAo",
		    authDomain: "melodymaker-17f94.firebaseapp.com",
		    databaseURL: "https://melodymaker-17f94.firebaseio.com",
		    projectId: "melodymaker-17f94",
		    storageBucket: "melodymaker-17f94.appspot.com",
		    messagingSenderId: "976762320760"
		};
		
		Firebase.initializeApp(fConfig);


		function initializeInterfaceAndAudio(){
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
			Transport.setLoopPoints(0,Config.numMeasures.toString()+"m");

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
				var diff, i, harmonyOn = false;
				
				// If harmony is on, then we have to turn it off first
				if (bottom._directionIndex != 0){
					harmonyOn = true;
					bottom._directionClicked();
				}
				Config.numMeasures = this.value;
				var newWidth = Config.subdivisions*Config.beatsPerMeasure*Config.numMeasures;
				diff = newWidth - Config.gridWidth;
				Config.gridWidth = newWidth;
				if (diff > 1){
					// Increase size of array 
					for (i = 0; i < diff ; i++){
						grid._tiles.push(null);
						grid._mlTiles.push(null);
					}
				}
				else {
					// Decrease size of array
					for (i = 0; i > diff ; i--){
						grid._tiles.pop(null);
						grid._mlTiles.pop(null);
					}
				}
				if (harmonyOn){
					bottom._directionClicked();
				}
				else
				{
					grid._ai = [];
				}
				
				grid._resize();

				seq.changeSequenceLength(function(time, step) {
					var notes = grid.select(step);
					player.play(notes, time);
				});
				Transport.setLoopPoints(0,Config.numMeasures.toString()+"m");
				console.log("tiles",grid._tiles);
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
			console.log("Initialized Everything");
		};

		// var storage = Storage({
		// 	projectid: "melodymaker-17f94",
		// 	storageBucket: "melodymaker-17f94.appspot.com"
		// });
		// var storageRef = storage.ref();

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
            initializeInterfaceAndAudio();
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
                initializeInterfaceAndAudio();
            }
		}
	});
});
