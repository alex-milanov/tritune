"use strict";

if(typeof tritune === "undefined"){ var tritune = {}; }
if(typeof tritune.instr === "undefined"){ tritune.instr = {}; }

tritune.instr.Sampler = function(context, file) {
	this.context = context;
	var sampler = this;
	var request = new XMLHttpRequest();
	request.open('get', file, true);
	request.responseType = 'arraybuffer';
	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {		
			sampler.buffer = buffer;
		});
	};
	request.send();
};

tritune.instr.Sampler.prototype.setup = function() {
	this.source = this.context.createBufferSource();
	this.source.buffer = this.buffer;
	this.source.connect(this.context.destination);
};

tritune.instr.Sampler.prototype.trigger = function(start, end) {
	this.setup();
	this.source.start(start);
	if(end)
		this.source.stop(end);
};

tritune.instr.Sampler.prototype.play = function(duration){
	var now = this.context.currentTime;
	this.trigger(now, now+duration);
}