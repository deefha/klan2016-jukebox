$(function() {
	$('#covers-1').vegas({
		slides: [
			{ src: 'img/cover/00.jpg' },
			{ src: 'img/cover/02.jpg' },
			{ src: 'img/cover/04.jpg' },
			{ src: 'img/cover/06.jpg' },
			{ src: 'img/cover/08.jpg' },
			{ src: 'img/cover/10.jpg' },
			{ src: 'img/cover/12.jpg' },
			{ src: 'img/cover/14.jpg' },
			{ src: 'img/cover/16.jpg' },
			{ src: 'img/cover/18.jpg' },
			{ src: 'img/cover/20.jpg' },
			{ src: 'img/cover/22.jpg' },
			{ src: 'img/cover/24.jpg' },
			{ src: 'img/cover/26.jpg' },
			{ src: 'img/cover/28.jpg' },
			{ src: 'img/cover/30.jpg' },
			{ src: 'img/cover/32-33.jpg' },
			{ src: 'img/cover/35.jpg' },
			{ src: 'img/cover/37.jpg' },
			{ src: 'img/cover/39.jpg' },
			{ src: 'img/cover/41.jpg' }
		],
// 		overlay: 'css/vendor/vegas/overlays/04.png',
		overlay: false,
		shuffle: true,
		cover: false,
		animation: 'random',
		delay: 15000,
		timer: false,
		color: '#000000'
	});

	$('#covers-2').vegas({
		slides: [
			{ src: 'img/cover/01.jpg' },
			{ src: 'img/cover/03.jpg' },
			{ src: 'img/cover/05.jpg' },
			{ src: 'img/cover/07.jpg' },
			{ src: 'img/cover/09.jpg' },
			{ src: 'img/cover/11.jpg' },
			{ src: 'img/cover/13.jpg' },
			{ src: 'img/cover/15.jpg' },
			{ src: 'img/cover/17.jpg' },
			{ src: 'img/cover/19.jpg' },
			{ src: 'img/cover/21.jpg' },
			{ src: 'img/cover/23.jpg' },
			{ src: 'img/cover/25.jpg' },
			{ src: 'img/cover/27.jpg' },
			{ src: 'img/cover/29.jpg' },
			{ src: 'img/cover/31.jpg' },
			{ src: 'img/cover/34.jpg' },
			{ src: 'img/cover/36.jpg' },
			{ src: 'img/cover/38.jpg' },
			{ src: 'img/cover/40.jpg' },
			{ src: 'img/cover/42.jpg' }
		],
// 		overlay: 'css/vendor/vegas/overlays/04.png',
		overlay: false,
		cover: false,
		animation: 'random',
		delay: 14000,
		timer: false,
		color: '#000000'
	});

	$('#playlist a').click(function() {
		if (playerControls) playerControls.playIndexSong($(this).data('index') - 1);
		$('#button-playpause i').removeClass('fa-play').addClass('fa-pause');
		return false;
	});

	var playerControls;
	var songDisplay;

	// configure what music infos to display in SongDisplay
	XMPDisplayAccessor = (function() {
		var $this = function(doGetSongInfo) {
			$this.base.call(this, doGetSongInfo);
		}; 
		var $this = function(doGetSongIndex) {
			$this.base.call(this, doGetSongIndex);
		}; 
		extend(DisplayAccessor, $this, {
			getDisplayTitle: function() { return "WebXmp"; },
			getDisplaySubtitle: function() { return "lets play some music.."; },
			getDisplayLine1: function() { return this.getSongInfo().title; },
			getDisplayLine2: function() { return this.getSongInfo().player; },
			getDisplayLine3: function() { return ""; }
		});
		return $this;
	})();

	function doOnTrackEnd(){
		if (playerControls) playerControls.playNextSong();  
	}

	function doOnTrackReadyToPlay(){
		ScriptNodePlayer.getInstance().play();
		songDisplay.redrawSongInfo();
	}

	function doOnPlayerReady() {
		if (playerControls) playerControls.playNextSong();
	}

	function init() {
		var basePath = ''; // not needed here
		ScriptNodePlayer.createInstance(new XMPBackendAdapter(), basePath, [], true, doOnPlayerReady, doOnTrackReadyToPlay, doOnTrackEnd);

		var songs = [
			'track/01.mod',
			'track/02.xm',
			'track/03.xm',
			'track/04.xm',
			'track/05.xm',
			'track/06.xm',
			'track/07.xm',
			'track/08.mod',
			'track/09.mod',
			'track/10.xm',
			'track/11.xm',
			'track/12.xm',
			'track/13.xm',
			'track/14.xm',
			'track/15.xm',
			'track/16.xm',
			'track/17.xm',
			'track/18.xm',
			'track/19.xm',
			'track/20.xm',
			'track/21.xm',
			'track/22.xm',
			'track/23.xm',
			'track/24.xm',
			'track/25.xm',
			'track/26.xm',
			'track/27.xm',
			'track/28.xm',
			'track/29.xm',
			'track/30.xm',
			'track/31.xm',
			'track/32.xm',
			'track/33.xm',
			'track/34.xm',
			'track/35.xm',
			'track/36.xm',
			'track/37.xm',
			'track/38.xm',
			'track/39.xm',
			'track/40.xm',
			'track/41.xm',
			'track/42.xm',
			'track/43.xm',
			'track/44.xm',
			'track/45.xm',
			'track/46.xm',
			'track/47.xm'
		];

// 		function(songs, enableSeek, enableSpeedTweak, doParseUrl, doOnDropFile, current)
		playerControls = new BasicPlayerControls(songs, true, false,
			(function(someSong) {
					var options= {};
					return [someSong, options];
			})
		);

		// limit rendering to 50% of the available time (XMP is fast so there is no need ..)
		// function(displayAccessor, colors, barType, cpuLimit, doAnimate)
		songDisplay = new SongDisplay(
			new XMPDisplayAccessor((function() { return playerControls.getSongIndex(); })), 
			[0xd50000], 0, 0.5, (function() { playerControls.animate(); })
		);

// 		playerControls.playNextSong();
	}

	init();

});
