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

define({
	'gridHeight' : 15,
	'gridWidth' : 8,
	'tileMargin' : 2,
	'notes' : ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B','C'],
	'pitches' : ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4','C5'],
	'activeTime' : 200,
	'modelUrls' : [// A 36-class one-hot MelodyRNN model. Converted from http://download.magenta.tensorflow.org/models/basic_rnn.mag.
					"https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn"
				  ],
	'singleColor' : true,
	'playPredictedNotes' : true
});
