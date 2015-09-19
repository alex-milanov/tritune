
var context = new AudioContext;

$(document).ready(function(){

	var sampleFile = "samples/141710__mushroomjesus__strumstick-4-fret-barred.wav"

	var sampler = new tritune.instr.Sampler(context, sampleFile);

	$("#play-sample").click(function(){
		sampler.play();
	})

	$("#sample-name").text("Sample: "+sampleFile);

})