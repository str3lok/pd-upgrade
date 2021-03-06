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
  checked_all('table-pg-audio', _this);
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

// показать форма файла на тач устройствах
$('body').on('click', '.format-btn-js', function (e) {
	e.preventDefault();
	if ($("body").hasClass("mobile")) {
		var parent_format = $(this).closest('.pg__audio-format');
		var drop_block = $(parent_format).find('.pg__audio-format--dropdown');

		if( drop_block.is(':hidden') ) {
			var dropdown_visible =  $('.table-pg-audio').find('.pg__audio-format--dropdown:visible');
			var dropdown_visible_count =  $(dropdown_visible).length;
			if(dropdown_visible_count >= 1) {
				$(dropdown_visible).hide();
			}

			$(drop_block).show();
			setTimeout(function() {
				$(drop_block).hide();
			}, 3000);			
		}
		// else {
		// 	$(drop_block).hide();
		// }
	}
});

	// скрываем данные в столбце Track Artist IDs по ховеру на проигрыватель
	$('body').on('mouseenter', '.pg__audio--block', function(e) {
		if (!$("body").hasClass("mobile")) {
			$(this).closest('tr').addClass('is-hover-audio');
		}
	});
	
	// ховер уходит с проигрывателя отображаем данные в столбце Track Artist IDs
	$('body').on('mouseleave', '.pg__audio--block', function(e) {
		if (!$("body").hasClass("mobile")) {
			$(this).closest('tr').removeClass('is-hover-audio');
		}
	});

	// show/hide menu mobile
	$('body').on('click', '.mobile-nav-js', function (e) {
		e.preventDefault();

		if($(this).hasClass('is-active')) {
			$(this).removeClass('is-active');
			$('.header__mobile').removeClass('is-active');
		}
		else {
			$(this).addClass('is-active');
			$('.header__mobile').addClass('is-active');
		}
	}); 

	// закрыть мобильное меню
	$('body').on('click', '.header__mobile--close', function (e) {
		e.preventDefault();
		$('.mobile-nav-js').removeClass('is-active');
		$('.header__mobile').removeClass('is-active');
	}); 	

}); //- end ready


// function progress_text_color()
// {

// 	//получаем ширину progress-bar на данный момент
// 	var progress_width = $('.audio__progress').outerWidth();
// 	var progress_bar_width = $('.audio__progress--bar').outerWidth();
// 	var progress_time_width = $('.audio__progress-time').outerWidth();

// 	(progress_time_width + 31)
// 	var progress_track_width = $('.audio__progress-track').outerWidth();
// 	(progress_track_width - 28)

/*
	//получаем ширину контейнера в котрой находится progress-bar
	var prWidth = $('.progress__box').width();

	//получаем ширину блока значений (процент, выработанные часы и лимит часов)
	var prTextWidth = $('.progress-absolute span').width();

	//получаем отступ блока значений от левого края
	var prMargin = (prWidth-prTextWidth)/2;
	//если ширина progress-bar больше или равна отступу блоку значений, по делаем вычисления
	if((prBarWidth !=0) && (prBarWidth>=prMargin)) {
			//получаем разницу на сколько ширина progress-bar больше отступа от левого края, и на эту разницу закрашиваем белым цветом блок значений
			var colorW = (prBarWidth-prMargin);
			$('.progress-absolute span').css({'background':'linear-gradient(90deg, rgba(255,255,255,1) '+ colorW+'px,rgba(0,0,0,1) ' + colorW+'px, rgba(0,0,0,1) '+prTextWidth+'px)'});
	}

	*/

// }


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
  checked_all_load('table-pg-audio', 'table__pg-checkbox--all');
 }
}//end loadPage
window.addEventListener("load", loadPage);
