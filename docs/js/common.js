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
   $(".tooltip-link").on("mouseenter", function (e) {
    $(this).closest('td').addClass('pd-td--visible');
    $(this).parent().addClass("is-active");
   });
  
   //убираем курсор мыши
   $(".tooltip-link").on("mouseleave ", function (e) {
    $(this).closest('td').removeClass('pd-td--visible');
    $(this).parent().removeClass("is-active");
   }); 
 }


//- tooltip по клику
	$(".tooltip-link").on("click", function (evnTooltip) {
		evnTooltip.preventDefault();
		if ($("body").hasClass("mobile")) {
			if (!$(this).parent().hasClass("is-active")) {
				$("body")
					.find(".pg-tooltip--box.is-active")
					.removeClass("is-active");
    $(this).parent().addClass("is-active");
    $(this).closest('td').addClass('pd-td--visible');
			} else {
    $(this).parent().removeClass("is-active");
    $(this).closest('td').removeClass('pd-td--visible');
			}

			evnTooltip.stopPropagation();
		}
	});

	$(".pg-tooltip--content").on("click", function (evnTooltip) {
		if ($("body").hasClass("mobile")) {
			evnTooltip.stopPropagation();
		}
	});

	$("body").on("click", function () {
		if ($("body").hasClass("mobile")) {
			$(".pg-tooltip--box").removeClass("is-active");
			$(".table").find('.pd-td--visible').removeClass("pd-td--visible");
		}
	}); 


 // простой пример затемненния над таблицей
	$(".btn__pg-start-js").on("click", function (e) {
  e.preventDefault();
  $('#table_data').addClass('ajax_node_loader');
  setTimeout(function() {
   $('#table_data').removeClass('ajax_node_loader');
  }, 1000);
 }); 
 

});

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
