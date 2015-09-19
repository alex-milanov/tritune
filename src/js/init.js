
var context = new AudioContext;


var testSampler = function(context, file){
	tritune.instr.Sampler.call(this, context, file);

	this.pitchShift = PitchShift(context);
	this.pitchShift.connect(this.context.destination);
	this.pitchShift.transpose = 12
	this.pitchShift.wet.value = 1
	this.pitchShift.dry.value = 0.5
}

testSampler.prototype = Object.create( tritune.instr.Sampler.prototype );
testSampler.prototype.constructor = testSampler;

testSampler.prototype.setup = function() {
	this.source = this.context.createBufferSource();
	this.source.buffer = this.buffer;

	//this.source.connect(this.context.destination);

  	this.source.connect(this.pitchShift);
};

testSampler.prototype.changePitch = function(transpose, wet, dry){
	console.log(transpose,wet,dry)
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

/*
var pitchShift = PitchShift(audioContext)
pitchShift.connect(audioContext.destination)

pitchShift.transpose = 12
pitchShift.wet.value = 1
pitchShift.dry.value = 0.5
*/

$(document).ready(function(){

	//var sampleFile = "samples/141710__mushroomjesus__strumstick-4-fret-barred.wav"
	var sampleFile = "samples/aaaaa.wav"


	var sampler = new testSampler(context, sampleFile);

	$("#play-sample").click(function(){
		sampler.play();
	})

	$("#sample-name").text("Sample: "+sampleFile);

	$("body").on("change",".slider",function(){
		var id = $(this).attr("id");

		$("#"+id+"-value").text($(this).val())
	})

	$("body").on("change",".pitch-control .slider", function(){
		sampler.changePitch(
			parseInt($("#pitch-control-transpose").val()),
			parseFloat($("#pitch-control-wet").val()),
			parseFloat($("#pitch-control-dry").val())
				
		);
	});

})