
var context = new AudioContext;

var stream = false;

var streaming = false;

var testSampler = function(context, file){
	tritune.instr.Sampler.call(this, context, file);

	this.pitchShift = PitchShift(context);
	//this.pitchShift.connect(this.context.destination);
	this.pitchShift.transpose = 12
	this.pitchShift.wet.value = 1
	this.pitchShift.dry.value = 0.5


	this.waveShaper = this.context.createWaveShaper();

	var nSamples = 2048;
	var fftFrameSize = 2048;
	//shifterStartValue = 0;

	this.processorNode = this.context.createScriptProcessor(nSamples, 1, 1);
	
	this.shifter = new Pitchshift(fftFrameSize, this.context.sampleRate, 'FFT');

	this.changePitch(270,1,0.5)


}

testSampler.prototype = Object.create( tritune.instr.Sampler.prototype );
testSampler.prototype.constructor = testSampler;

testSampler.prototype.setup = function() {
	this.source = this.context.createBufferSource();
	this.source.buffer = this.buffer;

	//this.source.connect(this.context.destination);

  	this.source.connect(this.pitchShift);
	this.pitchShift.connect(this.context.destination);
};


var linearRange = function (a, b, y, z, c) {
    // Input:   value c between a and b
    // Output:  value x between y and z
    var x = (c - a) * (z - y) / (b - a) + y;
    return x;
};


testSampler.prototype.changePitch = function(transpose, wet, dry){
	//console.log(transpose,wet,dry)
	this.pitchShift.transpose = transpose;
	this.pitchShift.wet.value = wet;
	this.pitchShift.dry.value = dry;

    //this.waveShaper.curve = makeDistortionCurve(transpose*10);

    //this.source.playbackRate = (transpose-6)/12;
    //this.shiftValue = 0;
    
    var shift_value = transpose * (1.5) + 0.5;
	/* shift argument is like a play rate */
	/* We want 0 -> 0.5, 0.5 -> 1, 1 -> 2 */
	/* Let's calculate the semitones */
	var semitoneShift =  linearRange (0, 1, -12, 12, transpose);
	if (this.discrete === 1) {
		semitoneShift = Math.round(semitoneShift);
	}
	/* Let's calculate the "play rate" */
	var shift_value = Math.pow(1.0595, semitoneShift);
	this.shiftValue = shift_value;
}

testSampler.prototype.trigger = function(start, end) {
	this.setup();
	this.source.start(start);
	if(end)
		this.source.stop(end);
};

function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for ( ; i < n_samples; ++i ) {
        x = i * 2 / n_samples - 1;
        curve[i] = ( 3 + k ) * x * 20 * deg / 
            (Math.PI + k * Math.abs(x));
    }
    return curve;
}


testSampler.prototype.streamOn = function(stream){

	this.source = this.context.createMediaStreamSource(stream);
	var volume = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
	volume.gain.value = 1;
	
	//this.source.connect(volume);
	

	this.source.connect(this.pitchShift);
	this.pitchShift.connect(volume);

	//input.connect(this.waveShaper);
	//this.waveShaper.connect(volume);

	/*
	this.processorNode.onaudioprocess = function (event) {
		// Get left/right input and output arrays
		var outputArray = [];
		outputArray[0] = event.outputBuffer.getChannelData(0);
		var inputArray = [];
		inputArray[0] = event.inputBuffer.getChannelData(0);
		//console.log ("input is long: ", inputArray[0].length);
		var data = inputArray[0];
		this.shifter.process (this.shiftValue, data.length, 4, data);
		
		var out_data = outputArray[0];
		for (i = 0; i < out_data.length; ++i) {
			out_data[i] = this.shifter.outdata[i];
		}
		
	}.bind(this);
	
	this.source.connect (this.processorNode);
	this.processorNode.connect (volume);
	*/

	volume.connect(this.context.destination);
};



(function init(g){
	try {
		//audio_context = new (g.AudioContext || g.webkitAudioContext);
		console.log('Audio context OK');
		// shim
		navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
		console.log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'OK' : 'fail'));
		// use
		navigator.getUserMedia(
			{audio:true},
			function(_stream){
				stream = _stream;
			}, 
			function(e){fire('No live audio input ' + e);}
		);
	} catch (e) {
		console.log('No web audio support in this browser');
	}
}(window));





$(document).ready(function(){

	//var sampleFile = "samples/141710__mushroomjesus__strumstick-4-fret-barred.wav"
	var sampleFile = "samples/aaaaa.wav"


	var sampler = new testSampler(context, sampleFile);

	$("#play-sample").click(function(){
		sampler.play();
	})

	$("#sample-name").text("Sample: "+sampleFile);

	$("#audio-input").click(function(){
		//streaming = !streaming;
		sampler.streamOn(stream);
	});

	$("body").on("change",".slider",function(){
		var id = $(this).attr("id");

		$("#"+id+"-value").text($(this).val())
	})

	$("body").on("change",".pitch-control .slider", function(){
		sampler.changePitch(
			parseFloat($("#pitch-control-transpose").val()),
			parseFloat($("#pitch-control-wet").val()),
			parseFloat($("#pitch-control-dry").val())	
		);
	});

	if(window.io) {
		var socket = io();
		socket.on('connect', function(){
			console.log("connected");
			socket.on('riot:message', function(message){
				console.log(message);
				$("#x-control").val(parseInt(message.args[0].value)).change();
				$("#y-control").val(parseInt(message.args[3].value)).change();
			});
		});
	}

})