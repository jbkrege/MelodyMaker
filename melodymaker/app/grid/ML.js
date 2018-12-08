/**
*
* Ben Krege 2018
* Machine Learning attachment for Google's MelodyMaker sequencer
* 
 */

define(['data/Colors', 'data/Config', 'Tone/core/Transport',
 'node_modules/@magenta/music', 'grid/Grid'],
    function(Colors, Config, Transport, mm, Grid) {
    var ML = function(container) {
        this.active = false;
        this.numPredictionTries = 5;
        //a reference to the tile
        //this.tile = tile;

        this._offsetX = 0;
        this._offsetY = 0;

        this._currentX = 0;
        this._currentY = 0;

        this._tween = null;

        this.temperature = 1;

        this.addTile = function() {};
        this.getGridState = function() {};

        this.models = new Array(Config.numModels);
        this._initModel(Config.activeModel);
    };

    ML.prototype._initModel = function(modelIndex){
        if (!this.models[modelIndex]){
            this.models[modelIndex] = new mm.MusicRNN(Config.modelUrls[modelIndex]);
            this.models[modelIndex].initialize(); 
        }
    };

    function noteToMidiNumber(noteName) {
        'use strict'; // see strict mode
        // 
        // Takes a two char string as input, i.e. "C4"
        //  returns the midi number associated with that note i.e. 60
        //
        var noteEncodings = {'C' : 0,
                             'D' : 2,
                             'E' : 4,
                             'F' : 5,
                             'G' : 7,
                             'A' : 9,
                             'B' : 11};
        var oct = noteName.charAt(1);
        var note = noteName.charAt(0);
        var res = 24+12*(parseInt(oct)-1)+noteEncodings[note];
        if (noteName.length === 3){
            if (noteName.charAt(2) == '#'){
                res++;
            } else {
                res--;
            }
        }
        return res;
    };


    ML.prototype._toNoteSequence = function(pattern, sequenceLength) {
        return mm.sequences.quantizeNoteSequence(
            {
                ticksPerQuarter: 220,
                totalTime: sequenceLength,
                timeSignatures: [
                  {
                    time: 0,
                    numerator: 4,
                    denominator: 4
                  }
                ],
                tempos: [
                  {
                    time: 0,
                    qpm: 120
                  }
                ],
                quantizationInfo: {"stepsPerQuarter" : Config.stepsPerQuarter},
                notes: pattern.map(function (x, i) {
                    // Make required dict-like object
                    if (x['melody'] != -1){
                        return {
                        pitch: noteToMidiNumber(Config.pitches[Config.gridHeight-x['melody']-1]),
                        startTime: i * 0.5,
                        endTime: (i + 1) * 0.5
                        };
                    // No note, fill with -1 so that it can be filtered out
                    } else {
                        return -1;
                    }
                    // Remove space filling -1's 
                }).filter(function(x){
                    if (x === -1){
                        return false;
                    } else {
                        return true;
                    }
                })
            },
            1
        );
    };

    ML.prototype.generatePattern = function(temperature){
        this.temperature = temperature;
        var thisML = this;
        var seed = this.getGridState();
        var seedLength = this.noteSequenceLength(seed);
        var seedSeq;
        if (!seedLength){
            console.log("Picking a random note to seed");
            var randomNote = Math.floor(Config.gridHeight * Math.random());
            seed = [{"melody": randomNote, "harmony":-1}];
            seedLength = 1;
            thisML.addTile(0,randomNote, false, true, 1);
            // OR try to pass a sequence of zero length. currently this throws error
            // seedSeq = mm.sequences.quantizeNoteSequence({quantizationInfo : {"stepsPerQuarter" : Config.stepsPerQuarter}}, 0);
        }
        seedSeq = this._toNoteSequence(seed, seedLength);
        console.log("seedSeq ",seedSeq);
        // Keep searching until the model predicts something
        var emptySearch = true;
        for (var search = 0; (search < this.numPredictionTries) && (emptySearch === true); search++){
            this.models[Config.activeModel]
                .continueSequence(seedSeq, (Config.gridWidth-seedLength), thisML.temperature)
                .then(function(result) {
                    if ((result['notes'].length !== 0) && (emptySearch == true)){
                        console.log("result",result);
                        // Convert protobuf to array
                        var predictedNotes = thisML.fromNoteSequence(result);
                        // Iterate through array and add notes to grid
                        for (var i = 0 ; i < predictedNotes.length ; i++) {
                            if (predictedNotes[i] !== -1){
                                thisML.addTile(seedLength+i,predictedNotes[i], false, true, 1);
                            }
                        }
                        emptySearch = false;
                        return;
                    } else {
                        //Nothing, let the loop try again
                    }
                });
        }
        if (emptySearch === true){
            // Alert the user, so that they don't think its broken
            // TODO: Get a better alert (i.e. interface/FadeAlert.js)
            // setTimeout(function() { alert("The AI likes the melody as is, and doesn't predict anything new."); }, 1);
        }
    };

    ML.prototype.noteSequenceLength = function(pattern){
        if (pattern){
            for (var i = (pattern.length-1) ; i >= 0 ; i--){
                if (pattern[i]['melody'] != -1){
                    return (i + 1);
                }
            }    
        } else {
            return 0;
        }
    };

    ML.prototype.midiNumberToNote = function(num){
        var noteEncodings = {'0' : 'C',
                             '2' : 'D',
                             '4' : 'E',
                             '5' : 'F',
                             '7' : 'G',
                             '9' : 'A',
                             '11' : 'B'};
        var note = num%12;
        var oct = (num-note)/12-1;
        var note = noteEncodings[note.toString()];
        return (note+oct);
    };


    ML.prototype.fromNoteSequence = function(pattern){
        //**
        //* Converts Magenta pattern into an array with each element representing 
        //* the predicted y coordinate in that location.
        //* If no note is predicted in a certain grid location,
        //*  then -1 is put in the array as a placeholder
        //*
        var res = [], notes = pattern['notes'], currNoteIndex = 0;
        for (var step = 0 ; step < pattern['totalQuantizedSteps'] ; step++){
            if ((currNoteIndex < notes.length) && (step === notes[currNoteIndex]['quantizedStartStep'])){
                res.push(Config.gridHeight-Config.pitches.indexOf(this.midiNumberToNote(notes[currNoteIndex]['pitch']))-1);
                currNoteIndex++;
            } else {
                res.push(-1);
            }
        }
        return res;
    };

    return ML;
});