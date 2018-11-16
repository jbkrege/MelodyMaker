/**
*
* Ben Krege 2018
* Machine Learning attachment for Google's MelodyMaker sequencer
* 
 */

define(['data/Colors', 'data/Config', 'Tone/core/Transport', 'node_modules/@magenta/music'],
    function(Colors, Config, Transport, mm) {
    var ML = function(container, grid) {
        this.active = false;

        //a reference to the tile
        //this.tile = tile;

        this._offsetX = 0;
        this._offsetY = 0;

        this._currentX = 0;
        this._currentY = 0;

        this._tween = null;

        this.temperature = 1;

        this._grid = grid;

        _initModel();
    };

    function _initModel(){
        console.log(mm);
        //this.rnn = new MusicRNN(Config.modelUrls[0]);
        this.rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
        console.log(this.rnn);
        this.rnn.initialize();
    }

    ML.prototype.generatePattern = function(){
        var seed = this._grid.getState();
        var seedLength = noteSequenceLength(seed);
        var seedSeq = toNoteSequence(seed, seedLength);
        console.log("seed: ",seedSeq);
        return rnn
          .continueSequence(seedSeq, (Config.gridWidth-seedLength), this.temperature)
          .then(function(result) {console.log("result",result)});
        // var seed = this._grid.
    }


    function fromNoteSequence(seq, patternLength) {
        // Not implemented

        // var res = _.times(patternLength, () => []);
        // for (var { pitch, quantizedStartStep } of seq.notes) {
        //   res[quantizedStartStep].push(reverseMidiMapping.get(pitch));
        // }
        // return res;
    }

    function noteSequenceLength(pattern){
        for (var i = (pattern.length-1) ; i >= 0 ; i--){
            if (pattern[i]['melody'] != -1){
                return (i + 1);
            }
        }
    }

    function toNoteSequence(pattern, sequenceLength) {
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
                    if (x['melody'] != -1){
                        return {
                        pitch: noteToMidiNumber(Config.pitches[x['melody']]),
                        startTime: i * 0.5,
                        endTime: (i + 1) * 0.5
                        };
                    } else {
                        return -1;
                    }
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
    }

    function noteToMidiNumber(noteName) {
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
    }

    function midiNumbertoNote(num){
        var noteEncodings = {'0' : 'C',
                             '2' : 'D',
                             '4' : 'E',
                             '5' : 'F',
                             '7' : 'G',
                             '9' : 'A',
                             '11' : 'B'};
        var note = num%12;
        var oct = (num-note)/12;
        var note = noteEncodings[note.toString()];
        return (note+oct);
    }


    function fromNoteSequence(pattern){
        res = [];
        notes =  pattern['notes'];
        for (var note = notes.pop(); notes.length > 0; note = notes.pop()){

        }  
    }

    return ML;
})


// var state = {
//   patternLength: 32,
//   seedLength: 4,
//   swing: 0.55,
//   pattern: [[0], [], [2]].concat(_.times(32, i => [])),
//   tempo: Transport.bpm.value
// };

// function generatePattern(seed, length) {
//   let seedSeq = toNoteSequence(seed);
//   return rnn
//     .continueSequence(seedSeq, length, temperature)
//     .then(r => seed.concat(fromNoteSequence(r, length)));
// }

// 
// PROMICE SYNTAX
//
// doSomething().then(function(result) {
// return doSomethingElse(result);
// })
// .then(function(newResult) {
// return doThirdThing(newResult);
// })
// .then(function(finalResult) {
// console.log('Got the final result: ' + finalResult);
// })
// .catch(failureCallback);