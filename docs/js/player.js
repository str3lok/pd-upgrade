
function init_audio_items(table){

	if( !table ) return ;

	var upper_tr = table.find( 'tr.pg__tr--progress').first();
	var playing_now ; // $tr
	var scan_mode = false ; 
	var scan_thresh = 10; //s before jump to next track
	
	var fade_in_ms = 100;
	var fade_out_ms = 300;
	var cross_fade_ms = 1000;

	var preload_thresh = 5; //s preload next track when x seconds left to play
	var preload_triggered = {};
	var interval ;
	var audio_playing ;// plain html audio
	
	var interval_timeout = 300;
	
	var progress_bar = function() { 
		var block = $('.audio__progress');
		var time_elapsed = block.find('.audio__progress-text--start');
		var time_duration = block.find('.audio__progress-text--end');
		var track_title = block.find('.audio__progress-track>span');
		var bar = block.find('.audio__progress--bar');
		bar.css('transition', 'width ' + ( interval_timeout / 1000 ).toFixed(3) + 's linear' ); // плавность
		function format_time(n){
			var date = new Date(0);
			date.setSeconds(parseInt(n));
			var timeString = date.toISOString().substr(14, 5);
			return timeString;
		}
		return {
			elapsed: 0,
			duration: 0,
			set_title: function(s){ track_title.text(s) },
			set_elapsed: function(sec){
				this.elapsed = sec;
				time_elapsed.text(format_time(sec));
			},
			set_duration: function(sec){
				this.duration = sec;
				time_duration.text(format_time(sec));
			},
			update_progress: function(){
				percent = 0 ;
				if( this.duration > 0 ) {
					percent = 100 * ( ( this.elapsed + (interval_timeout/1000) ) / this.duration ) ;
				}
				bar.css('width', percent.toFixed(3) + '%');
			},
			init: function(title){
				this.set_title(title);
				this.set_duration(0);
				this.set_elapsed(0);
				this.update_progress();
			},
			update: function(elapsed, duration){
				if(duration && this.duration != duration ){
					this.set_duration(duration);
				}
				this.set_elapsed(elapsed || 0);
				this.update_progress();
			}
		};
	}();
	progress_bar.init('Stopped');

	function interval_handler(){
		if(!playing_now || !audio_playing){
			return ;
		}
		// переход к следующему треку
		var current_time = audio_playing.currentTime;
		var duration = audio_playing.duration;

		var limit_duration = ( scan_mode ? Math.min( scan_thresh, duration ) : duration ) - (Math.max( cross_fade_ms, fade_out_ms ) /1000);

		// если до конца осталось мало времени, дернуть load у следующего аудио
		if( ( limit_duration - preload_thresh) > 0 && current_time >= limit_duration - preload_thresh ){
			var next = playing_now.next();
			var au_id = next.data('audio');
			if( next.length && !preload_triggered[au_id] ){
				console.log('triggered preload');
				next.find('audio').first().prop('preload', 'auto');
				preload_triggered[au_id] = true ;
			}
		}
		// время старта нового 
		// время начала завершения нового
		if( current_time >= limit_duration ){
			var copy = playing_now ;
			if( cross_fade_ms > fade_out_ms ){
				// delay unplay
				console.log('delayed unplay')
				var unplay_delay = cross_fade_ms - fade_out_ms;
				unplay(copy, unplay_delay);// "delayed" unplay XXX
				play(copy.next());
				return;
			}
			else if( cross_fade_ms < fade_out_ms ){
				// delay play
				var play_delay = fade_out_ms - cross_fade_ms;
				console.log('delayed play')
				unplay(copy);
				setTimeout(function(){
					// на случай если юзер вдруг успел запустить другой трек (паранойя)
					if(audio_playing){
						unplay(audio_playing);
					}
					console.log('delayed play triggered')
					play(copy.next());
				}, play_delay);
				return;
			}
			else {
				console.log('undelayed play')
				unplay(copy);
				play(copy.next()); 
				return ;
			}
		}
		progress_bar.update(audio_playing.currentTime, audio_playing.duration );
	}
	function bind_progress_handler(tr){
		unbind_progressbar();
		// установить обновление по таймеру
		interval = setInterval(interval_handler, interval_timeout);
	}

	function unbind_progressbar(){
		// очистить поля данных трека
		if(interval){
			console.log('clrd interval')
			clearInterval(interval);
		}
	}
	function get_title(tr){
		var td = tr.find('td:eq(6)'); //XXX
		var author =  td.find('.pg__artist-tooltip--content').text();
		var name = td.find('span:eq(0) a span.pg-weight-bold').text();
		return name +' — '+ author ; 
	}
	// функции манипулирования стилями
	function reset_classes(tr){
		// reset all classes to default
		tr.removeClass('is-now-playing is-scan-active');
		tr.find('td:eq(1)').removeClass('pg-td-audio');
		tr.find('.pg-audio-js.is-pause').removeClass('is-pause');
		// scan
		tr.find('.pg-audio-scan-js').removeClass("is-active is-scan-pause");
		tr.find('.pg-audio-plus-js, .pg-audio-minus-js').removeClass('is-active'); // reset like buttons
	}

	function set_style_playing(tr){
		tr.addClass('is-now-playing');
		if(scan_mode){
			tr.addClass('is-scan-active');
		}
		tr.find('td:eq(1)').addClass('pg-td-audio'); // XXX
		tr.find('.pg-audio-js').addClass('is-pause'); //
	}
	function set_style_paused(tr){
		if(scan_mode){
			tr.find('.pg-audio-scan-js').removeClass('is-active').addClass("is-scan-pause");
		}
		tr.find('.pg-audio-js').removeClass('is-pause');
		tr.removeClass('is-now-playing');
	}
	function unset_style_paused(tr){
		if(scan_mode){
			tr.find('.pg-audio-scan-js').addClass('is-active').removeClass("is-scan-pause");
		}
		tr.find('.pg-audio-js').addClass('is-pause');
		tr.addClass('is-now-playing');
		if(scan_mode){
			tr.addClass('is-scan-active');
		}
	}
	function set_style_scanning(tr){
		var button_class = is_pause_button(tr) ? "is-active" : "is-scan-pause" ;
		tr.addClass('is-scan-active');
		tr.find('.pg-audio-scan-js').addClass( button_class );
	}
	function unset_style_scanning(tr){
		tr.find('.pg-audio-scan-js').removeClass("is-active is-scan-pause");
		tr.removeClass('is-scan-active');
	}
	function set_style_liked(tr){
		tr.find('.pg-audio-plus-js, .pg-audio-minus-js').addClass('is-active');
	}
	//

	function play(tr){
		if( ! tr.length ){
			tr = table.find('tr[data-audio]:eq(0)');
			console.log('jump to first track');
		}
		set_style_playing(tr);
		set_style_playing( upper_tr );

		if(scan_mode){
			scan(tr);
		}
		// запустить
		var audio = tr.find('audio').first();
		audio.prop('volume', 0);
		audio.trigger('play');
		audio.animate({ volume: 1 }, ( fade_in_ms || 300 ));

		bind_progress_handler(tr);
		progress_bar.init( get_title(tr) );
		playing_now = tr ;
		audio_playing = audio.get(0);
	}
	
	function pause(tr){
		set_style_paused(tr);
		set_style_paused(upper_tr);
		// pause audio
		var audio = tr.find('audio').first();
		audio.animate({ volume: 0 }, ( fade_out_ms || 300 ) , function(){
			audio.trigger('pause');
		});
	}
	function unpause(tr){
		unset_style_paused(tr);
		unset_style_paused(upper_tr);
		var audio = tr.find('audio').first();
		audio.prop('volume', 0);
		audio.trigger('play');
		audio.animate({ volume: 1 }, ( fade_in_ms || 300 ));	
	}
	// run before play! XXX
	function unplay(tr, delay){
		// all classes to defaults
		reset_classes(tr);
		reset_classes(upper_tr);
		unbind_progressbar(tr);
		// stop audio
		var audio = tr.find('audio').first();
		console.log('starting fade out')
		audio.delay(delay || 0).animate({ volume: 0 }, ( fade_out_ms || 300 ), function(){
			console.log('end fade out')
			audio.trigger('pause');
			audio.prop('currentTime', 0);
		});
		playing_now = false ;
		audio_playing = false;
	}
	function scan(tr){
		set_style_scanning(tr);
		set_style_scanning(upper_tr);
	}
	function unscan(tr){
		unset_style_scanning(tr);
		unset_style_scanning(upper_tr);
	}
	function is_playing(tr){
		if ( playing_now && playing_now.data('audio') == tr.data('audio') ){
			return true;
		}
		return false;
	}
	function is_pause_button(tr){
		return ( tr.find('.pg-audio-js.is-pause').length > 0 );
	}
	function is_like_button(tr){
		return ( tr.find('.pg-audio-plus-js').not('.is-active').length > 0 );
	}
	function is_dislike_button(tr){
		return ( tr.find('.pg-audio-minus-js').not('.is-active').length > 0 );
	}
	function is_donate_button(tr){
		return ( tr.find('.is-active.pg-audio-plus-js.is-donate').not('.donate-pay').length > 0 );
	}
	
	function handle_like(tr){
		var button = tr.find('.pg-audio-plus-js');
		if(button.hasClass('is-disabled')){
			return ;
		}
		// do stuff
		set_style_liked(tr);
		set_style_liked(upper_tr);
	}
	function handle_dislike(tr){
		console.log('dislike button pressed')
		var button = tr.find('.pg-audio-minus-js');
		if(button.hasClass('is-disabled')){
			return ;
		}
		// do stuff
		set_style_liked(tr);
		set_style_liked(upper_tr);
	}

	function handle_donat(tr){
		// do donat stuff
	}

	// left button - лайк, донат или переход к предыдущему
	table.find('tbody .pg-audio-plus-js').click(function(){
		var tr = $(this).closest('tr');
		console.log('left button pressed')
		// это лайк?
		if(is_like_button(tr)){
			console.log('like button pressed')
			// обработать лайк
			handle_like(tr);
			return false ;
		}
		// это донат?
		if( is_donate_button(tr)){
			console.log('donat button pressed')
			handle_donat(tr);
			return false;
		}
		// это переход влево
		console.log('prev button pressed')
		// переход вперед только если играет этот трек
		if(is_playing(tr)){
			unplay(tr);
			play(tr.prev());
		}

		return false ;
	});
	// right button - диз или переход к следующему
	table.find('tbody .pg-audio-minus-js').click(function(){
		var tr = $(this).closest('tr');
		console.log('right button pressed')
		if(is_dislike_button(tr)){
			handle_dislike(tr);	
			return false ;
		}
		// это переход вправо
		console.log('next button pressed')
		if(is_playing(tr)){
			unplay(tr);
			play(tr.next());
		}
		return false ;
	});
	// play
	table.find('tbody .pg-audio-js').click(function(){
		var tr = $(this).closest('tr');
		console.log('central button pressed')
		// это пауза?
		if( is_pause_button(tr)){
			console.log('pause button pressed')
			pause(tr);
			return false;
		}
		console.log('play button pressed')
		// на паузе?
		if( is_playing(tr) ){
			console.log('play paused audio')
			unpause(tr);
			return false; 
		}

		// запустить аудио
		// потушить другой
		if( playing_now ){
			unplay(playing_now);
		}
		play(tr);
		return false ;
	});
	// scan
	table.find('tbody .pg-audio-scan-js').click(function(){
		var tr = $(this).closest('tr');
		console.log('scan pressed');
		// если еще не играет именно этот трек
		if(! is_playing(tr)){
			// потушить другой
			if( playing_now ){
				unplay(playing_now);
			}
			play(tr);
		}
		if(scan_mode){
			unscan(tr);
			scan_mode = false ;
			return false ;
		}
		scan_mode = true ;
		scan(tr);
		return false;
	});
	// воспроизведение ролика - пауза трека
	table.find('tbody .yt-play-js').click(function(){
		if(playing_now){
			pause(playing_now);
		}
		$.fancybox.open({ src : $(this).attr("href") });
		return false;
	});
}

$(document).ready(function(){
	init_audio_items($('.table-pg-audio').first());
});