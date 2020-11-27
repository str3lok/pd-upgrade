
function init_audio_items(table){

	if( !table ) return ;

	var playing_now ; // $tr
	var scan_mode = false ; 
	var scan_thresh = 10; //s before jump to next track
	
	var fade_in_ms = 100;
	var fade_out_ms = 300;
	var cross_fade_ms = 2000;
	
	var interval ;
	var audio_playing ;// plain html audio

	function interval_handler(){
		if(!playing_now || !audio_playing){
			return ;
		}
		// переход к следующему треку
		var current_time = audio_playing.currentTime;
		var duration = audio_playing.duration;
		
		var limit_duration = duration - ( fade_out_ms /1000);
		if( scan_mode ){
			limit_duration = scan_thresh - (( cross_fade_ms + fade_out_ms ) /1000);
		}
		if( current_time >= limit_duration ){
			// start new track
			var copy = playing_now ;
			var unplay_delay;
			if( scan_mode ){
				unplay_delay = cross_fade_ms;
			}
			unplay(copy, unplay_delay);// "delayed" unplay XXX
			play(copy.next());
			return;
		}
		update_progressbar(audio_playing.currentTime, audio_playing.duration );
	}
	function update_progressbar(x,all){
		//console.log(x+'s elapsed of '+ all+ 's');
		// тут можно обновлять прогрессбар
	}
	function bind_progress_handler(tr){
		unbind_progressbar();
		// установить обновление по таймеру
		interval = setInterval(interval_handler, 500);
	}

	function unbind_progressbar(){
		// очистить поля данных трека
		if(interval){
			console.log('clrd interval')
			clearInterval(interval);
		}
	}
	
	function reset_classes(tr){
		// reset all classes to default
		tr.removeClass('is-now-playing is-scan-active');
		tr.find('td:eq(1)').removeClass('pg-td-audio');
		tr.find('.pg-audio-js.is-pause').removeClass('is-pause');
		// scan
		tr.find('.pg-audio-scan-js').removeClass("is-active is-scan-pause");
	}
	
	function play(tr){
		if( ! tr.length ){
			tr = table.find('tr[data-audio]:eq(0)');
			console.log('jump to first track');
		}
		// добавить классы
		tr.addClass('is-now-playing');
		if(scan_mode){
			tr.addClass('is-scan-active');
		}
		tr.find('td:eq(1)').addClass('pg-td-audio'); // XXX
		tr.find('.pg-audio-js').addClass('is-pause'); //

		if(scan_mode){
			scan(tr);
		}
		// запустить
		var audio = tr.find('audio').first();
		audio.prop('volume', 0);
		audio.trigger('play');
		audio.animate({ volume: 1 }, ( fade_in_ms || 300 ));

		bind_progress_handler(tr);

		playing_now = tr ;
		audio_playing = audio.get(0);
	}
	
	function pause(tr){
		// change classes
		if(scan_mode){
			tr.find('.pg-audio-scan-js').removeClass('is-active').addClass("is-scan-pause");
		}
		tr.find('.pg-audio-js').removeClass('is-pause');
		tr.removeClass('is-now-playing');
		// pause audio
		var audio = tr.find('audio').first();
		audio.animate({ volume: 0 }, ( fade_out_ms || 300 ) , function(){
			audio.trigger('pause');
		});
	}
	function unpause(tr){
		if(scan_mode){
			tr.find('.pg-audio-scan-js').addClass('is-active').removeClass("is-scan-pause");
		}
		tr.find('.pg-audio-js').addClass('is-pause');
		tr.addClass('is-now-playing');
		if(scan_mode){
			tr.addClass('is-scan-active');
		}

		var audio = tr.find('audio').first();
		audio.prop('volume', 0);
		audio.trigger('play');
		audio.animate({ volume: 1 }, ( fade_in_ms || 300 ));	
	}
	// run before play! XXX
	function unplay(tr, delay){
		// all classes to defaults
		reset_classes(tr);
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
		// add classes
		var button_class = is_pause_button(tr) ? "is-active" : "is-scan-pause" ;
		tr.addClass('is-scan-active');
		tr.find('.pg-audio-scan-js').addClass( button_class );
	}
	function unscan(tr){
		// remove classes
		tr.find('.pg-audio-scan-js').removeClass("is-active is-scan-pause");
		tr.removeClass('is-scan-active');
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
		tr.find('.pg-audio-plus-js, .pg-audio-minus-js').addClass('is-active');
	}
	function handle_dislike(tr){
		console.log('dislike button pressed')
		var button = tr.find('.pg-audio-minus-js');
		if(button.hasClass('is-disabled')){
			return ;
		}
		// do stuff
		tr.find('.pg-audio-plus-js, .pg-audio-minus-js').addClass('is-active');
	}

	function handle_donat(tr){
		// do donat stuff
	}

	// left button - лайк, донат или переход к предыдущему
	table.find('.pg-audio-plus-js').click(function(){
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
	table.find('.pg-audio-minus-js').click(function(){
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
	table.find('.pg-audio-js').click(function(){
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
	table.find('.pg-audio-scan-js').click(function(){
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
	table.find('.yt-play-js').click(function(){
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