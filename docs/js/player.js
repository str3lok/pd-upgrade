
function init_audio_items(table){

	if( !table ) return ;

	var playing_now ; // $tr
	var scan_mode = false ; 
	var scan_thresh = 10; //s before jump to next track
	
	var interval ;
	var audio_playing ;// plain html audio

	function interval_handler(){
		if(!playing_now || !audio_playing){
			return ;
		}
		// переход к следующему треку
		var current_time = parseInt(audio_playing.currentTime);
		var duration = parseInt(audio_playing.duration);
		if( current_time >= ( scan_mode ? scan_thresh : duration ) ){
			play(playing_now.next());
			return;
		}
		update_progressbar(audio_playing.currentTime, audio_playing.duration );
	}
	function update_progressbar(x,all){
		// console.log(x+'s elapsed of '+ all+ 's');
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
		tr.removeClass('is-now-playing');
		tr.find('td:eq(1)').removeClass('pg-td-audio');
		tr.find('.pg-audio-js.is-pause').removeClass('is-pause');
		// scan
		tr.find('.pg-audio-scan-js').removeClass("is-active is-scan-pause");
	}
	
	function play(tr){
		// потушить
		if( playing_now ){
			unplay(playing_now);
		}
		if( ! tr.length ){
			tr = table.find('tr[data-audio]:eq(0)');
			console.log('jump to first track');
			console.log(tr);
		}
		// добавить классы
		tr.addClass('is-now-playing');
		tr.find('td:eq(1)').addClass('pg-td-audio'); // XXX
		tr.find('.pg-audio-js').addClass('is-pause'); //

		if(scan_mode){
			scan(tr);
		}
		// запустить
		var audio = tr.find('audio').first();
		audio.prop('volume', 0);
		audio.trigger('play');
		audio.animate({ volume: 1 }, 300);

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
		
		// pause audio
		var audio = tr.find('audio').first();
		audio.animate({ volume: 0 }, 300, function(){
			audio.trigger('pause');
		});
	}
	function unpause(tr){
		if(scan_mode){
			tr.find('.pg-audio-scan-js').addClass('is-active').removeClass("is-scan-pause");
		}
		tr.find('.pg-audio-js').addClass('is-pause');
		var audio = tr.find('audio').first();
		audio.prop('volume', 0);
		audio.trigger('play');
		audio.animate({ volume: 1 }, 300);	
	}
	function unplay(tr){
		// all classes to defaults
		reset_classes(tr);
		unbind_progressbar(tr);
		// stop audio
		var audio = tr.find('audio').first();
		audio.animate({ volume: 0 }, 300, function(){
			audio.trigger('pause');
			audio.prop('currentTime', 0);
		});
		playing_now = false ;
		audio_playing = false;
	}
	function scan(tr){
		// add classes
		tr.find('.pg-audio-scan-js').addClass("is-active");
		scan_mode = true ;
	}
	function unscan(tr){
		// remove classes
		tr.find('.pg-audio-scan-js').removeClass("is-active is-scan-pause");
		scan_mode = false ;
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
		play(tr);
		return false ;
	});
	// scan
	table.find('.pg-audio-scan-js').click(function(){
		var tr = $(this).closest('tr');
		console.log('scan pressed');
		// если еще не играет именно этот трек
		if(! is_playing(tr)){
			play(tr);
		}
		if(scan_mode){
			unscan(tr);
			return false ;
		}
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