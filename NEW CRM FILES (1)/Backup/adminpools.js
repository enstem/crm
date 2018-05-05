//TODO - make all call buttons available to call
var USER_INDEX = (function () {
    'use strict';

    var serverLoc = window.location.hostname;
    var clientsHolder = {};

    function getOperatorSip() {
        var decoded = jwt_decode(localStorage.token);
        var operatorSip = decoded.sip;
        console.log(operatorSip);
        return operatorSip;
    }

    //load clients from server
    function loadClients(operatorId, dateFrom, dateTo) {
        $.ajax({
            type: "GET"
            ,
            dataType: "json"
            ,
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/operators/" + operatorId + "/pool?dateFrom=" + dateFrom + "&dateTo=" + dateTo
            ,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            ,
            success: function (data) {
                localStorage.idOperator = operatorId;
                localStorage.fromDate = dateFrom;
                localStorage.toDate = dateTo;
                addClientsInTable(data);
            }
            ,
            error: errorHandler
        });
    }     //GET for all the clients in the table to send to POOL

    function loadOneClient(operatorId, poolId) {
        $.ajax({
            type: "GET"
            , dataType: "json"
            , "crossDomain": true
            , "crossOrigin": true
            , url: "http://" + serverLoc + ":8080/web-service-demo-1.0/pool/" + poolId
            , headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            , success: loadClientCard
            , error: errorHandler
        });
    } //GET for one client to send to CLIENT CARD

    function loadOperators(handleSuccess) {
        $.ajax({
            type: "GET"
            , dataType: "json"
            , "crossDomain": true
            , "crossOrigin": true
            , url: " http://" + serverLoc + ":8080/web-service-demo-1.0/users"
            , headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            , success: handleSuccess
            , error: errorHandler
        });
    } //GET for one client to send to CLIENT CARD

    function errorHandler(jqXhr, textStatus, errorThrown) {
        var errorMessage = "";

        if (jqXhr.status === 0) {
            errorMessage = "Не удалось подключится к веб сервису";
        } else if (jqXhr.status == 400) {
            errorMessage = jqXhr.responseJSON + "Неправильный запрос";
        } else if (jqXhr.status == 404) {
            errorMessage = jqXhr.responseJSON + 'Requested page not found. [404]';
        } else if (jqXhr.status == 401) {
            localStorage.removeItem("token");
            window.location.href = "login.html";
        } else if (jqXhr.status == 500) {
            errorMessage = jqXhr.responseJSON + 'Internal Server Error [500]';
        } else if (textStatus === 'parsererror') {
            errorMessage = 'Requested JSON parse failed.';
        } else if (textStatus === 'timeout') {
            errorMessage = 'Time out error.';
        } else if (textStatus === 'abort') {
            errorMessage = 'Ajax request aborted.';
        } else {
            errorMessage = jqXhr.responseJSON + 'Unexpected error: ' + jqXhr.responseText;
        }
        console.log(errorMessage);
    }

    function statusModifications(clientCard, value) {
        //hide or show 'X' to delete status
        if (value == 4 || value == 0) {
            $('#deleteStatus').hide();
        }
        else {
            $('#deleteStatus').show();
        }

        //hide or show button for block list
        if (value == 1) {
            $('#btnBlockList').hide();
            $(".status-row td:nth-child(2)").removeClass().addClass("danger");
        }
        else {
            $('#btnBlockList').show();
        }

        if (value == 0) {
            $(".status-row td:nth-child(2)").removeClass().addClass("active");
        }

        if (value == 3) {
            var parsedDate3;
            console.log('setting the span for 3');
            console.log(clientCard.callBackDate);
            var adate3 = moment(clientCard.visitDate).format();
            if (clientCard.visitDate == null) {
                parsedDate3 = "";
            } else {
                parsedDate3 = new Date.parse(adate3).toString('на dd/MM/yyyy  в HH:mm');
            }
            $(".status-row span").empty().text(parsedDate3);
            $(".status-row td:nth-child(2)").removeClass().addClass("info");
        }

        if (value == 4) {
            $(".status-row td:nth-child(2)").removeClass().addClass("success");
        }

        // set status the view of statusDate for callback
        if (value == 2) {
            var parsedDate2;

            $('#btnCallBack').html('<i class="fa fa-calendar"></i>Сменить дату');

            if (clientCard.callBackDate == null) {
                parsedDate2 = 'дата и время не назначены'
            } else {
                var adate2 = moment(clientCard.callBackDate).format();
                parsedDate2 = new Date.parse(adate2).toString('dd/MM/yyyy  в HH:mm');
            }
            $(".status-row span").empty().text(parsedDate2);
            $(".status-row td:nth-child(2)").removeClass().addClass("warning");
        }
        else {
            $('#btnCallBack').html('<i class="fa fa-calendar"></i>Перезвонить');
            if (value != 3) {
                $(".status-row span").empty();
            }
        }
    }

    function loadClientCard(clientCard) {

        //settings for datetimepicker
        $('#dateTimePicker1').datetimepicker({
            format: "yyyy-mm-dd",
            linkFormat: 'dd-mm-yyyy hh:00',
            language: 'ru',
            pickerPosition: 'bottom-left',
            weekStart: 1,
            todayBtn: 1,
            autoclose: 1,
            todayHighlight: 1,
            startView: 2,
            forceParse: 0,
            minView: 1,
            maxView: 2,
            minuteStep: 0
        });

        //submitting the modal to block list change the status as well
        $('#submitBlockList').unbind('click').click(function () {
            $("#status").editable('setValue', 1);
        });

        //submitting the callback
        $('#submitCallBack').unbind('click').click(function () {
            var callBackDate = $('#dateCallBack').val();
            //clientCard.statusDate = new Date(callBackDate).toISOString();
            clientCard.callBackDate = moment(callBackDate, "DD-MM-YYYY hh:mm").format("YYYY-MM-DDTHH:mm:ss.sssZ");
            console.log("setting the callback");
            console.log(clientCard.callBackDate);
            $("#status").editable('setValue', 2);
        });


        $(".editable-form #name").editable("destroy").empty();
        $(".editable-form #phoneNumber").editable("destroy");
        // $(".editable-form #statusDate").editable("destroy").empty();
        $(".editable-form #status").editable("destroy").empty();
        $(".editable-form #birthday").editable("destroy").empty();
        $(".editable-form #number2").editable("destroy");
        $(".editable-form #number3").editable("destroy");
        $(".editable-form #recommender").editable("destroy").empty();
        $(".editable-form #info").editable("destroy").empty();

        $(".editable-form #name").editable({
            type: 'text',
            inputclass: "input-name-class ",
            pk: 1,
            disabled: true,
            value: clientCard.client.name,
            title: 'Введите имя клиента',
            mode: 'inline',
            validate: function (value) {
                if ($.trim(value) == '') {
                    return 'Это обязательное поле';
                }
            }
        });

        $(".editable-form #phoneNumber").editable({
            type: 'text',
            pk: 1,
            disabled: true,
            value: clientCard.client.phoneNumber,
            title: 'Введите номер телефона',
            showbuttons: 'false',
            mode: 'inline',
            display: function (value) {
                $(this).text(value);
                $('#btnPhoneNum').unbind('click').click(function () {
                    callAsterisk(value);
                });
            }
        });

        $(".editable-form #number2").editable({
            type: 'text',
            pk: 1,
            disabled: true,
            value: clientCard.client.number2,
            title: 'Введите номер телефона',
            mode: 'inline',
            display: function (value) {

                $(this).text(value);

                if (value == "") {
                    $('#btnNum2').hide();
                }
                else {
                    $('#btnNum2').show();
                }

                $('#btnNum2').unbind('click').click(function () {
                    console.log(value);
                    callAsterisk(value);
                });
            }
        });

        $(".editable-form #number3").editable({
            type: 'text',
            pk: 1,
            disabled: true,
            value: clientCard.client.number3,
            title: 'Введите номер телефона',
            showbuttons: 'false',
            mode: 'inline',
            display: function (value) {

                $(this).text(value);

                if (value == "") {
                    $('#btnNum3').hide();
                }
                else {
                    $('#btnNum3').show();
                }

                $('#btnNum3').unbind('click').click(function () {
                    callAsterisk(value);
                });
            }
        });

        $(".editable-form #recommender").editable({
            type: 'text',
            pk: 1,
            disabled: true,
            value: clientCard.client.recommender,
            display: function (value) {
                if (value == "") {
                    $(this).text("Неизвестен");
                }
            }
        });

        $(".editable-form #status").editable({
            pk: 1,
            disabled: true,
            value: clientCard.client.status,
            display: function (value, source) {
                var tempValue;
                source = [
                    {value: 0, text: 'Новый клиент'},
                    {value: 1, text: 'Блок лист'},
                    {value: 2, text: 'Перезвонить'},
                    {value: 3, text: 'Назначено'},
                    {value: 4, text: 'Обработан'},
                    {value: 5, text: 'Посетивший клиент'},
                    {value: 6, text: 'Клиент компании'}
                ];

                $(this).text(source[value].text);

                statusModifications(clientCard, value);
            }
        });


        var tempDateB;
        if (clientCard.client.birthday == null) {
            tempDateB = '1900-01-01T20:00:00+02:00';
        }
        else {
            tempDateB = moment(clientCard.client.birthday).utc();
        }


        $(".editable-form #birthday").editable({
            pk: 1,
            title: 'Введите дату',
            disabled: true,
            mode: 'inline',
            viewformat: "DD/MM/YYYY",
            value: tempDateB,
            // display: function (value) {
            //     //console.log(value);
            //     var date = formatDate(value);
            //     $(this).text(date);
            // },
            combodate: {
                minYear: 1910,
                maxYear: 2016
            },
            template: "D / MMM / YYYY",
            type: "combodate"
        });


        $(".editable-form #info").editable({
            type: 'textarea',
            placeholder: "Ваш комментарий...",
            pk: 1,
            disabled: true,
            mode: 'inline',
            value: clientCard.client.info,
            display: function (value) {
                $(this).text(value);
            }
        });

        $('#clientCard').modal('show');

        $('#submitModal').unbind("click").click(function () {
            console.log(clientCard);
            clientCard.client.name = $("#name").editable('getValue').name;
            clientCard.client.phoneNumber = $("#phoneNumber").editable('getValue').phoneNumber;
            clientCard.client.number2 = $("#number2").editable('getValue').number2;
            clientCard.client.number3 = $("#number3").editable('getValue').number3;
            clientCard.client.status = $("#status").editable('getValue').status;
            //clientCard.client.statusDate = $("#statusDate").editable('getValue').statusDate;
            clientCard.client.birthday = $("#birthday").editable('getValue').birthday;
            clientCard.client.dealMade = moment().format();
            clientCard.client.info = $("#info").editable('getValue').info;

            saveModal(clientCard);
            $('#clientCard').modal('hide');
        });


        //TODO: вынести

        // Функция для удаления при закрітии карточки
        // $('#clientCard').unbind('hidden.bs.modal').on('hidden.bs.modal', function () {
        //     if ($("#status").editable('getValue').status == 3) {
        //         deleteVisit(clientCard.client.id);
        //     }
        //     //TODO: unbind
        // });


    }  // loads the CLIENT CARD when the button ДЕТАЛИ is clicked


//serialize object
    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            }
            else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };

    function formatDate(date, param) {

        if (param == "dateTime") {
            if (date == null) {
                return "дата и время отсутствуют";
            } else {
                return moment(date).format("DD-MM-YYYY в HH:mm");
            }
        }

        if (param == "date" || param == undefined) {
            if (date == null) {
                return "дата и время отсутствуют";
            } else {
                return moment(date).format("DD-MM-YYYY");
            }
        }

        if (param == "time") {
            return moment(date).format("HH:mm");
        }

    }

//add clients to the table
    function addClientsInTable(data) {
        clientsHolder = {};

        var dataTable2 = $('#dataTable2');

        dataTable2
            .DataTable({
                "bProcessing": true
                , "bStateSave": true
                , "ordering": false
                , "lengthChange": true
                , "searching": true
                , "info": true
                , "aaData": data
                , "aoColumns": [
                    {
                        "mData": "client.name"
                    }
                    , {
                        "className": "dt-center"
                        , "mData": "client.phoneNumber"
                    }
                    , {
                        "className": "dt-center"
                        , "mData": "client.status"
                        , "mRender": function (status, type, full) {
                            var statusText, spanClass, dateText, timeText, dateClass;
                            //сюда надо вставить Case по значению status
                            if (status == 0) {
                                statusText = 'Новый клиент';
                                spanClass = ' label label-info';
                            }
                            else if (status == 1) {
                                statusText = 'Блок лист';
                                spanClass = ' label label-danger';
                            }
                            else if (status == 2) {
                                statusText = 'Перезвонить';
                                spanClass = ' label label-warning';
                                dateText = formatDate(full.callBackDate, 'dateTime');
                                // timeText = formatDate(full.callBackDate, "time");
                                dateClass = "label label-warning";
                            }
                            else if (status == 3) {
                                statusText = 'Назначено';
                                spanClass = ' label label-primary';
                                dateText = formatDate(full.visitDate, 'dateTime');
                                // timeText = formatDate(full.visitDate, "time");
                                dateClass = "label label-primary";
                            }
                            else if (status == 4) {
                                statusText = 'Обработан';
                                spanClass = ' label label-success';
                            }
                            else if (status == 5) {
                                statusText = '<i class="fa fa-star"></i> Клиент компании';
                                spanClass = ' label label-default';
                            }
                            else if (status == 6) {
                                statusText = '<i class="fa fa-check"></i> Посетивший клиент';
                                spanClass = ' label label-success';
                            }
                            else if (status == null) {
                                console.log("status null");
                            } else {
                                console.log("there is not such a status");
                            }
                            if (dateText == null) {
                                return '<span class=' + "'" + spanClass + "'" + '>' + statusText + '</span>';
                            }
                            else {
                                return '<span class=' + "'" + spanClass + "'" + '>' + statusText + '</span>' + '<span class=' + "'" + dateClass + "'" + '>' + dateText + '</span>';
                                // '<span class=' + "'" + dateClass + "'" + '>' + timeText + '</span>';
                            }
                        }
                    }
                    , {
                        "className": "dt-center"
                        , "mData": "client.info"
                    }
                    ,
                    {
                        "className": "dt-center"
                        , "mData": "processedDate"
                        , "mRender": function (processedDate) {
                        if (processedDate == null) {
                            return "нет";
                        }
                        else {
                            return formatDate(processedDate, "date");
                        }

                    }
                    }
                    , {
                        "className": "dt-center"
                        , "mRender": function (data, type, full) {
                            if (full.processedDate != null) {
                                return '<i id="fa_ok" class="fa fa-check text-success fa-2x" aria-hidden="true"></i>';
                            }
                            else {
                                return '<i id="fa_ok" class="fa fa-times text-danger fa-2x" aria-hidden="true"></i>';
                            }
                        }
                    }
                    , {
                        "className": "dt-center"
                        , "mData": "client.dealMade"
                        , "mRender": function (dealMade, type, full) {
                            //если значение dealMade = Null пишем значение нет
                            if (dealMade == null) {
                                return "нет";
                            }
                            else {
                                return formatDate(dealMade, "date");
                            }
                        }
                    }
                    , {
                        "className": "dt-center"
                        , "mRender": function (data, type, full) {
                            var btnClass = 'btn btn-info-outline btn-details';
                            var btnText = 'Детали';
                            var iClass = 'fa fa-eye';
                            var btnId = "#call" + full.id;

                            clientsHolder[btnId] = full;
                            return '<button class=' + "'" + btnClass + "'" + ' id=' + "'" + btnId + "'" + '><i class=' + "'" + iClass + "'" + '></i> ' + btnText + '</button>';
                        }
                    }]
                , "language": {
                    "processing": "Подождите..."
                    , "search": "Поиск:"
                    , "lengthMenu": "Показать _MENU_ записей"
                    , "info": "Записи с _START_ до _END_ из _TOTAL_ записей"
                    , "infoEmpty": "Записи с 0 до 0 из 0 записей"
                    , "infoFiltered": "(отфильтровано из _MAX_ записей)"
                    , "infoPostFix": ""
                    , "loadingRecords": "Загрузка записей..."
                    , "zeroRecords": "Записи отсутствуют."
                    , "emptyTable": "В таблице отсутствуют данные"
                    , "paginate": {
                        "first": "Первая"
                        , "previous": "Предыдущая"
                        , "next": "Следующая"
                        , "last": "Последняя"
                    }
                    , "aria": {
                        "sortAscending": ": активировать для сортировки столбца по возрастанию"
                        , "sortDescending": ": активировать для сортировки столбца по убыванию"
                    }
                }
            });

        dataTable2
            .unbind('click')
            .on('click', ".btn-details", function () { //зміна щоб на іншій сторінці кнопки були активні
                loadOneClient(localStorage.idOperator, clientsHolder[this.id].id);
            });
    }  // creates columns of clients in userindex


//send JSON via PUT
    function sendPut(clientCard) {
        var cardJSON = JSON.stringify(clientCard);
        var operatorId = getUserId();
        $.ajax({
            type: "PUT"
            ,
            dataType: "json"
            ,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            ,
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/pool/" + clientCard.id
            ,
            data: cardJSON
            ,
            success: function () {
                var table = $('#dataTable2').DataTable();

                table.clear().destroy();
                loadClients(localStorage.idOperator, localStorage.fromDate, localStorage.toDate);
                console.log("PUT succes!");
            }
            ,
            error: errorHandler
        });
    }

//make the call to asterisk
    function callAsterisk(phoneNumber) {
        var url = createChanelURL(phoneNumber);
        $.post(url, function (data) {
            console.log(data); //TODO: обрабатывать ответ
        }).done(function () {
            console.log("second success");
        }).fail(function () {
            console.log("error");
        });
    }

//create the url channel
    function createChanelURL(telephoneNumber) {
        var operatorSip = getOperatorSip();
        var url = 'http://' + serverLoc + ':8088/ari/channels?endpoint=SIP%2F' + operatorSip + '&extension=' + telephoneNumber + '&context=from-internal&priority=1&timeout=30&api_key=test:test';
        return url;
    }

//get the operator ID from token
    function getUserId() {
        var decoded = jwt_decode(localStorage.token);
        console.log(decoded);
        $('#user_toggle').text(decoded.name);
        var operatorId = decoded.id;
        return operatorId;
    }

//set editable
    function setEditable() {
        $.fn.editable.defaults.mode = 'inline';
    }

    function saveModal(clientCard) {
        sendPut(clientCard);
    }

//main function
    function init() {
        populate();
        //setEditable();
        logOut();
        dateRange();
        filterTable();
    }

    function populate() {
        loadOperators(function (data) {
            $.each(data, function (key, value) {
                if (value.isAdmin == false) {
                    $('#operators').append('<option value=' + value.id + '>' + value.name + '</option>');
                }
            });
            var decoded = jwt_decode(localStorage.token);
            $('#user_toggle').text(decoded.name);
            var today = moment().format("YYYY-MM-DD");
            $("#dateRange").attr("placeholder", moment(today).format("DD-MM-YYYY"));
            var firstOperatorId = $('#operators option').first().val();
            loadClients(firstOperatorId, today, today);
        })
    }

    function filterTable() {
        $("#createPool").unbind("click").on('click', function () {
            var dateFrom, dateTo;
            var idOperator = parseInt($("#operators").val());
            var rangeDates = $("#dateRange").val();
            if (rangeDates == "") {
                dateFrom = moment().format("YYYY-MM-DD");
                dateTo = moment().format("YYYY-MM-DD");
            } else {
                dateFrom = moment(rangeDates.substring(0, 10), "DD/MM/YYYY").format("YYYY-MM-DD");
                dateTo = moment(rangeDates.substring(13, 23), "DD/MM/YYYY").format("YYYY-MM-DD");
            }

            $("#dataTable2").DataTable().clear().destroy();
            loadClients(idOperator, dateFrom, dateTo);
        })
    }

    function dateRange() {
        $(".date-range").daterangepicker({
            opens: "left",
            showDropDowns: true,
            singleDatePicker: true,
            format: "dd/MM/yyyy",
            separator: " — ",
            startDate: Date.today(),
            endDate: Date.today().add({
                days: 1
            }),
            minDate: "01/01/2012",
            maxDate: "31/12/2025"
        });
    }

//logOut the user
    function logOut() {
        $('#log_out').click(function () {
            localStorage.removeItem("token");
        });
    }

    return {
        init: init
    }
})();
$(USER_INDEX.init);


//setEditable отключено