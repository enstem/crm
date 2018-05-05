$(function () {

    // $(".editable-form #name").editable();
    $(".editable-form #number2").editable({
        type: 'text',
        validate: function(value) {
            if ($.isNumeric(value) == '') {
                return 'Only numbers are allowed';
            }
        }
    });
    $(".editable-form #number3").editable({
        type: 'text',
        validate: function(value) {
            if ($.isNumeric(value) == '') {
                return 'Only numbers are allowed';
            }
        }
    });
    // $(".editable-form #phoneNumber").editable();
    // $(".editable-form #statusDate").editable({
    //     combodate: {
    //         minYear: 2017,
    //         maxYear: 2027
    //     },
    //     display: function(value) {
    //         $(this).text(value);
    //     }
    // });
    $(".editable-form #birthday").editable();
    $(".editable-form #info").editable();


    // $(".editable-form #status").editable({
    //     source: [
    //         {value: 0, text: 'Новый клиент'},
    //         {value: 1, text: 'Черный список'},
    //         {value: 2, text: 'Перезвонить'},
    //         {value: 3, text: 'Назначено'},
    //         {value: 4, text: 'Подтвержден'},
    //         {value: 5, text: 'Посетивший клиент'},
    //         {value: 6, text: 'Клиент компании'}
    //     ]
    // });


    //ajax mocks
    $.mockjaxSettings.responseTime = 500;

    $.mockjax({
        url: '/post',
        response: function (settings) {
            log(settings, this);
        }
    });

    $.mockjax({
        url: '/error',
        status: 400,
        statusText: 'Bad Request',
        response: function (settings) {
            this.responseText = 'Please input correct value';
            log(settings, this);
        }
    });

    $.mockjax({
        url: '/status',
        status: 500,
        response: function (settings) {
            this.responseText = 'Internal Server Error';
            log(settings, this);
        }
    });

    $.mockjax({
        url: '/statuses',
        response: function (settings) {
            this.responseText = [
                {value: 0, text: 'Новый клиент'},
                {value: 1, text: 'Черный список'},
                {value: 2, text: 'Перезвонить'},
                {value: 3, text: 'Назначено'},
                {value: 4, text: 'Подтвержден'},
                {value: 5, text: 'Посетивший клиент'},
                {value: 6, text: 'Клиент компании'}
            ];
            log(settings, this);
        }
    });

    function log(settings, response) {
        var s = [], str;
        s.push(settings.type.toUpperCase() + ' url = "' + settings.url + '"');
        for (var a in settings.data) {
            if (settings.data[a] && typeof settings.data[a] === 'object') {
                str = [];
                for (var j in settings.data[a]) {
                    str.push(j + ': "' + settings.data[a][j] + '"');
                }
                str = '{ ' + str.join(', ') + ' }';
            } else {
                str = '"' + settings.data[a] + '"';
            }
            s.push(a + ' = ' + str);
        }
        s.push('RESPONSE: status = ' + response.status);

        // name:  'username',  //name of field (column in db)
        // pk:    1            //primary key (record id)
        // value: 'superuser!' //new value

        if (response.responseText) {
            if ($.isArray(response.responseText)) {
                s.push('[');
                $.each(response.responseText, function (i, v) {
                    // s.push('{value: ' + v.value + ', text: "' + v.text + '"}');
                    var resp = {
                        text: v.text,
                        value: v.value,
                        pk: v.value,
                        name: v.text
                    };
                    s.push(JSON.stringify(resp));

                    // s.push('{data-value: ' + v.value + ', text: "' + v.text + '"}');
                });
                s.push(']');
            } else {
                s.push($.trim(response.responseText));
            }
        }
        s.push('--------------------------------------\n');
        $('#console').val(s.join('\n') + $('#console').val());
    }

});
