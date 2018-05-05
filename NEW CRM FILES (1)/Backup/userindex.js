
var USER_INDEX = (function () {
    var server = "10.8.0.1";
    var serverLoc = window.location.hostname;

    var clientsHolder = {};

    function getOperatorSip() {
        var decoded = jwt_decode(localStorage.token);
        var operatorSip = decoded.sip;
        console.log(operatorSip);
        return operatorSip;
    }

    //load clients from server
    function loadClients(operatorId, date) {
        $.ajax({
            type: "GET"
            ,
            dataType: "json"
            ,
            "crossDomain": true
            ,
            "crossOrigin": true
            ,
            // url: "http://" + serverLoc + ":8080/web-service-demo-1.0/operators/" + operatorId + "/clients?dateFrom=" + date + "&dateTo=" + date стара версія (змінено 27.04)
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/operators/"+ operatorId +"/pool?dateFrom=" + date + "&dateTo=" + date
            ,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            ,
            success: addClientsInTable
            ,
            error: errorHandler
        });
    }     //GET for all the clients in the table to send to POOL

    function loadOneClient(operatorId, poolId) {
        console.log("poolId:" + poolId);
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

    function getWaves(date, destination, clientCard) {
        $.ajax({
            type: "GET"
            , dataType: "json"
            , "crossDomain": true
            , "crossOrigin": true
            , url: "http://" + serverLoc + ":8080/web-service-demo-1.0/waves?date=" + date
            //, url: "http://" + serverLoc + ":8080/web-service-demo-1.0/operators/" + operatorId + "/clients/" + clientId
            , headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            , success: function (data) {
                loadVisits(data, date, destination, clientCard);
            }
            , error: errorHandler
        });
    }

    function postVisits(visitForm, clientCard, select) {
        $.ajax({
            type: "POST",
            // dataType: "json",
            // url: "http://" + serverLoc + ":8080/web-service-demo-1.0/clients/" + clientCard.client.id + "/visits",
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/visits",
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            },
            data: visitForm,
            success: function (data,  textStatus, xhr) {

                console.log("SUCCEEEESS");
                console.log(data);
                console.log(textStatus);
                console.log(xhr.getResponseHeader('Location'));


                if(xhr.getResponseHeader('Location') != null){
                    //clientCard.client.visitId = xhr.getResponseHeader('Location').split("/")[5];
                    clientCard.client.visitId = data.id;
                }else{
                    console.log("problem in getting location");
                }

                // table.fnClearTable();
                // table.fnDraw();
                // table.fnDestroy();
                // table.clear().draw(false).destroy();
                $(select).DataTable().clear().destroy();
                callLoadVisits("card", select, clientCard);
                reserve(clientCard)
            },
            error: errorHandler

        });
    }

    // function getVisits(clientIds, handleData) {
    //     var paramURL = $.param({
    //         id: clientIds
    //     });
    //     $.ajax({
    //         type: "GET",
    //         url: "http://" + serverLoc + ":8080/web-service-demo-1.0/visits/clients?" + paramURL,
    //         headers: {
    //             'Content-Type': 'application/json; charset=UTF-8'
    //             , 'token': localStorage.token
    //         },
    //         success: handleData,
    //         error: errorHandler,
    //         dataType: "json",
    //         contentType: "application/json"
    //     });
    // }

    function getVisit(clientId, handleData) {
        return $.ajax({
            type: "GET",
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/clients/" + clientId + "/visits",
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            },
            success: handleData,
            error: errorHandler,
            dataType: "json",
            contentType: "application/json"
        });
    }

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

    function loadVisits(data, date, destination, clientCard) {

        var radioName, visitData;
        var today = new Date();

        var tomorrow = moment().add(1, 'day');
        var theDayAfterTomorrow = moment().add(2, 'day');

        var element;

        if (destination == "card") {
            if (moment(today).date() == moment(date).date()) {
                element = $('#visitsToday');
                radioName = 'today';
            }
            else if (moment(tomorrow).date() == moment(date).date()) {
                element = $('#visitsTomorrow');
                radioName = 'tomorrow';
            }
            else if (moment(theDayAfterTomorrow).date() == moment(date).date()) {
                element = $('#visitsAfterTomorrow');
                radioName = 'theDayAfterTomorrow'
            }
            else {
                console.log('problem with date');
            }

            visitsTable(data, element, radioName, clientCard);


        }
        else if (destination == "userindex") {
            radioName = null;
            if (moment(today).date() == moment(date).date()) {
                element = $('#tabToday');
                $('.date-today').text(moment(today).format("DD/MM/YYYY"));
            }
            else if (moment(tomorrow).date() == moment(date).date()) {
                element = $('#tabTomorrow');
                $('.date-tomorrow').text(moment(tomorrow).format("DD/MM/YYYY"));
            }
            else if (moment(theDayAfterTomorrow).date() == moment(date).date()) {
                element = $('#tabAfterTomorrow');
                $('.date-afterTomorrow').text(moment(theDayAfterTomorrow).format("DD/MM/YYYY"));
            }
            else {
                console.log('problem with date');
            }

            visitsTable(data, element, radioName, clientCard);
        }
        else {
            console.log("wrong destination");
        }
    }  // manipulate data to send to to visitsTable(data, element, radioName)

    function visitsTable(data, element, radioName, clientCard) {
        $(element).DataTable().clear().destroy();
        if (radioName != null) {
            getVisit(clientCard.client.id, function (visitData) {
                var idWave, visitElement, today, tomorrow, afterTomorrow;
                today = new Date();
                tomorrow = moment().add(1, 'day');
                afterTomorrow = moment().add(2, 'day');

                if (visitData != null) {
                    if (moment(visitData.date).date() == moment(today).date()) {
                        visitElement = $('#visitsToday');
                    } else if (moment(visitData.date).date() == moment(tomorrow).date()) {
                        visitElement = $('#visitsTomorrow');
                    } else if (moment(visitData.date).date() == moment(afterTomorrow).date()) {
                        visitElement = $('#visitsAfterTomorrow');
                    } else {
                        console.log("the day on the visit doesnt compare to today tomorrow or after tomorrow");
                    }
                    idWave = visitData.waveId;
                } else {
                    idWave = null;
                }
                element.DataTable({
                    "aaData": data,
                    "bProcessing": false
                    , "bStateSave": false
                    , "ordering": false
                    , "lengthChange": false
                    , "bPaginate": false
                    , 'retrieve': true
                    , 'paging': false
                    , "searching": false
                    , "info": false
                    , "aoColumns": [
                        {
                            'sClass': "text-center",
                            'mData': 'id',
                            'mRender': function (id) {
                                if (idWave == id && element.selector == visitElement.selector) {
                                    return '<label class="check"><input name="' + radioName + '" id="' + id + '" checked="checked" ' + ' type="radio"><span></span></label>'
                                } else {
                                    return '<label class="check"><input name="' + radioName + '" id="' + id + '" type="radio"><span></span></label>'
                                }
                            }

                        },
                        {
                            'sClass': "text-center",
                            'mData': 'hour'
                        },
                        // {
                        //     'sClass': "text-center",
                        //     'mData': 'total'
                        // },
                        {
                            'sClass': "text-center",
                            'mData': 'free',
                            'mRender': function (free, type, full) {

                                var info = full.info;
                                if(info != "" && info != null){
                                    return free + " - (" + info + ")";
                                } else {
                                    return free;
                                }
                            }
                        }

                    ]
                });
            });
        }
        else {
            element.DataTable({
                "aaData": data,
                "bProcessing": false
                , "bStateSave": false
                , "ordering": false
                , "lengthChange": false
                , "bPaginate": false
                , 'retrieve': true
                , 'paging': false
                , "searching": false
                , "info": false
                , "aoColumns": [
                    {
                        'sClass': "text-center",
                        'mData': 'hour'
                    },
                    // {
                    //     'sClass': "text-center",
                    //     'mData': 'total'
                    // },
                    {
                        'sClass': "text-center",
                        'mData': 'free',
                        'mRender': function (free, type, full) {

                            var info = full.info;
                            if(info != "" && info != null){
                                return free + " <i class='fa fa-star-o'  /> " + info  ;
                            } else {
                                return free;
                            }
                        }
                    }
                ]
            });
        }
    }  // creates the table in client card




    function statusModifications(clientCard, value) {
        //hide or show 'X' to  status
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
                if (clientCard.visitDate != null) {
                    parsedDate3 = new Date.parse(moment(clientCard.visitDate).format()).toString('на dd/MM/yyyy  в HH:mm');
                    $(".status-row span").empty().text(parsedDate3);
                    $(".status-row td:nth-child(2)").removeClass().addClass("info");
                } else {
                    console.log("visitData == null");
                }
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
                console.log('setting the span for 2');
                console.log(clientCard.callBackDate);
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

    function callLoadVisits(destination, select, clientCard) {

        if (select == '#visitsToday') {
            getWaves(moment().format("YYYY-MM-DD"), destination, clientCard);
        }
        else if (select == '#visitsTomorrow') {
            getWaves(moment().add(1, 'day').format("YYYY-MM-DD"), destination, clientCard);
        }
        else if (select == '#visitsAfterTomorrow') {
            getWaves(moment().add(2, 'day').format("YYYY-MM-DD"), destination, clientCard);
        }
        else {
            console.log("wrong selection");
        }

    }


    function reserve(clientCard) {


        $('#reserveVisitsToday').unbind('click').click(function () {

            var visitForm = {'date': null, 'waveId': null};
            var visitTime = $('input[name="today"]:checked').closest('td').next().text();
            var select = '#visitsToday';
            var free = $('input[name="today"]:checked').closest('td').next().next().text();
            var value = $('input[name="today"]:checked').attr("id");
            var visitDateTime = moment(moment().format("YYYY-MM-DD") + visitTime, "YYYY-MM-DDHH.mm").format("YYYY-MM-DDTHH:mm:ssZ");

            if (value != null) {
                if (moment(visitDateTime).isAfter(moment().format("YYYY-MM-DDTHH:mm:ssZ")) && free > 0) {
                    visitForm.date = visitDateTime;
                    visitForm.waveId = parseInt(value);
                    clientCard.visitDate = visitDateTime;
                    visitForm = JSON.stringify(visitForm);
                    postVisits(visitForm, clientCard, select);
                } else if(free == 0){
                    alert("На выбраное время нету свободных мест");
                }
                else{
                    alert("Відвідування не може бути назначене на минуле. Виберіть будь ласка іншу годину.");
                }
            } else {
                alert("Час відвідування вибраний неправильно! Будь ласка виберіть дійсну годину.");
            }
            $("#status").editable('setValue', 3);
        });

        $('#reserveVisitsTomorrow').unbind('click').click(function () {

            var visitForm = {'date': null, 'waveId': null};
            var visitTime = $('input[name="tomorrow"]:checked').closest('td').next().text();
            var select = '#visitsTomorrow';
            var free = $('input[name="tomorrow"]:checked').closest('td').next().next().text();
            var value = $('input[name="tomorrow"]:checked').attr("id");
            var visitDateTime = moment(moment().add(1, 'day').format("YYYY-MM-DD") + visitTime, "YYYY-MM-DDHH.mm").format("YYYY-MM-DDTHH:mm:ssZ");

            if (value != null && free > 0) {
                visitForm.date = visitDateTime;
                visitForm.waveId = parseInt(value);
                clientCard.visitDate = visitDateTime;
                visitForm = JSON.stringify(visitForm);
                postVisits(visitForm, clientCard, select);
            } else if(free == 0){
                alert("На выбраное время нету свободных мест");
            }
            else{
                alert("Відвідування не може бути назначене на минуле. Виберіть будь ласка іншу годину.");
            }
            $("#status").editable('setValue', 3);
        });

        $('#reserveVisitsAfterTomorrow').unbind('click').click(function () {

            var visitForm = {'date': null, 'waveId': null};
            var visitTime = $('input[name="theDayAfterTomorrow"]:checked').closest('td').next().text();
            var select = '#visitsAfterTomorrow';
            var free = $('input[name="theDayAfterTomorrow"]:checked').closest('td').next().next().text();
            var value = $('input[name="theDayAfterTomorrow"]:checked').attr("id");
            var visitDateTime = moment(moment().add(2, 'day').format("YYYY-MM-DD") + visitTime, "YYYY-MM-DDHH.mm").format("YYYY-MM-DDTHH:mm:ssZ");
            if (value != null && free > 0) {
                visitForm.date = visitDateTime;
                visitForm.waveId = parseInt(value);
                clientCard.visitDate = visitDateTime;
                visitForm = JSON.stringify(visitForm);
                postVisits(visitForm, clientCard, select);
            } else if(free == 0){
                alert("На выбраное время нету свободных мест");
            }
            else{
                alert("Відвідування не може бути назначене на минуле. Виберіть будь ласка іншу годину.");
            }
            $("#status").editable('setValue', 3);
        });
    }


    function refreshVisits(clientCard) {

        var select;

        $('#refreshVisitsToday').on('click', function () {
            select = '#visitsToday';
            $(select).DataTable().clear().destroy();
            callLoadVisits("card", select, clientCard);
        });

        $('#refreshVisitsTomorrow').on('click', function () {
            select = '#visitsTomorrow';
            $(select).DataTable().clear().destroy();
            callLoadVisits("card", select, clientCard);
        });

        $('#refreshVisitsAfterTomorrow').on('click', function () {
            select = '#visitsAfterTomorrow';
            $(select).DataTable().clear().destroy();
            callLoadVisits("card", select, clientCard);
        });
    }


    function loadClientCard(clientCard) {
        console.log(clientCard);


        var select;

        for (var i = 0; i < 3; i++) {

            if (i == 0) {
                select = "#visitsToday";
            } else if (i == 1) {
                select = "#visitsTomorrow";
            } else if (i == 2) {
                select = "#visitsAfterTomorrow";
            } else {
                console.log("wrong select for callLoadVisits function");
            }

            callLoadVisits("card", select, clientCard);
        }

        reserve(clientCard);
        refreshVisits(clientCard);

        //settings for datetimepicker
        $('#dateTimePicker1').datetimepicker({
            format: "yyyy-mm-dd",
            linkFormat: 'dd-mm-yyyy hh:00',
            language: 'ru',
            startDate: new Date(),
            //endDate: //TODO: set an end date not further than two months,
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
            disabled: false,
            value: clientCard.client.phoneNumber,
            title: 'Введите номер телефона',
            showbuttons: 'false',
            mode: 'inline',
            validate: function (value) {
                if ($.trim(value) == '') {
                    return 'Это обязательное поле';
                }
            },
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
            value: (clientCard.client.number2) == null ? "" : clientCard.client.number2,
            title: 'Введите номер телефона',
            mode: 'inline',
            display: function (value) {

                $(this).text(value);

                if (value == "" || value == null) {
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
            value: (clientCard.client.number3) == null ? "" : clientCard.client.number3, // if value is null it shows the value of the previous client
            title: 'Введите номер телефона',
            showbuttons: 'false',
            mode: 'inline',
            display: function (value) {

                $(this).text(value);

                if (value == "" || value == null) {
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
                else {
                    $(this).text(value);
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
                    {value: 5, text: 'Клиент компании'},
                    {value: 6, text: 'Посетивший клиент'}
                ];

                $(this).text(source[value].text);

                statusModifications(clientCard, value);

                // event at pressing 'x' changes the status to 4 (Обработан)
                $('#deleteStatus').unbind('click').click(function () {
                    tempValue = 4;
                    $("#status").editable('setValue', tempValue);
                });
            }
        });


        var tempDateB;
        if (clientCard.client.birthday == null) {
            tempDateB = null;
        }
        else {
            tempDateB = moment(clientCard.client.birthday);
        }


        // $(".editable-form #statusDate").editable({
        //     pk: 1,
        //     disabled: true,
        //     showbuttons: 'false',
        //     mode: 'inline',
        //     viewformat: "DD/MM/YYYY",
        //     // format: "YYYY-MM-DD hh:mm:ssZ",
        //     combodate: {
        //         minYear: 2017,
        //         maxYear: 2027
        //     },
        //     value: tempDate,
        //     template: "D / MMM / YYYY",
        //     type: 'combodate'
        //     // display: function (value) {
        //     //     console.log(value);
        //     //     var date = formatDate(value);
        //     //     $(this).text(date);
        //     // }
        // });

        $(".editable-form #birthday").editable({
            pk: 1,
            title: 'Введите дату',
            defaultValue: 'Пусто',
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
            mode: 'inline',
            value: clientCard.client.info,
            display: function (value) {
                $(this).text(value);
            }
        });

        $('#clientCard').modal('show');

        $('#submitModal').unbind("click").click(function () {
            var clientCardPost, clientCardPut;
            console.log(clientCard);
            clientCard.client.name = $("#name").editable('getValue').name;
            clientCard.client.phoneNumber = $("#phoneNumber").editable('getValue').phoneNumber;
            clientCard.client.number2 = $("#number2").editable('getValue').number2;
            clientCard.client.number3 = $("#number3").editable('getValue').number3;
            clientCard.client.status = ($("#status").editable('getValue').status == 0) ? 4 : $("#status").editable('getValue').status;
            //clientCard.client.statusDate = $("#statusDate").editable('getValue').statusDate;
            clientCard.client.birthday = $("#birthday").editable('getValue').birthday;
            clientCard.processedDate = moment().format("YYYY-MM-DDTHH:mm:ss.sssZ");
            clientCard.client.dealMade = moment().format("YYYY-MM-DD");
            clientCard.client.info = $("#info").editable('getValue').info;

            // if (clientCard.client.status == 2) {
            //     if (moment(clientCard.callBackDate).date() == moment().date()) {
            //         clientCardPut = jQuery.extend(true, {}, clientCard);
            //         clientCardPut.processedDate = null;
            //         saveModal(clientCardPut); // send PUT
            //         $('#clientCard').modal('hide');
            //     } else {
            //         clientCardPost = jQuery.extend(true, {}, clientCard);
            //         clientCardPost.processedDate = null;
            //         delete clientCardPost["id"];
            //         sendPost(clientCardPost); // send POST
            //         saveModal(clientCard); // send PUT
            //         $('#clientCard').modal('hide');
            //     }
            // } else {
            //     clientCard.callBackDate = moment().format("YYYY-MM-DDTHH:mm:ss.sssZ");
            //     saveModal(clientCard); // send PUT
            //     $('#clientCard').modal('hide');
            // }

            saveModal(clientCard); // send PUT
                $('#clientCard').modal('hide');
        });

        $('#closeModal').unbind('click').on('click', function () {
            if ($("#status").editable('getValue').status == 3 && clientCard.client.status != 3) {
                deleteVisit(clientCard.client.id);
            }
        });


    }  // loads the CLIENT CARD when the button ДЕТАЛИ is clicked

    function deleteVisit(id) {
        $.ajax({
            type: "DELETE",
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/clients/" + id + "/visits",
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            },
            success: function () {
                console.log("success delete");
            },
            error: errorHandler
            // dataType: "json",
            // contentType: "application/json"
        });
    }


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

        if(param == "dateTime" || param == undefined){
            if (date == null) {
                return "дата и время отсутствуют";
            } else {
                return moment(date).format("DD-MM-YYYY в HH:mm") ;
            }
        }

        if(param == "date" || param == undefined){
            if (date == null) {
                return "дата и время отсутствуют";
            } else {
                return moment(date).format("DD-MM-YYYY") ;
            }
        }

        if(param == "time"){
            return moment(date).format("HH:mm") ;
        }

    }

//add clients to the table
    function addClientsInTable(data) {
        clientsHolder = {};


        var dataTable = $('#dataTable2');
        dataTable
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
                                return '<span class=' + "'" + spanClass + "'" + '>' + statusText + '</span>' + '<span class=' + "'" + dateClass + "'" + '>' + dateText + '</span>' ;
                                    // '<span class=' + "'" + dateClass + "'" + '>' + timeText + '</span>';
                            }
                        }
                    }
                    , {
                        "className": "dt-center"
                        , "mData": "client.info"
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
                            return '<button class=' + "'" + btnClass + "'" + ' id=' + "'" + btnId + "'" + '><i class=' + "'" + iClass + "'" + '></i>' + btnText + '</button>';
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

        dataTable
            .unbind('click')
            .on('click', ".btn-details", function () { //зміна щоб на іншій сторінці кнопки були активні
                loadOneClient(getOperatorId(), clientsHolder[this.id].id);
            });

        createVisitsTable();
    }  // creates columns of clients in userindex

    function createVisitsTable() {
        var select;
        for (var i = 0; i < 3; i++) {
            if (i == 0) {
                select = "#visitsToday";
            } else if (i == 1) {
                select = "#visitsTomorrow";
            } else if (i == 2) {
                select = "#visitsAfterTomorrow";
            } else {
                console.log("wrong select for callLoadVisits function");
            }
            callLoadVisits("userindex", select);
        }
    }


//send JSON via PUT
    function sendPut(clientCard) {
        var cardJSON = JSON.stringify(clientCard);
        var operatorId = getOperatorId();
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
                loadClients(getOperatorId(), moment().format("YYYY-MM-DD"));
                console.log("PUT success!");
            }
            ,
            error: errorHandler
        });
    }

    //send JSON via POST
    function sendPost(clientCard) {
        var cardJSON = JSON.stringify(clientCard);
        var operatorId = getOperatorId();
        $.ajax({
            type: "POST"
            ,
            dataType: "json"
            ,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            ,
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/operators/" + operatorId + "/clients/" + clientCard.client.id
            ,
            data: cardJSON
            ,
            success: function () {
                console.log("POST success!");
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
    function getOperatorId() {
        var decoded = jwt_decode(localStorage.token);
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
        loadClients(getOperatorId(), moment().format("YYYY-MM-DD"));
        //setEditable();
        logOut();

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
})
();
$(USER_INDEX.init);

//setEditable отключено