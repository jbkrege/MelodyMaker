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

        this._initModel();
    };

    ML.prototype._initModel = function(){
        // TODO make model source switchable
        //this.rnn = new MusicRNN(Config.modelUrls[0]);
        this.rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
        console.log(this.rnn);
        this.rnn.initialize();
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
        console.log(this);
        // Search sequence in reverse order to find the last note,
        // and therefore the length
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
                quantizationInfo: {"stepsPerQuarter" : 2},
                notes: pattern.map(function (x, i) {
                    // empty list
                    if (x === undefined){
                        return
                    }
                    // Make required dict-like object
                    else if (x['melody'] != -1){
                        return {
                        pitch: noteToMidiNumber(Config.pitches[x['melody']]),
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


    ML.prototype.generatePattern = function(){
        var thisML = this;
        var seed = this.getGridState();
        var seedLength = this.noteSequenceLength(seed);
        var seedSeq;
        if (seedLength > 0){
            seedSeq = this._toNoteSequence(seed, seedLength);
            console.log("seed: ",seedSeq); 
        } else {
            seedSeq = [];
        }
        this.rnn
            .continueSequence(seedSeq, (Config.gridWidth-seedLength), thisML.temperature)
            .then(function(result) {
                console.log("Predicted pattern",result);
                if (result['notes'].length !== 0){
                    var predictedNotes = thisML.fromNoteSequence(result);
                    for (var i = 0 ; i < predictedNotes.length ; i++) {
                        if (predictedNotes[i] !== -1){
                            thisML.addTileWrapper(seedLength+i,predictedNotes[i], false, true, 1);
                        }
                    }
                }
            });
    };

    ML.prototype.addTileWrapper = function(x, y, hover, ml, prob){
        console.log("ML Adding tile :",x,y);
        this.addTile(x, y, hover, ml, prob);
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
        console.log("midiNumbertoNote",num,"->",note+oct);
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
            if ((currNoteIndex < (notes.length-1)) && (step === notes[currNoteIndex]['quantizedStartStep'])){
                res.push(Config.gridHeight - (1 + Config.pitches.indexOf(this.midiNumberToNote(notes[currNoteIndex]['pitch']))));
                currNoteIndex++;
            } else {
                res.push(-1);
            }
        }
        return res;
    };

    return ML;
});