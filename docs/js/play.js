function fadeIn(audio, rampTime, targetVolume, tick) {
	if(!targetVolume) {
		targetVolume = 1;
	}

	if(!rampTime) {
		rampTime = 1000;
	}

	if(!tick) {
		tick = 50;
	}

	var volumeIncrease = targetVolume / (rampTime / tick);

	var playingEventHandler = null;

	function ramp() {
		var vol = Math.min(targetVolume, audio.volume + volumeIncrease);
		audio.volume = vol;
		if(audio.volume < targetVolume) {
			setTimeout(ramp, tick);
		}
	}

	function startRampUp() {
		audio.removeEventListener("playing", playingEventHandler);
		ramp();
	}
	audio.volume = 0;
	audio.addEventListener("playing", startRampUp);
	audio.play();
	currentTime = 0;

 audio.addEventListener('timeupdate', function () {
//-уменьшаем громкость, и кнопку pause меняем на play
  if (audio.readyState > 0) {
   var seconds = parseInt(audio.duration);
  }
  var curtime = parseInt(audio.currentTime, 10);

  try {
	  if(curtime >= (seconds - 10)) {
	  	audio.volume += -.022;
	  }
  } catch (e) { } 

  if(seconds == curtime) {
  	$('.pg-audio-js.is-pause').removeClass('is-pause');
			$('.pg-td-audio').removeClass('pg-td-audio');
			$('.is-now-playing').removeClass('is-now-playing');
  }
 });

};

function fadeOut(audio, rampTime, targetVolume, tick) {
	var orignalVolume = audio.volume;
	if(!targetVolume) {
		targetVolume = 0;
	}
	if(!rampTime) {
		rampTime = 1000;
	}
	if(!tick) {
		tick = 50;
	}
	var volumeStep = (audio.volume - targetVolume) / (rampTime / tick);
	if(!volumeStep) {
		return;
	}

	function ramp() {
		var vol = Math.max(0, audio.volume - volumeStep);
		audio.volume = vol;

		if(audio.volume > targetVolume) {
			setTimeout(ramp, tick);
		} else {
			audio.pause();
			audio.volume = orignalVolume;
		}
	}

	ramp();
};

function playpause(id_audio) {
	var p = document.getElementById(id_audio);
	
	if (p.paused) {
	  if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform) != true) {
				fadeIn(p, 300, 1, 30);
			}
		else {
		 p.play();
		}

	} else {
		if (!!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform) != true) {
			fadeOut(p, 300, 0, 30);
		}
		else {
			p.pause()
		}

	}

	return false;
}
function stop_track (id_audio) {
	var track_id = document.getElementById(id_audio);
	track_id.pause();
	track_id.currentTime = 0.0;
	return false;
}

// HTMLAudioElement.prototype.stop_track = function() {
// 	this.pause();
// 	this.currentTime = 0.0;
// }

