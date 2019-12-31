BasicPlayerControls = function(songs, enableSeek, enableSpeedTweak, doParseUrl, doOnDropFile, current) {
	this._doOnDropFile = doOnDropFile;
	this._current = (typeof current != 'undefined') ? current : -1;
	if (Object.prototype.toString.call(songs) === '[object Array]') {
		this._someSongs =  songs;
	}
	else {
		console.log('warning: no valid song list supplied. starting empty');
		this._someSongs = [];
	}
	this._enableSeek = enableSeek;
	this._enableSpeedTweak = enableSpeedTweak;
	this._doParseUrl = doParseUrl;
	this.initDomElements();
};

BasicPlayerControls.prototype = {
	// facade for player functionality so that BasicPlayerControls user does not also need to know the player
// 	pause: function() {
// 		ScriptNodePlayer.getInstance().pause();
// 	},
// 	resume: function() {
// 		ScriptNodePlayer.getInstance().resume();
// 	},
	playpause: function() {
		var p = ScriptNodePlayer.getInstance();
		var audioCtx = p.getAudioContext();

		if (audioCtx.state == 'suspended') {
			p.resume();
			this.playIndexSong(0);
		}
		else if (p.isPaused()) {
			ScriptNodePlayer.getInstance().resume();
			$('#button-playpause i').removeClass('fa-play').addClass('fa-pause');
		}
		else {
			ScriptNodePlayer.getInstance().pause();
			$('#button-playpause i').removeClass('fa-pause').addClass('fa-play');
		}
	},
	stop: function() {
		var p = ScriptNodePlayer.getInstance();

		p._bufferSource.stop(0);
	},
	setVolume: function(value) {
		ScriptNodePlayer.getInstance().setVolume(value);
	},
	getSongInfo: function() {
		return ScriptNodePlayer.getInstance().getSongInfo();
	},
	getSongIndex: function() {
		return this._current;
	},
	addSong: function(filename) {
		this._someSongs.push(filename);
	},
	seekPos: function(relPos) {
		var p = ScriptNodePlayer.getInstance();
		p.seekPlaybackPosition(Math.round(p.getMaxPlaybackPosition() * relPos));
	},

	// some playlist handling
	removeFromPlaylist: function(songname) {
		if (this._someSongs[this._current] == songname) {
			this._someSongs.splice(this._current, 1);
			if (this._current + 1 == this._someSongs.length) this._current= 0;
		}
	},

	playNextSong: function() {
		if (ScriptNodePlayer.getInstance().isReady() && this._someSongs.length) {
			this._current = (++this._current >= this._someSongs.length) ? 0 : this._current;
			var someSong = this._someSongs[this._current];
			this.playSong(someSong);
		}
	},

	playPreviousSong: function() {
		if (ScriptNodePlayer.getInstance().isReady() && this._someSongs.length) {
			this._current = (--this._current < 0) ? this._current + this._someSongs.length : this._current;
			var someSong = this._someSongs[this._current];
			this.playSong(someSong);
		}
	},

	playIndexSong: function(index) {
		if (ScriptNodePlayer.getInstance().isReady() && this._someSongs.length) {
			this._current = (index > this._someSongs.length) ? this._current : index;
			var someSong = this._someSongs[this._current];
			this.playSong(someSong);
		}
	},

	playSongWithBackend: function (options, onSuccess) {
		// backend adapter to be used has been explicitly specified	
		var o = options.backendAdapter;
		ScriptNodePlayer.createInstance(o.adapter, o.basePath, o.preload, o.enableSpectrum, onSuccess, o.doOnTrackReadyToPlay, o.doOnTrackEnd);
	},

	playSong: function(someSong) {
		var audioCtx = ScriptNodePlayer.getInstance().getAudioContext();

// 		// handle Google's bullshit "autoplay policy"
// 		if (audioCtx.state == 'suspended') {
// 			var modal = document.getElementById('autoplayConfirm');
// 			modal.style.display = 'block'; // force user to click
// 
// 			window.globalDeferredPlay = function() { // setup function to be used "onClick"
// 				audioCtx.resume();
// 				this._playSong(someSong);
// 			}.bind(this);
// 		}
// 		else {
			this._playSong(someSong);
			$('#button-playpause i').removeClass('fa-play').addClass('fa-pause');
// 		}
	},

	_playSong: function(someSong) {
		var arr = this._doParseUrl(someSong);
		var options = arr[1];

		if (typeof options.backendAdapter != 'undefined') {
			var name = arr[0];
			var o = options.backendAdapter;
			this.playSongWithBackend(options, (function() {
				var p = ScriptNodePlayer.getInstance();
				
				p.loadMusicFromURL(name, options, 
					(function(filename) {
					}), 
					(function() { 
						this.removeFromPlaylist(someSong); /* no point trying to play this again */
					}.bind(this)), 
					(function(total, loaded) {
					})
				);

				o.doOnPlayerReady();
			}.bind(this)));
		}
		else {
			var p = ScriptNodePlayer.getInstance();
			if (p.isReady()) {
				p.loadMusicFromURL(arr[0], options, 
				(function(filename){}), 
				(function(){ this.removeFromPlaylist(someSong); /* no point trying to play this again */ }.bind(this)), 
				(function(total, loaded){}));
			}
		}
	},

	animate: function() {
		// animate playback position slider
		var slider = document.getElementById('range-seek');
		if (slider && !slider.blockUpdates) {
			var p = ScriptNodePlayer.getInstance();
			slider.value = Math.round(255 * p.getPlaybackPosition() / p.getMaxPlaybackPosition());
		}
	},

	// ---------------------    drag&drop feature -----------------------------------
	dropFile: function(checkReady, ev, funcName, options, onCompletion) {
	},

	drop: function(ev) {
	},

	// to be overridden in subclass
	initExtensions: function() {
	}, 
	
	allowDrop: function(ev) {
		ev.preventDefault();
		ev.dataTransfer.dropEffect = 'move'; // needed for FF
	},

	initUserEngagement: function() {
		// handle Goggle's latest "autoplay policy" bullshit (patch the HTML/Script from here within this
		// lib so that the various existing html files need not be touched)

		var d = document.createElement("DIV");
		d.setAttribute("id", "autoplayConfirm");
		d.setAttribute("class", "modal-autoplay");

		var dc = document.createElement("DIV");
		dc.setAttribute("class", "modal-autoplay-content");

		var p = document.createElement("P");
		var t = document.createTextNode("You may thank the clueless Google Chrome idiots for this useless add-on dialog - without which their \
		user unfriendly browser will no longer play the music (which is the whole point of this page).\
		Click outside of this box to continue.");
		p.appendChild(t);

		dc.appendChild(p);
		d.appendChild(dc);

		document.body.insertBefore(d, document.body.firstChild);

		var s= document.createElement('script');
		s.text = 'var modal = document.getElementById("autoplayConfirm");\
			window.onclick = function(event) {\
				if (event.target == modal) {\
					modal.style.display = "none";\
					if (typeof window.globalDeferredPlay !== "undefined") { window.globalDeferredPlay();\
					delete window.globalDeferredPlay; }\
				}\
			}';
		document.body.appendChild(s);
	},

	initTooltip: function() {},
	initDrop: function() {},

	appendControlElement: function(elmt) {
		var controls= document.getElementById('controls');
		controls.appendChild(elmt);  
		controls.appendChild(document.createTextNode(' ')); // spacer
	},

	initDomElements: function() {
// 		var play = document.getElementById('button-play');
// 		play.onclick = function(e) {
// 			this.resume();
// 		}.bind(this);
// 
// 		var pause = document.getElementById('button-pause');
// 		pause.onclick = function(e) {
// 			this.pause();
// 		}.bind(this);

		var button_playpause = document.getElementById('button-playpause');
		button_playpause.onclick = function(e) {
			this.playpause();
		}.bind(this);

		var button_stop = document.getElementById('button-stop');
		button_stop.onclick = function(e) {
			this.stop();
		}.bind(this);

		var button_previous = document.getElementById('button-previous');
		button_previous.onclick = function(e) {
			this.playPreviousSong();
		}.bind(this);

		var button_next = document.getElementById('button-next');
		button_next.onclick = function(e) {
			this.playNextSong();
		}.bind(this);

		var range_gain = document.getElementById('range-gain');
		range_gain.min = 0;
		range_gain.max = 255;
		range_gain.value = 255;
		range_gain.onchange = function(e) {
			this.setVolume(range_gain.value / 255);
		}.bind(this);

		if (this._enableSeek) {
			var range_seek = document.getElementById('range-seek');
			range_seek.min = 0;
			range_seek.max = 255;
			range_seek.value = 0;
			// FF: 'onchange' triggers once the final value is selected; 
			// Chrome: already triggers while dragging; 'oninput' does not exist in IE 
			// but supposedly has the same functionality in Chrome & FF
			range_seek.oninput = function(e) {
				if (window.chrome)
					range_seek.blockUpdates = true;
			};
			range_seek.onchange = function(e) {
				if (!window.chrome)
					range_seek.onmouseup(e);
			};
			range_seek.onmouseup = function(e) {
				var p = ScriptNodePlayer.getInstance();
				this.seekPos(range_seek.value / 255);
				range_seek.blockUpdates = false;
			}.bind(this);
		}

		this.initUserEngagement();
		this.initDrop();
		this.initTooltip();

		this.initExtensions();
	}
};
