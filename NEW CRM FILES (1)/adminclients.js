/**
 * Created by Shmidt on 02.02.2017.
 */
var ADMIN_INDEX = (function () {

    'use strict';

    var server = "10.8.0.1";
    var serverLoc = window.location.hostname;
    var totalToPut = {};
    var clientsHolder = {};
    var showNumber = "1000";
    var pageIndex = "1";
    var filterData2 = "";
    var filterData = "";

    //main function
    function init() {
        testClick();
        setUserName();
        showTotal();
        SetRange();
        logOut();
        createClient();
        ApplyFilters();
        ChangePage();
        clickUpload();
        getClients();
        populate();
        editClient();
    }

    function testClick() {
        $(".fileupload").click( function () {
            console.log("clicked");
        })
    }

    function getTotal(handleSuccess) {
        var newfilterData = "";
        var newfilterData2 = "";
        if (filterData != "") {
        newfilterData=filterData.replace("&","?");
        }
        if (filterData2 != "") {
        newfilterData2=filterData2.replace("&","?");
        }
        $.ajax({
            type: "GET"
            , dataType: "json"
            , "crossDomain": true
            , "crossOrigin": true
            , url: " http://" + serverLoc + ":8080/web-service-demo-1.0/clients/search/total" + newfilterData + newfilterData2
            , headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            , success: handleSuccess
            , error: errorHandler
        });
    }


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

    function getClients() {
        $.ajax({
            type: "GET"
            , dataType: "json"
            , url: "http://" + serverLoc + ":8080/web-service-demo-1.0/clients/search?page=" + pageIndex + "&entries=" + showNumber + filterData + filterData2
                   , headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            , success: loadClients
            , error: errorHandler
        });
    }     //GET for all the clients in the table to send to POOL

    function loadOneClient(operatorId, clientId) {
        $.ajax({
            type: "GET"
            , dataType: "json"
            , "crossDomain": true
            , "crossOrigin": true
            , url: "http://" + serverLoc + ":8080/web-service-demo-1.0/clients/" + clientId
            , headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            , success: loadClientCard
            , error: errorHandler
        });
    } //GET for one client to send to CLIENT CARD

    function editClients(clientIds, data, handleData) {
        var paramURL = $.param({
            id: clientIds
        });
        $.ajax({
            type: "PUT",
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/clients?" + paramURL,
            data: data,
            headers: {
                'Content-Type': 'application/json'
                , 'token': localStorage.token
            },
            success: handleData,
            error: errorHandler
        });
    }

    function deleteClient(clientIds, handleData) {
        var paramURL = $.param({
            id: clientIds
        });
        $.ajax({
            type: "DELETE",
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/clients?" + paramURL,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            },
            success: handleData,
            error: errorHandler
            // dataType: "json",
            // contentType: "application/json"
        });
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

        // $('#dateTimePicker1').datetimepicker({
        //     format: "yyyy-mm-dd",
        //     linkFormat: 'dd-mm-yyyy hh:00',
        //     language: 'ru',
        //     pickerPosition: 'bottom-left',
        //     weekStart: 1,
        //     todayBtn: 1,
        //     autoclose: 1,
        //     todayHighlight: 1,
        //     startView: 2,
        //     forceParse: 0,
        //     minView: 1,
        //     maxView: 2,
        //     minuteStep: 0
        // });
        //
        // //submitting the modal to block list change the status as well
        // $('#submitBlockList').unbind('click').click(function () {
        //     $("#status").editable('setValue', 1);
        // });
        //
        // //submitting the callback
        // $('#submitCallBack').unbind('click').click(function () {
        //     var callBackDate = $('#dateCallBack').val();
        //     //clientCard.statusDate = new Date(callBackDate).toISOString();
        //     clientCard.callBackDate = moment(callBackDate, "DD-MM-YYYY hh:mm").format("YYYY-MM-DDTHH:mm:ss.sssZ");
        //     console.log("setting the callback");
        //     console.log(clientCard.callBackDate);
        //     $("#status").editable('setValue', 2);
        // });


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
            value: clientCard.name,
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
            value: clientCard.phoneNumber,
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
            value: clientCard.number2,
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
            value: clientCard.number3,
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
            value: clientCard.recommender,
            display: function (value) {
                if (value == "") {
                    $(this).text("Неизвестен");
                }
                else{
                    $(this).text(value);
                }
            }
        });

        $(".editable-form #status").editable({
            pk: 1,
            disabled: true,
            value: clientCard.status,
            display: function (value, source) {
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
                // $('#deleteStatus').unbind('click').click(function () {
                //     tempValue = 4;
                //     $("#status").editable('setValue', tempValue);
                // });
            }
        });


        var tempDateB;
        if (clientCard.birthday == null) {
            tempDateB = null;
        }
        else {
            tempDateB = moment(clientCard.birthday);
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
            value: clientCard.info,
            display: function (value) {
                $(this).text(value);
            }
        });

        $('#clientCard').modal('show');


    }  // loads the CLIENT CARD when the button ДЕТАЛИ is clicked


    function createClient() {
        $('#submitModal').unbind("click").click(function () {
            var formData = {
                name: null,
                phoneNumber: null,
                number2: null,
                number3: null,
                reservedById: null,
                birthday: null
            };
            //TODO: add check value
            var valName, valPhoneNumber, valNumber2, valNumber3, valReservedBy, birthday;
            valName = $("#clientName").val();
            valPhoneNumber = $("#numberMain").val();
            valNumber2 = $("#numberTwo").val();
            valNumber3 = $("#numberThree").val();
            valReservedBy = parseInt($("#operators").val());
            birthday = $("#birthdayNew").editable('getValue').birthdayNew;

            if (valName != "") {
                formData.name = valName;
            }
            if (valPhoneNumber != "") {
                formData.phoneNumber = valPhoneNumber;
            }
            if (valNumber2 != "") {
                formData.number2 = valNumber2;
            }
            if (valNumber3 != "") {
                formData.number3 = valNumber3;
            }
            if (valReservedBy = "") {
                formData.reservedById = valReservedBy;
            }
            if (birthday != undefined) {
                formData.birthday = moment(birthday, "DD-MM-YYYY").format("YYYY-MM-DD");
            }
            formData = JSON.stringify(formData);
            addNewClient(formData);

        });
    }

    function ApplyFilters() {
        $('#submitFilter').unbind("click").click(function () {
            var filterstat = parseInt($("#filterstatus").val());
            filterData2 = "&filter[status]=" + filterstat;
            if (filterstat == 8) {
             filterData2 = "";
            }   
            var reservedBy = parseInt($("#filteroper").val());
            filterData = "&filter[reservedById]=" + reservedBy;
            if (reservedBy == 0) {
             filterData = "";
            }   
            console.log(filterData)
            showNumber = $("#clientsNumber").val();
            $( ".slider-increments" ).slider( "value", 1 );
            $(".slider-increments-amount").html($(".slider-increments").slider("value"));
            pageIndex = 1;
                $('#dataTable3').DataTable().clear().destroy();
                $('#addFilter').modal('toggle');
                $('#rowDataTable').fadeOut();
                $('#loadSpinner').fadeIn();
                SetRange();
                getClients();
        });
    }

    function ChangePage() {
        $('#changePagebtn').unbind("click").click(function () {
            pageIndex = $( ".slider-increments" ).slider( "option", "value" );
                $('#dataTable3').DataTable().clear().destroy();
                $('#rowDataTable').fadeOut();
                $('#loadSpinner').fadeIn();
                getClients();
        });
    }

    function SetRange() {
              getTotal(function (data) {
            $.each(data, function (key, value) {
                    var valmax = (Math.floor(value/showNumber)) + 1;
        $(".slider-increments").slider({
      range: "min",
      max: valmax,
      min: 1,
      value: 1,
      step: 1,
      slide: function(event, ui) {
        return $(".slider-increments-amount").html(ui.value);
      }
    });
    showfilteredTotal();
    $(".slider-increments-amount").html($(".slider-increments").slider("value"));
                });
            });

    }

    function addNewClient(formData) {
        $.ajax({
            type: "POST",
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/clients",
            data: formData,
            headers: {
                'Content-Type': 'application/json'
                , 'token': localStorage.token
            },
            success: function (data) {
                console.log(data);
                $('#dataTable3').DataTable().clear().destroy();
                $('#addClient').modal('toggle');
                $('#rowDataTable').fadeOut();
                $('#loadSpinner').fadeIn();
                getClients();
            },
            error: errorHandler,
            //dataType: "json",
            contentType: "application/json"
        });
    }

    function loadClients(data) {

        var clientsHolderInfo = {};
        var clientsHolderDelete = {};
        clearDataTableFilters();


        var dataTable3 = $('#dataTable3');

        dataTable3.DataTable({
            'fnCreatedRow': function (nRow, aData, iDataIndex) {
                $(nRow).attr('id', 'my' + iDataIndex); // or whatever you choose to set as the id of row
            },
            "bProcessing": true
            , "bStateSave": true
            , "ordering": false
            , "lengthChange": true
            , "searching": false
            , "info": true
            , "aaData": data
            , "aoColumns": [

                {
                    "mRender": function (status, type, full) {
                        return '<label><input class="check-column" name="optionRadio" type="checkbox"><span></span></label>';
                    }
                }
                ,
                {
                    "mData": "name"
                }
                , {
                    "mData": "phoneNumber"
                }
                , {
                    "mData": "birthday",
                    "mRender": function (birthday, type, full) {
                        if (birthday == null) {
                            return "пусто"
                        }
                        else {
                            return formatDate(birthday);
                        }
                    }
                }
                , {
                    "className": "dt-center",
                    "mData": "dealEntry",
                    "mRender": function (dealEntry, type, full) {
                        if (dealEntry == null) {
                            return "пусто"
                        }
                        else {
                            return formatDate(dealEntry);
                        }
                    }
                }
                , {
                    "mData": "status"
                    , "mRender": function (status, type, full) {
                        var statusText, spanClass;
                        //сюда надо вставить Case по значению status
                        if (status == 0) {
                            statusText = 'Новый клиент';
                            spanClass = 'label label-info';
                        }
                        else if (status == 1) {
                            statusText = 'Блок лист';
                            spanClass = 'label label-danger';
                        }
                        else if (status == 2) {
                            statusText = 'Перезвонить';
                            spanClass = 'label label-warning';
                        }
                        else if (status == 3) {
                            statusText = 'Назначено';
                            spanClass = 'label label-primary';
                        }
                        else if (status == 4) {
                            statusText = 'Обработан';
                            spanClass = 'label label-success';
                        }
                        else if (status == 5) {
                            statusText = 'Клиент компании';
                            spanClass = ' label label-success';
                        }
                        else if (status == 6) {
                            statusText = 'Посетивший клиент';
                            spanClass = ' label label-success';
                        }
                        else if (status == 7) {
                            statusText = 'Распределить';
                            spanClass = ' label label-warning';
                        }
                        else if (status == null) {
                            console.log("status null");
                        } else {
                            console.log("there is not such a status");
                        }
                        return '<span class=' + "'" + spanClass + "'" + '>' + statusText + '</span>';
                    }
                }
                , {
                    "className": "dt-center",
                    "mRender": function (data, type, full, meta) {
                        if (full.status == 2 && full.callBackDate != null) {
                            return moment(full.callBackDate).format("DD-MM-YYYY");
                        } else if (full.status == 3 && full.visitDate != null) {
                            return moment(full.visitDate).format("DD-MM-YYYY");
                        } else {
                            return "пусто";
                        }
                    }
                }
                , {
                    "mData": "reservedByName"
                }
                , {
                    "className": "dt-center",
                    "mRender": function (data, type, full, meta) {
                        var idInfo, idDelete;
                        idInfo = "info" + full.id;
                        idDelete = "delete" + full.id;

                        clientsHolder["my" + meta.row] = full;
                        clientsHolderInfo[idInfo] = full;
                        clientsHolderDelete[idDelete] = full;
                        return '<div class="action-buttons">' +
                            '<a class="table-actions btn-information" id="' + idInfo + '" data-toggle="modal" data-target="#clientCard"><i class="fa fa-eye"></i></a>' +
                            '<a class="table-actions btn-delete" id="' + idDelete + '" ><i class="fa fa-trash-o"></i></a>' +
                            '</div>';
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
            , "initComplete": function () {
                this.api().columns([3, 4, 5, 6, 7]).every(function () {

                    var column = this;

                    var select = $('<select><option value=""></option></select>')
                        .appendTo($(column.footer()).empty())
                        .on('change', function () {
                            var val = $.fn.dataTable.util.escapeRegex(
                                $(this).val()
                            );

                            column
                                .search(val ? '^' + val + '$' : '', true, false)
                                .draw();
                        });

                    column.cells('', column[0]).render('display').sort().unique().each(function (d, j) {
                        if (column.index() == 5) {
                            select.append('<option value="' + $(d).html() + '">' + $(d).html() + '</option>')
                        } else {
                            select.append('<option value="' + d + '">' + d + '</option>')
                        }

                    });
                });
            }
        });
        $('#loadSpinner').fadeOut();
        $('#rowDataTable').fadeIn();

        dataTable3
            .on('click', ".btn-information", function () {
                loadOneClient(clientsHolderInfo[this.id].reservedById, clientsHolderInfo[this.id].id);
            });

        dataTable3
            .on('click', ".btn-delete", function () {  //TODO:  a modal window to assure deleting of the client
                var clientIds = [];
                clientIds.push(clientsHolderDelete[this.id].id);
                $(this).closest('tr').addClass('selected');
                deleteClient(clientIds, function () {
                    console.log("success delete");

                    dataTable3.DataTable().row('.selected').remove().draw(false);
                    // getClients();

                });
            });

        $('input[type=checkbox]')
            .on('click', function () {
                var checkBoxes = $('input[name="optionRadio"]');
                var checked = $('input[name="optionRadio"]:checkbox:checked');
                if (checked.is(':checked')) {
                    $("#optionSelected").show();

                    $.each(checked, function (key, value) {
                        $(value).closest('tr').addClass('selected');
                    });

                } else {
                    $("#optionSelected").fadeOut(400);
                    $.each(checkBoxes, function (key, value) {
                        if ($(value).closest('tr').hasClass("selected")) {
                            $(value).closest('tr').removeClass("selected");
                        }
                    });

                }
            });

        $(".editable-form #birthdayNew").editable({
            pk: 1,
            title: 'Введите дату',
            // disabled: true,
            mode: 'inline',
            viewformat: "DD/MM/YYYY",
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


        $("#delete_selected").unbind("click").on('click', function () {
            var values = $('input[name="optionRadio"]:checkbox:checked').map(function (key, value) {
                return clientsHolder[value.closest('tr').id].id;
            }).get();
            deleteClient(values, function () {
                console.log("success delete");

                $("#dataTable3").DataTable().rows('.selected').remove().draw(false);
                $("#checkAll").prop("checked", false);
            });

        });

        $("#resetStatus_selected").unbind("click").on('click', function () {
            var clientsSelected = $('input[name="optionRadio"]:checkbox:checked').map(function (key, value) {
                return clientsHolder[value.closest('tr').id].id;
            }).get();

            var form = {};
            form.reservedById = null;
            form.dealMade = null;
            form.status = 0;
            form.info = null;
            form.dealEntry = moment().format("YYYY-MM-DD");

            form = JSON.stringify(form);

            editClients(clientsSelected, form, function () {
                $('#dataTable3').DataTable().clear().destroy();
                $('#rowDataTable').fadeOut();
                $('#loadSpinner').fadeIn();
                getClients();
            });
        });

        $("#edit_selected").unbind("click").on('click', function () {

            var noReservedClient = true;

            var clientsSelected = $('input[name="optionRadio"]:checkbox:checked').map(function (key, value) {
                var infoClient = clientsHolder[value.closest('tr').id];
                if(infoClient.reservedById != null){
                    noReservedClient = false;
                }
                return infoClient.id;
            }).get();
            var value = $("#actions").val();

            if(noReservedClient && value == 0){

                var errorReservedClients = "Вы не можете выполнить данную операцию.\nВ выбраном списке присутствуют клиент для которых оператор не назначен";
                $('#error_reservedClients').find('span').html(errorReservedClients).fadeIn();

                $("#actions").on('change', function (){

                    if($("#actions").val() != 0){
                        $('#error_reservedClients').find('span').fadeOut();
                    }
                    else if(noReservedClient && $("#actions").val() == 0){
                        $('#error_reservedClients').find('span').html(errorReservedClients).fadeIn();
                    }
                })

            } else {

                var statusToSet = $("#statuses").val();
                var dateToCallBack = moment($("#dateCallBack1").val(), "DD-MM-YYYY HH:mm").format("YYYY-MM-DDTHH:mm:ssZ");

                var form = {};
                form.status = parseInt(statusToSet);


                if(value != 0){
                    form.reservedById = parseInt(value);
                }


                if (statusToSet == 2 && (dateToCallBack == "" || dateToCallBack == 'Invalid date')){
                    var errorCallBackDate = "Дата перезвона не выбрана";
                    $('#error_callBackDate').find('span').html(errorCallBackDate).fadeIn();

                    $("#dateTimePicker2").on('change', function (){

                        if($("#dateCallBack1").val() != ""){
                            $('#error_callBackDate').find('span').fadeOut();
                        }

                    })
                } else {

                    if(statusToSet == 2){
                        form.newCallBackDate = dateToCallBack;
                    }

                    form = JSON.stringify(form);

                    editClients(clientsSelected, form, function () {
                        $('#dataTable3').DataTable().clear().destroy();
                        $('#rowDataTable').fadeOut();
                        $('#loadSpinner').fadeIn();
                        getClients();
                        $('#myModalEdit').modal('toggle');
                        document.getElementById("edit-client").reset();
                        if($('#callBackOption').length){
                            $('#callBackOption').remove();
                        }

                    });
                }
            }
        });

    }

    function formatDate(date) {
        return moment(date).format("DD-MM-YYYY");
    }

    function showTotal() {
        getTotal(function (data) {
            $.each(data, function (key, value) {
                    $("#TotalClients").text("Всего в базе " + value + " записей");
                    console.log(value);
                });
                });
    }

    function showfilteredTotal() {
        getTotal(function (data) {
            $.each(data, function (key, value) {
                    $("#FilteredClients").text("Выбрано " + value + " записей");
                    console.log(value);
                });
                });
    }

    function populate() {
        loadOperators(function (data) {

            $.each(data, function (key, value) {
                if (value.isAdmin == false) {
                    $('#operators').append('<option value=' + value.id + '>' + value.name + '</option>');
                    $('#actions').append('<option value=' + value.id + '>' + value.name + '</option>');
                    $('#filteroper').append('<option value=' + value.id + '>' + value.name + '</option>');
                }
            });
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

    function clickUpload() {
        $("#uploadCSV").unbind("click").on('click', function () {
            var file = $('#myForm input:file')[0].files[0];
            var formData = new FormData();
            formData.append('file', file);
            if (file) {
                uploadFile(file);
            }
            return false;
        });
    }

    function editClient() {
        $("#actions").unbind().on("change", function () {
            var idOperator = parseInt($("#actions").val());
        });

        $("#statuses").unbind().on("change", function () {

            var statusSelected = parseInt($("#statuses").val());

            if (statusSelected == 2) {
                $('#edit-client').append(
                    '<table style="width: 100%" id="callBackOption">' +
                    '<thead>' +
                    '<th style="text-align:center">Задайте время для перезвона</th>' +
                    '</thead>' +
                    '<tbody>' +
                    '<tr >' +
                    '<td >' +
                    '<div class="form-group" >' +
                    // '<label for="dateCallBack" class="control-label">Выберите дату и время</label>' +
                    '<div  style="width: 100%" class="input-group date form_datetime" id="dateTimePicker2"' +
                    ' data-link-field="dateCallBack">' +
                    '<input style="width: 100%" class="form-control" size="14" type="text" readonly id="dateCallBack1">' +
                    '<span class="input-group-addon"><span class="glyphicon glyphicon-remove"></span></span>' +
                    '<span class="input-group-addon"><span class="glyphicon glyphicon-th"></span></span>' +
                    '</div>' +
                    '<div align="center" class="clearfix" id="error_callBackDate"><span  style="color: red"></span> </div>' +
                    '</div>' +
                    '</td></tr></tbody></table>');

                $('#dateTimePicker2').datetimepicker({
                    format: "dd-mm-yyyy hh:00",
                    linkFormat: 'dd-mm-yyyy hh:00',
                    language: 'ru',
                    startDate: new Date(),
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
            } else {
                $('#callBackOption').remove();
            }
        });
    }

    function uploadFile(fileCSV) {
        $.ajax({
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/load-clients-from-csv"
            , data: fileCSV
            , processData: false
            , contentType: false
            , type: 'POST'
            , cache: false
            // , enctype: 'multipart/form-data'
            , headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'token': localStorage.token
            }
            , success: function (data) {
                alert("Данные загружены");
            }
            , error: errorHandler
        });
    }

    function setUserName() {
        var decoded = jwt_decode(localStorage.token);
        console.log(decoded);
        $('#user_toggle').text(decoded.name);
    }


    //logOut the user
    function logOut() {
        $('#log_out').click(function () {
            localStorage.removeItem("token");
        });
    }

    function clearDataTableFilters(){
        localStorage.removeItem("DataTables_dataTable3_/adminclients.html");
    }

    return {
        init: init
    }

})();
$(ADMIN_INDEX.init);