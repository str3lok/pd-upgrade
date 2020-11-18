function isMobile() {
	try {
		document.createEvent("TouchEvent");
		return true;
	} catch (e) {
		return false;
	}
}

if (isMobile()) $("body").addClass("mobile");

$(function() {
//выбрать все чекбоксы 
 $('body').on('click', '.check-all-js', function(){
  var _this = $(this);
  checked_all('table__pg--upgrade', _this);
 });

 	if (!$("body").hasClass("mobile")) {
   $("body").on("mouseenter", '.tooltip-link', function (e) {
    $(this).closest('td').addClass('pd-td--visible');
    $(this).parent().addClass("is-active");
   });
  
   //убираем курсор мыши
   $("body").on("mouseleave ", '.tooltip-link', function (e) {
    $(this).closest('td').removeClass('pd-td--visible');
    $(this).parent().removeClass("is-active");
			}); 
			

	}//- not mobile
	


//- tooltip по клику
	$("body").on("click", '.tooltip-link', function (evnTooltip) {
		evnTooltip.preventDefault();
		if ($("body").hasClass("mobile")) {
			if (!$(this).parent().hasClass("is-active")) {
				$("body")
					.find(".pg-tooltip--box.is-active")
					.removeClass("is-active");
    $(this).parent().addClass("is-active");
				$(this).closest('td').addClass('pd-td--visible');
				
				$('.pg-artist-tooltip--visible').removeClass("pg-artist-tooltip--visible");
			} else {
    $(this).parent().removeClass("is-active");
    $(this).closest('td').removeClass('pd-td--visible');
			}

			evnTooltip.stopPropagation();
		}
	});

	$("body").on("click", '.pg-tooltip--content', function (evnTooltip) {
		if ($("body").hasClass("mobile")) {
			evnTooltip.stopPropagation();
		}
	});

		// artist tooltip 
		$("body").on("click", '.pg-artist-tooltip-js', function (evnTooltip) {
			if ($("body").hasClass("mobile")) {
				evnTooltip.preventDefault();
				
				var paretd_td = 	$(this).closest('td');
				
				if($(paretd_td).hasClass('pg-artist-tooltip--visible')) {
					$(paretd_td).removeClass('pg-artist-tooltip--visible');
				}
				else {
					$('.table').find('.pg-artist-tooltip--visible').removeClass('pg-artist-tooltip--visible');
					$(this).closest('td').addClass('pd-td--visible').addClass('pg-artist-tooltip--visible');
				}

				try {
					$('.table').find('.pg-tooltip--box.is-active').removeClass('is-active')
				} catch (e) {}			
			}
			evnTooltip.stopPropagation();
	}); 


	$("body").on("click", function () {
		if ($("body").hasClass("mobile")) {
			try {
				$(".pg-tooltip--box").removeClass("is-active");
				$(".table").find('.pd-td--visible').removeClass("pd-td--visible");
				$('.pg-artist-tooltip--visible').removeClass("pg-artist-tooltip--visible");
			} catch (e) {}			
		}

		try {
			$('.pg-input-date').inputmask("99-99-99"); 
			$('.pg-input-time').inputmask("99:99"); 
		} catch (e) {}	
	}); //-end ready




 // простой пример затемненния над таблицей
	$(".btn__pg-start-js").on("click", function (e) {
  e.preventDefault();
  $('#table_data').addClass('ajax_node_loader');
  setTimeout(function() {
   $('#table_data').removeClass('ajax_node_loader');
  }, 1000);
	}); 
	
	// открыть модалку даты
	$('body').on('click', '.pg-date-update-js', function (e) {
		e.preventDefault();
		var modalId = $(this).attr('data-modal');
		$('#'+modalId).fadeIn();
		$('body').addClass('bodyFix');

		var time, date, input_date, input_time;

		input_date = $('#'+modalId).find('.pg-input-date-upload');
		input_time = $('#'+modalId).find('.pg-input-time-upload');

		time = $(this).find('.pg-date-time').text();
		date = $(this).find('.pg-date-text').text();

		if(date.length >=2 ) {
			input_date.val(date);
		}
		else {
			input_date.val(" ");
		}

		if(time.length >=2 ) {
			input_time.val(time);
		}
		else {
			input_time.val(" ");
		}
		return false;
	});	

// play/pause
$('body').on('click', '.pg-audio-js', function (e) {
		e.preventDefault();
		var _this = $(this);
		var id_audio = $(this).attr('data-audio');

  if (!$(_this).hasClass('is-pause')) {

			var playing_audio = $('.table__pg--upgrade').find('.is-pause');
			// если есть запущенный трек ставим его на паузу
			if($(playing_audio).length >= 1) {
				var playing_audio_id = $(playing_audio).attr('data-audio');
				playpause(playing_audio_id);
				$(playing_audio).removeClass('is-pause');
				$(playing_audio).closest('td').removeClass('pg-td-audio');
				$(playing_audio).closest('tr').removeClass('is-now-playing');
				$(_this).addClass('is-pause');
				$(_this).closest('td').addClass('pg-td-audio');
				$(_this).closest('tr').addClass('is-now-playing');
			}
			else {
				$(_this).closest('td').addClass('pg-td-audio');
				$(_this).closest('tr').addClass('is-now-playing');
				$(_this).addClass('is-pause');
			}

  } else {
			$(_this).closest('tr').removeClass('is-now-playing');
			$(_this).closest('td').removeClass('pg-td-audio');
			$(_this).removeClass('is-pause');
		}

  playpause(id_audio);
});

//убрать фон под плеером на тач устройствах 
$('body').on('click', '.audio-close-js', function (e) {
	e.preventDefault();
	$(this).closest('td').removeClass('pg-td-audio');
});

// scan
$('body').on('click', '.pg-audio-scan-js', function (e) {
	e.preventDefault();
	if(!$(this).hasClass('is-active')) {
		$(this).addClass('is-active');
		// всем трекам ставим стоп
		// воспроизводим с самого начала
	}
	else {
		$(this).removeClass('is-active');
	}
});

// показать форма файла на тач устройствах
$('body').on('click', '.format-btn-js', function (e) {
	e.preventDefault();
	// if ($("body").hasClass("mobile")) {
		var parent_format = $(this).closest('.pg__audio-format');
		var drop_block = $(parent_format).find('.pg__audio-format--dropdown');

		if( drop_block.is(':hidden') ) {
			var dropdown_visible =  $('.table__pg--upgrade').find('.pg__audio-format--dropdown:visible');
			var dropdown_visible_count =  $(dropdown_visible).length;
			if(dropdown_visible_count >= 1) {
				$(dropdown_visible).hide();
			}

			$(drop_block).show();
		}
		else {
			$(drop_block).hide();
		}
	// }
});

// like
$('body').on('click', '.pg-audio-plus-js', function (e) {
	e.preventDefault();
	var parent_tr = $(this).closest('tr');
	if((!$(this).hasClass('is-active')) &&  (!$(this).hasClass('is-disabled'))) {
		$(this).addClass('is-active');
		// если поставили лайк, то дизлайк меняем на пнопку следующий трек
		$(parent_tr).find('.pg-audio-minus-js').addClass('is-active');
	}
	else {
		// $(this).removeClass('is-active');
		// $(parent_tr).find('.pg-audio-minus-js').removeClass('is-active');
	}
});

// diz like
$('body').on('click', '.pg-audio-minus-js', function (e) {
	e.preventDefault();
	var parent_tr = $(this).closest('tr');
	if(!$(this).hasClass('is-active')) {
		$(this).addClass('is-active');
		$(parent_tr).find('.pg-audio-plus-js').addClass('is-disabled');
	}
	else {
		//переключаем на следующй трек
		// var audio_id = $('.table__pg--upgrade').find('.is-now-playing + tr').attr('data-audio');
		var audio_id = $(parent_tr).next('tr').attr('data-audio');
		// if(audio_id == "undefined") {
			// var audio_id_first = $('.table__pg--upgrade').find('tbody tr:first-chlid').attr('data-audio');
		// }
		// console.log(audio_id_first);
		// console.log(audio_id);
		$('.pg-audio-js.'+audio_id).trigger('click');
	}
});

// пауза треков при воспроизведении видео ролика
$('body').on('click', '.yt-play-js', function (e) {
			var playing_audio = $('.table__pg--upgrade').find('.is-pause');
			// если есть запущенный трек ставим его на паузу
			if($(playing_audio).length >= 1) {
				var playing_audio_id = $(playing_audio).attr('data-audio');
				playpause(playing_audio_id);
				$(playing_audio).removeClass('is-pause');
				$(playing_audio).closest('td').removeClass('pg-td-audio');
				$(playing_audio).closest('tr').removeClass('is-now-playing');
			}	
});






 

}); //- end ready


//- выделить всё
function checked_all(block, event) {
 var container_checkbox = $('.'+block);
 
 if($(event).hasClass('is-active')){
  $(event).removeClass('is-active');
  $(container_checkbox).find('.table__pg--checkbox').prop("checked", false);
 }
 else {
  $(event).addClass('is-active');
  $(container_checkbox).find('.table__pg--checkbox').prop("checked", true);
 }

}

//- при загрузке добавляем класс is-active, для того чтобы работала функция checked_all 
function checked_all_load(block, btn_checkbox) {
 var container_checkbox = $('.'+block);
 // всего чекбоксов
 var all_checkbox = $(container_checkbox).find('.table__pg--checkbox').length;
 // всего выбранных чекбоксов
 var all_checkbox_checked = $(container_checkbox).find('.table__pg--checkbox:checked').length;

 if(all_checkbox == all_checkbox_checked) {
  $('.'+btn_checkbox).addClass('is-active');
 }

}

function loadPage() {
 if($('.table__pg-checkbox--all')) {
  checked_all_load('table__pg--upgrade', 'table__pg-checkbox--all');
 }
}//end loadPage
window.addEventListener("load", loadPage);
