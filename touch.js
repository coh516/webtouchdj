// Used to keep track of active touches.
toucher = function() {
  this.currentTouches = new Array;
	this.setupListeners();
	window.player = this.player = new player();
  this.record = new record();
  this.player.record = this.record;
  this.player.init(this.record);
	this.record.init(this.player);
}

// Finds the array index of a touch in the currentTouches array.
toucher.prototype.findCurrentTouchIndex = function (id) {
	for (var i=0; i < this.currentTouches.length; i++) {
		if (this.currentTouches[i].id === id) {
			return i;
		}
	}
	// Touch not found! Return -1.
	return -1;
};

//-------------------------//
// Handler Methods
//-------------------------//

// Creates a new touch in the currentTouches array and draws the starting
// point on the canvas.

toucher.prototype.getItem = function(touch) {
  for (var i =0; i < this.record.uis.length; i++) {
    var item = this.record.uis[i];
    //console.log(touch.pageX, item.x, touch.pageY, item.y);
    var padding = item.padding ? item.padding : 0;
    if (touch.pageX > item.x - padding &&
        touch.pageY > item.y &&
        touch.pageX < item.width + item.x + padding &&
        touch.pageY < item.height + item.y) {
          console.log("returning item.");
          return item;
        }
      }
    console.log("found nothing");
}

toucher.prototype.touchStarted = function (event) {
	var touches = event.changedTouches;
  var self = this;
	for (var i=0; i < touches.length; i++) {
		var touch = touches[i];
    var item = this.getItem(touch)
    if (self.getItem(touch)) {
  		self.currentTouches.push({
  			id: touch.identifier,
        time: performance.now(),
  			pageX: touch.pageX,
  			pageY: touch.pageY,
        type: self.getItem(touch).name,
        item: self.getItem(touch)
  		});
    }
	}
};

toucher.prototype.touchMoved = function (event) {
	var touches = event.changedTouches;
	for (var i=0; i < touches.length; i++) {
		var touch = touches[i];
		var currentTouchIndex = this.findCurrentTouchIndex(touch.identifier);
    var now = performance.now();
		if (currentTouchIndex >= 0) {
			var currentTouch = this.currentTouches[currentTouchIndex];
      //if (this.getItem(currentTouch).type === "record") {
      //  console.log("adjusting record")
        var duration = (now - this.lastTime)/1000;
        // calculate rotation speed
        //var lastAngle = Math.atan2(this.record.pos.x - currentTouch.pageX, this.record.pos.y - currentTouch.pageY);
        var thisAngle = Math.atan2(this.record.pos.x - touch.pageX, this.record.pos.y - touch.pageY);
        //lastAngle = Math.abs(lastAngle);
        thisAngle = Math.abs(thisAngle);
        lastAngle = this.lastAngle;
        //console.log(thisAngle - lastAngle, thisAngle * (180/Math.PI), this.lastAngle * (180/Math.PI)) ; //, "ct x:"+currentTouch.pageX, " t x:"+ touch.pageX, currentTouch.pageY, touch.pageY);
        // fix bug where swiping to the sides are messed up

        var r = function(i) {
          return i* (180/Math.PI);
        }

        //thisAngle - this.lastAngle;
        if (touch.pageX < this.record.pos.x) { //} && touch.pageY > this.record.pos.y) {
          thisAngle = 2*Math.PI - thisAngle;
        }
        var ad = thisAngle - this.lastAngle;

        if ( thisAngle >  Math.PI && lastAngle < Math.PI) {
          ad = 2*Math.PI - thisAngle - lastAngle;
        }

        if ( lastAngle > Math.PI && thisAngle < Math.PI) {
          ad = 2*Math.PI - lastAngle - thisAngle
        }

        if (this.lastTime !== null && this.lastAngle !== null) {
          console.log(r(thisAngle), r(this.lastAngle)); // * (180/Math.PI)) + "this angle");
				  var rpm = ( 60 / ( duration * ((2*Math.PI) / (ad))));

          (this.player.defaultRPM - rpm)/2
          var lastTime;

          function schedule() {
            var currentTime = performance.now();
            var newRPM;
            if (lastTime) {
              var dt = (currentTime - lastTime);
              var dr = 10/dt;
              console.log(dr);

              var rdif = this.record.rpm - this.player.defaultRPM;
            //  console.log("rdif"+rdif);
              if (rdif > 0) {
                // faster to slower
                if (this.record.rpm - dr < this.player.defaultRPM) {
                  this.record.rpm = this.player.defaultRPM;
                } else {
                  this.record.rpm-=dr;
                }
              } else {
                //slower to faster
                if (this.record.rpm + dr > this.player.defaultRPM) {
                  this.record.rpm = this.player.defaultRPM;
                } else {
                  this.record.rpm+=dr;
                }
              }

              this.record.rpm += (rdif > 0) ? -dr : dr;

              // console.log(">>>" +this.record.rpm, "  ", this.player.defaultRPM);
              console.log(Math.abs(this.record.rpm - this.player.defaultRPM), " << diff");
              if (Math.abs(this.record.rpm - this.player.defaultRPM) < .1) {
                this.record.rpm = this.player.defaultRPM
              }
              this.player.setRPM();
            }
            //    console.log(this.record.rpm, this.player.defaultRPM, "      ____ bleh yo")
            if (Math.abs(this.record.rpm != this.player.defaultRPM)) {
              lastTime = currentTime
              console.log('scheduling');
              setTimeout(function(){ schedule() }, .01);
            }
          };
          schedule();
				  this.record.rpm = rpm;
        }

        //console.log("settingRPM" + rpm)
        // Update the touch record.
        this.lastTime = now;
        this.lastAngle = thisAngle;
		} else {
			console.log('Touch was not found!');
		}

	}

};


// Draws a line to the final touch position on the canvas and then
// removes the touh from the currentTouches array.
toucher.prototype.touchEnded = function (event) {
	var touches = event.changedTouches;

	for (var i=0; i < touches.length; i++) {
		var touch = touches[i];
		var currentTouchIndex = this.findCurrentTouchIndex(touch.identifier);

		if (currentTouchIndex >= 0) {
			var currentTouch = this.currentTouches[currentTouchIndex];

			// Remove the record.
			this.currentTouches.splice(currentTouchIndex, 1);
      this.lastAngle = null;
      this.lastTIme = null
		} else {
			console.log('Touch was not found!');
		}
	}
};


// Removes cancelled touches from the currentTouches array.
toucher.prototype.touchCancelled = function (event) {
	var touches = event.changedTouches;

	for (var i=0; i < touches.length; i++) {
		var currentTouchIndex = this.findCurrentTouchIndex(touches[i].identifier);

		if (currentTouchIndex >= 0) {
			// Remove the touch record.
			this.currentTouches.splice(currentTouchIndex, 1);
      this.lastAngle = null;
      this.lastTIme = null
		} else {
			console.log('Touch was not found!');
		}
	}
};


//-------------------------//
// Event Listeners
//-------------------------//
toucher.prototype.setupListeners = function() {
  var canvas = document.getElementById('canvas')
  // Set up an event listener for new touches.
	var self = this;
  canvas.addEventListener('touchstart', function(e) {
  	e.preventDefault();
  	self.touchStarted(event);
  });

  // Set up an event listener for when a touch ends.
  canvas.addEventListener('touchend', function(e) {
  	e.preventDefault();
  	self.touchEnded(e);
  });


  // Set up an event listener for when a touch leaves the canvas.
  canvas.addEventListener('touchleave', function(e) {
  	e.preventDefault();
  	self.touchEnded(e);
  });


  // Set up an event listener for when the touch instrument is moved.
  canvas.addEventListener('touchmove', function(e) {
  	e.preventDefault();
  	self.touchMoved(e);
  });


  // Set up an event listener to catch cancelled touches.
  canvas.addEventListener('touchcancel', function(e) {
  	self.touchCancelled(e);
  });
}
