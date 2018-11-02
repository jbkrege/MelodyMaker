/**
*
* Ben Krege 2018
* Machine Learning attachment for Google's MelodyMaker sequencer
* 
 */

define(['data/Colors', 'data/Config', 'Tone/core/Transport', 'node_modules/@magenta/music'],
    function(Colors, Config, Transport, mm) {
    var ML = function() {
        console.log("ML constructor called")
        //a reference to the tile
        //this.tile = tile;

        this._offsetX = 0;
        this._offsetY = 0;

        this._currentX = 0;
        this._currentY = 0;

        this._tween = null;

        //this.GRID = GRID;

        console.log("Initializing rnn");
        _initModel();
        console.log("Sanity check")
        console.log(this.rnn)
    };

    function _initModel(){
        console.log(mm);
        //this.rnn = new MusicRNN(Config.modelUrls[0]);
        this.rnn = new mm.MusicRNN('https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/basic_rnn');
        console.log(this.rnn)
        this.rnn.initialize().then(function() {
            console.log("RNN initialized");
        }).catch(new Error("Error initializing model"))
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