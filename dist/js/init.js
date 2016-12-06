
var context = new AudioContext;

var stream = false;

var streaming = false;

var testSampler = function(context, file){
	tritune.instr.Sampler.call(this, context, file);

	this.pitchShift = PitchShift(context);
	//this.pitchShift.connect(this.context.destination);
	this.pitchShift.transpose = 0
	this.pitchShift.wet.value = 0.3
	this.pitchShift.dry.value = 0.5

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

testSampler.prototype.changePitch = function(transpose, wet, dry){
	//console.log(transpose,wet,dry)
	this.pitchShift.transpose = transpose;
	this.pitchShift.wet.value = wet;
	this.pitchShift.dry.value = dry;
}

testSampler.prototype.trigger = function(start, end) {
	this.setup();
	this.source.start(start);
	if(end)
		this.source.stop(end);
};


testSampler.prototype.streamOn = function(stream){

	this.source = this.context.createMediaStreamSource(stream);
	var volume = this.context.createGain ? this.context.createGain() : this.context.createGainNode();
	volume.gain.value = 1;

	this.source.connect(this.pitchShift);
	this.pitchShift.connect(volume);

	//this.source.connect(volume);

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
	var sampleFile = "samples/church_organ02.ogg"


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
		var socket = io.connect("http://localhost:3000");
		socket.on('connect', function(){
			console.log("connected");
			socket.on('accpot:message', function(message){
				console.log(message);
				var transposeValue = parseInt(message[3]) / 1000 * 12
				$("#pitch-control-transpose").val(transposeValue).change();
				$("#x-control").val(parseFloat(message[0])*100).change();
				$("#y-control").val(parseFloat(message[1])*100).change();
			});
		});
	}

})
