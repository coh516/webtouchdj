var record = function() {
  window.record = this;
}

record.prototype.init = function(player){
  this.player = player;
  var self = this;
  this.rpm = 0;
  this.pos = {x:150, y:150};
  this.scale = .25;
  this.recordTime = 0;
  this.degrees = 0;
  this.playHead = 0;
  this.faderRight = 0;
  window.requestAnimationFrame(function(){ self.draw()});

  this.configureUILocations();
}

record.prototype.configureUILocations = function() {
  var fader = this.fader = {name: "crossFader", x: 800, y: 300, width:300, height:100, padding: 50}
  var record = this.record = {name: "record", x:0, y: 0, width:500, height:400};
  this.uis = [fader,record];
}

// record.prototype.setRPM = function(rpm) {
//   this.lastRPM = this.rpm;
//   this.rpm = rpm;
// }

record.prototype.draw = function() {
  var scale = this.scale;
  var pos = this.pos;
  var rpm = this.rpm;

  if (this.player.forwardSource) {
    var currentTime = this.player.forwardSource.context.currentTime
  }
  currentTime = performance.now()/1000;
  this.time = currentTime;
  var ctx = document.getElementById('canvas').getContext('2d');
  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0,0,1200,1200); // clear canvas
  ctx.fillStyle = 'rgba(200,200,200,.4)';
  ctx.fillRect(0,0,1200,1200);
  ctx.save();
  ctx.translate(pos.x,pos.y);
  //var time = new Date();

  var getDegrees = function(rpm, time) {
    var speed = (60/rpm)
    var seconds = (time/speed);
    var degrees = ((2*Math.PI) * (seconds));
    return degrees;
  }
  var self = this;
  var td = function() {
    return  self.time - self.lastTime
  }
  if (this.lastTime) {
    //console.log(td(), this.time - this.lastTime);
    this.degrees += this.lastTime ? getDegrees(this.rpm, td()) : 0;
    if (isNaN(this.degrees)) {
      this.degrees = 0;
    }

    this.playHead += ((td()) * (this.rpm/60));
    if (isNaN(this.playHead)) {
      this.playHead = 0;
    }
  }

  ctx.rotate(this.degrees);

  this.lastTime = this.time;

  ctx.translate(12*scale,-12*scale);
  ctx.fillStyle = 'rgba(200,150,45,.4)';
  ctx.strokeStyle = 'rgba(0,153,255,0.4)';
  ctx.fillRect(0,0,188*scale,24*scale); // Shadow
  ctx.restore();

  ctx.beginPath();
  ctx.fillStyle = 'rgb(25,25,25)'
  ctx.arc(pos.x,pos.y,12*scale,0,Math.PI*2,false); // Earth orbit
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pos.x,pos.y,200*scale,0,Math.PI*2,false); // Earth orbit
  ctx.fillStyle = 'rgb(200,200,200)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pos.x,pos.y,250*scale,0,Math.PI*2,false); // Earth orbit
  ctx.fillStyle = 'rgb(50,50,50)';
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pos.x,pos.y,600*scale,0,Math.PI*2,false); // Earth orbit
  ctx.fillStyle = 'rgb(75,75,75)';
  ctx.stroke();
  ctx.fill();
  ctx.restore();

  this.drawCrossFader(ctx);
  // draw FADERS

  var self = this;
  requestAnimationFrame(function() {
    self.draw()
  });
}

record.prototype.drawCrossFader = function(ctx) {
  ctx.beginPath();
  var right = 300-30-this.faderRight;
  ctx.rect(800+right,300, 30, 150); // Earth orbit
  ctx.fillStyle = 'rgb(75,75,75)';
  ctx.stroke();
  ctx.fill();

  ctx.beginPath();
  ctx.rect(800, 375, 300, 10);
  ctx.stroke();
  ctx.fill();

  ctx.restore();
}
