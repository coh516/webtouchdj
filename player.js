function player() {
  this.rpm = 33.3;
  this.defaultRPM = 33.3;
}

player.prototype.init = function(record) {
    this.record = record;
      var dropzone = document.getElementById("canvas");
      var self = this;
      dropzone.addEventListener('drop', function(e) {
         self.handleDrop(e)
      })
      dropzone.addEventListener('dragover', function(e) {
         self.handleDragOver(e)
       })
}


player.prototype.handleDragOver = function(e) {
    e.preventDefault()
    e.stopPropagation()
}

player.prototype.handleDrop = function(e) {
    e.preventDefault()
    e.stopPropagation()

    // find where we are on the screen .. for left side.. create 2 contexts
    // for right side.. just use one
    var forward = new AudioContext();
    var backward = new AudioContext();
    var self = this;
    this.playHead = 0;
    var files = e.dataTransfer.files
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        var reader = new FileReader()
        reader.addEventListener('load', function(e) {
            var data = e.target.result
            forward.decodeAudioData(data, function(buffer) {
              self.loadSoundForward(buffer, forward)
            })
           backward.decodeAudioData(data, function(buffer){
              self.loadSoundBackwards(buffer, backward);
           })
        })
        reader.readAsArrayBuffer(file)
    }
}

player.prototype.gain = function() {
  //this.gainNode.value = this.record.faderRight ? 1 : 0;
}


player.prototype.setRPM = function() {
  console.log("setting rpm to " + this.record.rpm);
  var rpm = this.record.rpm;

  var speed = rpm/this.rpm;

  var curTime = this.forwardSource ? this.forwardSource.context.currentTime : 0;

  //if (this.lastTime)
  //  this.playHead =  (curTime - this.lastTime)*speed;
  this.playHead = this.record.playHead > 0 ? this.record.playHead : 0;
  this.lastTime = curTime;

  if (speed > 0) {
    this.seekForward(this.playHead);
    if (this.fwdContext)
      this.forwardSource.playbackRate.value = speed; // : null;
      this.curContext = this.fwdContext;
  }

  if (speed < 0) {
    this.seekBackwards(this.playHead);
    if (this.backContext)
      this.backwardSource.playbackRate.value = -speed;
      this.curContext = this.backContext;
  }

  this.hasStarted = true;
}

// this function switches the buffer to the forwards one
player.prototype.seekForward = function(time) {
  if (this.playingBackwards) {
    this.backwardSource.stop();
  }
  this.playingBackwards = false;
  if (this.playingForwards)
    return;
  if (!this.fwdContext)
    return
  var source = this.fwdContext.createBufferSource();
  source.buffer = this.fwdBuffer;
  source.connect(this.fwdContext.destination);
  window.forwardSource = this.forwardSource = source;
  source.start(0, time);
  this.playingForwards = true;
  this.curContext = this.fwdContext;
  // this.gainNode = fwdContext.createGain();
  // // Connect the source to the gain node.
  // source.connect(this.gainNode);
  // this.gainNode.value = 1;

}

player.prototype.seekBackwards = function(time) {
  if (time < 0 ) return;
  if (this.playingForwards) {
    this.forwardSource.stop();
  }
  this.playingForwards = false;
  if (this.playingBackwards)
    return;
  if (!this.backContext)
    return;
  var source = this.backContext.createBufferSource();
  source.buffer = this.backBuffer;
  source.connect(this.backContext.destination);
  window.backwardSource = this.backwardSource = source;
  source.start(0,this.songLength-time);
  this.playingBackwards = true;

  // this.gainNode = backContext.createGain();
  // // Connect the source to the gain node.
  // source.connect(this.gainNode);
  // this.gainNode.value = 1;
}

// there needs another layer to copy the buffer into timed chunks of smaller buffers

player.prototype.loadSoundBackwards = function(buffer, context) {

//    var source = context.createBufferSource();
    Array.prototype.reverse.call( buffer.getChannelData(0) );
    Array.prototype.reverse.call( buffer.getChannelData(1) );
    this.backBuffer = buffer;
    this.backContext = context;
    var source = context.createBufferSource;
    source.buffer = buffer;
    console.log("backloaded")
};

player.prototype.loadSoundForward = function(buffer, context) {
    var p1 = performance.now();
    this.fwdBuffer = buffer;
    this.fwdContext = context;

    console.log('backloaded')
    var source = context.createBufferSource; //contextBufferSource();
    source.buffer = buffer;
    this.songLength = source.buffer.duration;
    console.log("songLength: "+this.songLength);
    console.log(performance.now() - p1);
}
