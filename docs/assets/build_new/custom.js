function modalShow(url, method, modalId, callback)
{
    $.ajax({
        url: url,
        method: method,
        cache: false,
        dataType: 'json',
        timeout: 30000,
        data: {ajax: 1},
        success: function(data){
            if (modalId != '') {
                $('#' + modalId).html(data.node).fadeIn();
                $('body').addClass('bodyFix');   
                var modal = $('#' + modalId);
                modal.find("#contentPopupPg").focus();

                activateAutoComplete(modal);
                initPhoneMask(modal);
                initClipboard(modal);
                initFileInput(modal);
                initSelect2(modal);

                // сохраняем модалку при нажатии на enter
                $('#contentPopupPg').on('keydown', function (e) {
                    if (e.keyCode == 13) {
                        $('.btn-save-js').trigger('click');
                    }
                });
            }
            if (callback != undefined) {
                try {
                    callback();
                } catch (e) {}
            }
        }
    });
}

!function(){
	var o = {};
	window.setValidator = function( k, fn ){
		if(o[k]){
			console.log('already set validator');
		}
		o[k] = fn;
	};
	window.getValidator = function( k ){
		return o[k];
	}
}();

function blockForm( obj ){
	obj.data('lock', 'отправка формы');
	obj.find('input, select, textarea').attr('disabled', 'disabled').prop('disabled', true);
}

function unblockForm( obj ){
	obj.data('lock', '');
	obj.find('input, select, textarea').attr('disabled', 'false').prop('disabled', false);
}

function ajaxFormSubmit(formId, nodeId, refresh, callback)
{
    var form = $('#' + formId);
    if (form.length == 0) return;
	
	var locked = form.data('lock');
	if( locked ){
		alert( 'Форма заблокирована: ' + locked);
		return false ;
	}

    var newCommentDiv = form.find('.comment_editor_area');
    if (newCommentDiv.length > 0) {
        newCommentDiv.each(function(){
            var area = $(this);
            $('.comment_editor_field-' + area.data('id')).val(area.html());
        });
    }

	var validator = getValidator(formId);
	if( validator && typeof validator === "function" && ! validator() ){
		console.log('validation of '+ formId + ' failed');
		return false;
	}

    var data = form.serialize() + '&ajax=1',
        method = form.attr('method');
    //console.log(data);
    //return false;

	blockForm(form);
	
    $.ajax({
        url: form.attr('action'),
        method: method,
        cache: false,
        dataType: 'json',
        timeout: 30000,
        data: data,
        success: function(data){ 
            if (nodeId != '') {
                var node = $('#' + nodeId);
                node.html(data.node);
                activateAutoComplete(node);
                initPhoneMask(node);
                initClipboard(node);
            }
            if (callback != undefined) {
                try {
                    callback();
                } catch (e) {}
            }
            console.log('trig ' + formId);
            $(document).trigger('ajax_form_submit', formId);
        },
		complete: function(){
			unblockForm(form); 
		}
    });
}

function refreshNode(nodeId)
{
    var node = $('#' + nodeId);
    if (node.length == 0) return;

    $.ajax({
        url: node.data('url'),
        method: 'GET',
        cache: false,
        dataType: 'json',
        timeout: 30000,
        data: {ajax: 1},
        success: function(data){
            node.replaceWith(data.node);   
        }
    });
}

function modalClose(modalId)
{
    $('#' + modalId).fadeOut('slow', function() {
        $('body').removeClass('bodyFix');
    });
}

function activateAutoComplete(block)
{
    var date = new Date();
    block.find('.local-time').each(function(i, elem){
        var elem = $(elem);
        date.setHours(date.getHours() + elem.data('offset')/3600 + date.getTimezoneOffset()/60)
        var dateText = date.getHours() + ':' + pad(date.getMinutes(), 2);
        //console.log(dateText);
        elem.text(dateText).val(dateText);
        setInterval(function() {
            date.setMinutes(date.getMinutes() + 1);
            dateText = date.getHours() + ':' + pad(date.getMinutes(), 2);
            //console.log(dateText);
            elem.text(dateText).val(dateText);
        }, 60000);
    });

    block.find('.js-autocomplete-geo').each(function(i, input){
        var params = {};
        if (input.dataset.kind) {
            params = {name: input.dataset.kind};
        }
        var hiddenInputVal = input.id + "-val",
            blockFlag = input.id + "-flag",
            blockTime = input.id + "-time",
            blockCountry = input.id + "-country";
        $(input).autocomplete({
            serviceUrl: "/users_new/state_find",
            autoSelectFirst: true,
            minChars:1,
            params: params,
            onSelect:function(data){
                $("#"+hiddenInputVal).val(data.addressID);
                $("#"+blockCountry).val(data.countryId);
                $("#"+blockFlag).removeClass().addClass('icon_flag ' + data.code);
                date = new Date();
                //console.log(data.value);
                //console.log(data.time_zone_sec/3600);
                //console.log(date.getTimezoneOffset()/60);
                //console.log(date.getHours());
                //console.log(date.getHours() + data.time_zone_sec/3600 + date.getTimezoneOffset()/60);
                date.setHours(date.getHours() + data.time_zone_sec/3600 + date.getTimezoneOffset()/60);
                var dateText = date.getHours() + ':' + pad(date.getMinutes(), 2);
                //console.log(dateText);
                $("#"+blockTime).text(dateText).val(dateText);
            }
        });
    });

    block.find('.js-autocomplete-radio').each(function(i, input){
        var params = {};
        if (input.dataset.kind) {
            params = {name: input.dataset.kind};
        }
        var hiddenInputVal = input.id + "-val";
		$(input).autocomplete({
            serviceUrl: "/ids/radio_find",
            autoSelectFirst: true,
            minChars:1,
            params: params,
            onSelect:function(data){
				$(input).removeClass('validation-error');
                $("#"+hiddenInputVal).val(data.userID);
            }
        });
    });

    block.find('.js-autocomplete-artist').each(function(i, input){
        var params = {};
        if (input.dataset.kind) {
            params = {name: input.dataset.kind};
        }
        var hiddenInputVal = input.id + "-val";
        $(input).autocomplete({
            serviceUrl: "/ids/artist_find",
            autoSelectFirst: true,
            minChars:1,
            params: params,
            onSelect:function(data){
				$(input).removeClass('validation-error');
                $("#"+hiddenInputVal).val(data.artistID);
            }
        });
    });
}

function initPhoneMask(block)
{
    if (block.find('.phone-input').length > 0) {
        var list = $.masksSort($.masksLoad("/assets/build_new/inputmask/phones_tophit.json"), ['#'], /[0-9]|#/, "mask");
        var maskOpts = {
            inputmask: {
                definitions: {
                    '#': {
                        validator: "[0-9]",
                        cardinality: 1
                    }
                },
                showMaskOnHover: false,
                autoUnmask: false,
                clearMaskOnLostFocus: false
            },
            match: /[0-9]/,
            replace: '#',
            listKey: "mask"
        };

        block.find('.phone-input').each(function(){
            var input = $(this);
            input.inputmasks($.extend(true, {}, maskOpts, {
                list: list,
                onMaskChange: function(maskObj, determined) {
                    //console.log(maskObj);
                    var code = 'RU';
                    if (maskObj.cc != undefined && maskObj.cc != null) {
                       code = maskObj.cc;
                    }
                    if (code == 'BS') {
                        code = '';
                    }
                    var container = input.closest('div');
                    try {
                    container.find('span.icon_flag').removeClass()
                        .addClass('icon_flag ' + code.toLowerCase());
                    } catch (e) {
                        console.log(e.message)
                    }
                    try {
                        if (countriesList[code]) {
                            container.find('input[type="hidden"]').val(countriesList[code]);
                        }
                    } catch (e) {}
                }
            })); 
        });
    }
}

function initClipboard(block)
{
    block.find('.clipboard').each(function(){
        var clipboard = new ClipboardJS(this, {
            container: document.getElementById('openDetailRadio')
        });
        clipboard.on('success', function(e) {
            //console.info('Action:', e.action);
            //console.info('Text:', e.text);
            //console.info('Trigger:', e.trigger);
            e.clearSelection();
        });
    });
}

function initFileInput(block)
{
    var input = block.find('input[type="file"]');
    if (input.length > 0) {
        var fileInputOptions = defaultFileInputOptions;

        var container = input.closest('#upload-container');
        if (container.length > 0) {
            fileInputOptions.initialPreview = [container.data('url')];
            fileInputOptions.initialPreviewConfig = [{
                fileId: container.data('id'),
                caption: container.data('caption'),
                size: container.data('size'),
                url: container.data('delete-url')
            }];
        }

        fileInputOptions.uploadExtraData = {
            uploadToken: container.data('secret'),
            itemId: container.data('itemid'),
            kind: container.data('kind')
        };
//        fileInputOptions.deleteExtraData = {
//            uploadToken: container.data('secret'),
//            itemId: container.data('itemid'),
//            kind: container.data('kind')
//        };
        //console.log(fileInputOptions);

        input.fileinput(fileInputOptions).on('fileuploaded', function(event, data, previewId, index) { // загрузка
            if (data.response != undefined) {
                var delImgIdInput = container.find('#logoIdInputDel'),                    
                    delImgId = delImgIdInput.val(),
                    newImgIdInput = container.find('#logoIdInput'),
                    prevImgId = newImgIdInput.val(); 
                // при каждой загрузке нового файла накапливаем в поле для удаления идентификаторы черновиков через запятую
                if (prevImgId != '' && prevImgId != '0') {
                    if (delImgId == '' || delImgId == '0') {
                        delImgId = prevImgId;
                    } else {
                        delImgId += ',' + prevImgId;
                    }
                    delImgIdInput.val(delImgId);
                }
                container.find('#logoIdInput').val(data.response.id);
                container.find('.pg-remove-file').show();
            }
        }).on("filebatchselected", function(event, files) { // автозагрузка
            input.fileinput("upload");       
        }).on('filedeleted', function(event, key, jqXHR, data) { // удаление
            var delImgIdInput = container.find('#logoIdInputDel'),                    
                delImgId = delImgIdInput.val(),
                newImgIdInput = container.find('#logoIdInput'),
                prevImgId = newImgIdInput.val(); 
            // при каждом удалении файла накапливаем в поле для удаления идентификаторы черновиков через запятую
            if (delImgId == '' || delImgId == '0') {
                delImgId = prevImgId;
            } else {
                delImgId += ',' + prevImgId;
            }
            delImgIdInput.val(delImgId);
            container.find('.pg-remove-file').hide();
        });
    }
}

function initSelect2(block)
{
    block.find('.js-select-coutry').select2({
        templateResult: formatState,
        templateSelection: formatState
    });
}

function formatState (state)
{
    var code = $(state.element).data('code');
    return $('<span><span class="icon_flag ' + code + '"></span>&nbsp;' + state.text + '</span>');
};

$().ready(function() {
    $('body').on('click', '.popup__close, .popup__overflow-close', function(e){
        e.preventDefault();
		$('.autocomplete-suggestions').remove();
        $('.popup__container').fadeOut('slow', function() {
            $('body').removeClass('bodyFix');
								// try{ } catch(e){ }        
        });
    });  
    $('body').on('click', '.closeTwoJs', function(e){
        e.preventDefault();
        $(this).closest('.popup__container').fadeOut();
    });  
    
    $('body').on('click', '.btn-cancel-js', function(e){ 
        e.preventDefault();
        $('.popup__close').trigger('click');
    });

    // при открытии модалки  Artist Name в performers переводим фокус на нее
    $('body').on('click', '.td-js', function(){
        $("#contentPopupPg").focus();
    });

    //Закрытие старых pop-up форм при нажатии Save
    $('body').on('click', '#js-popup_l_popup input[type="submit"].button', function (e) {
        e.preventDefault();
        let form = $(this).closest('form');
        if (typeof form !== 'undefined') {
            form.submit();
            popup.hide_popup('l_popup');
        }
    });

 $('body').on('click', '.clipboard', function(e){
  e.preventDefault();
 });

 $('body').on('click', '.pg-remove-file', function(e){
    e.preventDefault();
    $(this).closest('.pg-upload-container').find('.kv-file-remove').click();
 });


});

function pad(num, size)
{
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

var defaultFileInputOptions = {
    theme: 'fas',
    //enableResumableUpload: true,
    showUpload: true,
    showCaption: false,
    showRemove: true,
    showUploadStats: true,
    showCancel: true,
    showBrowse: true,
    
    browseOnZoneClick: true,
    autoOrientImage: true,
    browseLabel: 'Выберите файлы',
    showUploadedThumbs: true,
    dropZoneEnabled: true,   
    previewFileType: 'any',
    maxFileCount: 1,
    allowedFileTypes: ['image'], 
    showAjaxErrorDetails: false,
    retryErrorUploads: false,
    removeFromPreviewOnError: true,
    uploadAsync: true,
//    ajaxSettings: {
//        method: 'POST'
//    },
    initialPreviewAsData: true,
    uploadUrl: fileGateHost + 'upload.php',
    deleteUrl: fileGateHost + 'delete.php',
    fileActionSettings: {
        showUpload: true,
        showDownload: false,
        showRemove: true,
        showZoom: false,
        showDrag: false
    }
};

/**
 * Инициализация окна настройки прав менеджеров
 * @param $popup
 */
function initAccessMapPopup($popup) {
    // select all
    $popup.off('click', '.js-mgr-acl-all');
    $popup.on('click', '.js-mgr-acl-all', function () {
        $popup.find('.js-manager-acl-button').each(function () {
            btnOn($(this));
            setColumnMainSwitcherState($(this));
        });

        return false;
    });

    // select none
    $popup.off('click', '.js-mgr-acl-none');
    $popup.on('click', '.js-mgr-acl-none', function () {
        allBtnOff($popup);
        return false;
    });

    // on/off
    $popup.off('click', '.js-manager-acl-button');
    $popup.on('click', '.js-manager-acl-button', function () {
        var $btn = $(this);

        if ($btn.hasClass('_on')) {
            btnOff($btn);
        } else {
            btnOn($btn);
        }

        setColumnMainSwitcherState($btn);
    });

    // on/off главные кнопки
    $popup.off('click', '.js-manager-acl-switch');
    $popup.on('click', '.js-manager-acl-switch', function () {
        var $btn = $(this);
        var actionOn = !$btn.hasClass('_on');

        $btn.closest('.manager-acl__column').find('.js-manager-acl-button').each(function () {
            if (actionOn) {
                btnOn($(this));
            } else {
                btnOff($(this));
            }
        });

        setColumnMainSwitcherState($btn);
    });

    // Выбор роли
    // Сбрасываем все права, если выбрали NO_ROLE
    $popup.off('change', '.js-role-select');
    $popup.on('change', '.js-role-select', function () {
        if ($(this).find('option:selected').val() === 'NO_ROLE') {
            allBtnOff($popup);
        }
    });

    // Начальная установка кнопок
    $popup.find('.js-manager-acl-button').each(function () {
        var $btn = $(this);
        if ($btn.hasClass('_initial-selected')) {
            btnOn($btn);
        }
    });

    // Начальная установка главных кнопок
    $popup.find('.js-manager-acl-switch').each(function () {
        setColumnMainSwitcherState($(this));
    });

    /**
     * Устанавливает состояние главной кнопки столбца
     * т.е. той, которая ставит всем кнопкам в столбце состояние on/off
     * @param $clickedButton
     */
    function setColumnMainSwitcherState($clickedButton)
    {
        var allButtonsOn = true;
        var allButtonsOff = true;

        var $mainSwitcher = $clickedButton.closest('.manager-acl__column').find('.js-manager-acl-switch');

        $clickedButton.closest('.manager-acl__column').find('.js-manager-acl-button').each(function () {
            if ($(this).hasClass('_on')) {
                allButtonsOff = false
            } else {
                allButtonsOn = false;
            }
        });

        if (allButtonsOn) {
            $mainSwitcher.removeClass('_off').removeClass('_mixed').addClass('_on');
        } else if (allButtonsOff) {
            $mainSwitcher.removeClass('_on').removeClass('_mixed').addClass('_off');
        } else {
            $mainSwitcher.removeClass('_off').removeClass('_on').addClass('_mixed');
        }
    }

    /**
     * Изменяет состояние кнопки на ВКЛ
     * @param $btn
     */
    function btnOn($btn)
    {
        $btn.removeClass('_off').addClass('_on');
        $btn.parent().find('.js-manager-acl-hidden-input').val(1).attr('value', 1);
    }

    /**
     * Изменяет состояние кнопки на ВЫКЛ
     * @param $btn
     */
    function btnOff($btn)
    {
        $btn.removeClass('_on').addClass('_off');
        $btn.parent().find('.js-manager-acl-hidden-input').val(0).attr('value', 0);
    }

    /**
     * Выключает все кнопки
     * @param $popup
     */
    function allBtnOff($popup)
    {
        $popup.find('.js-manager-acl-button').each(function () {
            btnOff($(this));
            setColumnMainSwitcherState($(this));
        });
    }
}

/**
 * Валидатор формы
 *
 * @param rules объект с правилами валидации
 * @param callbacks объект с функциями выполняемыми в случае успешной валидации
 * @returns возвращает false в случе непройденной валидации, иначе выполняет callback-функции
 */
function formValidate(rules, callbacks) {
    const rulesMapper = {
        // диалог подтверждения только для одного селектора
        confirm: function (params) {
            let isConfirmed = true;
            let selector = $(params.selector);
            if (selector.val() === '' ||
                typeof selector === 'undefined') {
                isConfirmed = confirm(params.text);
            }
            return isConfirmed;
        },
        // требуемые для заполнения поля,
        // селекторы полей передаются в массиве
        required: function (params) {
            let hasErrors = [];
            let selectors = params.selectors;
            $.each(selectors, (k, selector) => {
                if ($(selector).val() === '' ||
                    typeof $(selector) === 'undefined') {
                    $(selector).addClass('validation-error');
                    hasErrors.push(selector);
                }
            });
            return (hasErrors.length === 0);
        },
    };
    let validate = true;
    $.each(rules, (k, rule) => {
        if (typeof rulesMapper[k] !== 'undefined') {
            if (!rulesMapper[k](rule)) {
                validate = false;
            }
        }
    });
    return (validate) ? $.each(callbacks, (callback, arguments) => window[callback].call(null, arguments)) : false;
}

/**
 * Проверяет доступность Icecast потока
 *
 * @param input
 */
function checkIcecast(input) {
    input.removeClass('meta-parser-invalid meta-parser-valid input-preloader');

    let stream = input.val(), delay = 1500;

    if (stream === '') {
        return false;
    }

    input.addClass('input-preloader');

    clearTimeout(input.data('delay'));

    input.data('delay', setTimeout(() => {
        input.removeData('delay');
        $.post('/ajax/check_icecast', { stream: stream, radio_id: input.data('radio_id') })
            .done(function (response) {
                input.removeClass('input-preloader');

                if (typeof response.status !== 'undefined'
                    && response.status === true) {
                    return input.addClass('meta-parser-valid');
                }

                return input.addClass('meta-parser-invalid');
            });
    }, delay));
}

/**
 * Обработка комментариев в фидбеках
 *
 * @param elem
 * @returns {boolean}
 */
function feedbackComment(elem)
{
    let id = elem.data('id'),
        newComment = $('body').find('textarea#new-comment-' + id),
        rowid = elem.data('rowid'),
        postUrl = '/feedback/communion/' + id,
        postData = '';

    if (typeof id === 'undefined' ||
        newComment.length === 0) {
        throw 'Invalid feedback ID';
    }

    if (typeof rowid === 'undefined') {
        postUrl += '?add-comment';
        postData = newComment.val();
        if (postData === '') {
            return false;
        }
    } else {
        postUrl += '?del-comment';
        postData = rowid;
    }

    $.post(postUrl, { 'comment': postData }, function (response) {
        if (!response) {
            return alert('Request error!');
        }
        $('body').find('#feedback_comments').html(response);
    });

    return false;
}

/**
 * Отправка ответного сообщения через бота
 *
 * @param id
 * @returns {boolean|void}
 */
function feedbackSendAnswer(id)
{
    let body = $('body'),
        answer = body.find('textarea[name="answer"]');

    if (answer.length > 0) {
        if (answer.val() === '') {
            return alert('Cant send answer. Message is empty.');
        }

        $.post('/feedback/communion/' + id + '?ajax=1', { answer: answer.val() }, function (response) {
            if (typeof response.node === 'undefined') {
                return alert('Cant send answer. Server error.');
            }
            body.find('.popup_content').html(response.node);
            answer.val('');
        });
    }

    return false;
}

/**
 * Сохранение сообщения фидбека
 *
 * @param id
 */
function feedbackSave(id)
{
    let body = $('body'),
        status = body.find('select#status'),
        currentStatus = $('select[name="filter[STATUS]"] option:selected').val(),
        row = body.find('#feedback_tr_' + id);

    if (status.length > 0) {
        $.post('/feedback/save/' + id, { status: status.val() }, function (response) {
            if (!response || response.error !== null) {
                return alert(response.error || 'Bad request');
            }
            if (typeof response.html !== 'undefined') {
                let html = $(response.html);
                row.html(html.find('td'));
                if (currentStatus !== 'ALL' &&
                    currentStatus !== html.data('status')) {
                    row.hide();
                    reloadTableRowsColors('table#feedback_table_content');
                }
            }
        });
    }

    return popup.hide_popup('l_popup');
}

/**
 * Быстрая раскраска строк таблицы
 *
 * @param elem
 */
function reloadTableRowsColors(elem)
{
    let rows = $(elem).find('tbody > tr').filter(':visible');
    if (rows.length > 0) {
        for (let i = 0; rows.length > i; i++) {
            $(rows[i]).attr('bgcolor', (i%2) ? '#ffffff' : '#dddddd');
        }
    }
}

/**
 *  Плеер для воспроизведения медиа потоков,
 *  на PG обычно используется при клике по индикатору в пользовательских таблицах.
 *
 *  Пример использования: $('.stream-player').streamPlayer('tr.radio', '#fffc9a');
 *
 * @param selector row, который будет подсвечен
 * @param backgroundColor цвет, которым будет подсвечен row
 * @returns {boolean|$}
 */
$.fn.streamPlayer = function(selector, backgroundColor) {
    if ($(selector).length === 0) {
        return false;
    }

    let body = $('body'),
        isPlaying,
        setBackgroundColor = (elem) => elem.css('background-color', backgroundColor),
        removeBackgroundColors = () => $.each($(selector), (k, e) => $(e).css('background-color', '')),
        makeRowsIds = () => $.each($(selector), (k, e) => $(e).data('streamPlayerId', k + 1)),
        streamPlayerTemplate =
            '<div style="display: none;" id="stream-player-wrapper">' +
            '<audio src="" id="stream-player-audio" data-playing=""></audio>' +
            '</div>';

    body.find('#stream-player-wrapper').remove();
    body.append(streamPlayerTemplate);

    makeRowsIds();

    $(this).click(function(e) {
        e.preventDefault();

        removeBackgroundColors();

        let elem = $(this).closest(selector),
            currentId = elem.data('streamPlayerId'),
            streamPlayer = body.find('#stream-player-wrapper > audio#stream-player-audio');

        if (elem.length === 0 ||
            streamPlayer.length === 0) {
            return false;
        }

        if (typeof isPlaying !== 'undefined') {
            isPlaying.then(_ => {
                streamPlayer[0].pause();
                streamPlayer[0].currentTime = 0;
            }).catch(error => {
                // console.log(error);
            });
        }

        // Останавливаем уже проигрываемый стрим
        if (streamPlayer.data('playing') === currentId) {
            streamPlayer.data('playing', '');

            return false;
        }

        streamPlayer.data('playing', currentId);
        setBackgroundColor(elem);

        // Без небольшого таймаута иногда вываливаются ошибки
        setTimeout(() => {
            streamPlayer[0].src = $(this).attr('href');
            isPlaying = streamPlayer[0].play();
        }, 100);

        return false;
    });

    return this;
};