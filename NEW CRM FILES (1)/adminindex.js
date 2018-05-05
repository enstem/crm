/**
 * Created by Shmidt on 02.02.2017.
 */
var ADMIN_INDEX = (function () {

    var server = "10.8.0.1";
    var serverLoc = window.location.hostname;

    function setUserName() {
        var decoded = jwt_decode(localStorage.token);
        console.log(decoded);
        $('#user_toggle').text(decoded.name);
    }

    //main function
    function init() {
        setUserName();
        callLoadVisits();
        logOut();
    }


    function callLoadVisits(day) {

        if (day == null) {
            for (var i = 0; i < 3; i++) {
                getVisits(moment().add(i, 'day').format("YYYY-MM-DD"));
            }
        } else if (day == "today") {
            getVisits(moment().format("YYYY-MM-DD"));
        } else if (day == "tomorrow") {
            getVisits(moment().add(1, 'day').format("YYYY-MM-DD"));
        } else if (day == "afterTomorrow") {
            getVisits(moment().add(2, 'day').format("YYYY-MM-DD"));
        }

    }


    function getVisits(date) {
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
                loadVisits(data, date);
            }
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

    function setChanges() {

        $('#setTotalToday').unbind('click').click(function () {

            $("#tabToday tr").each(function(key, value){
                if(key != 0){
                    var waveId = $(value).find('td:first-child div:first-child').attr('id').replace("hour", "");
                    var info = $(value).find("td:nth-child(4) input").val();
                    var total = $(value).find("td:nth-child(2) input").val();
                    var inputId = $(value).find("td:nth-child(2) input").attr('id');
                    var hour = inputId.replace("total", "");
                    var object = {};

                    object["total"] = parseInt(total);
                    object["hour"] = hour;
                    object["info"] = info;
                    object["date"] = moment().format("YYYY-MM-DD");

                    object = JSON.stringify(object);
                    putTotal(waveId, object, "today");

                }
            });

        });

        $('#setTotalTomorrow').unbind('click').click(function () {

            $("#tabTomorrow tr").each(function(key, value) {
                if (key != 0) {
                    var waveId = $(value).find('td:first-child div:first-child').attr('id').replace("hour", "");
                    var info = $(value).find("td:nth-child(4) input").val();
                    var total = $(value).find("td:nth-child(2) input").val();
                    var inputId = $(value).find("td:nth-child(2) input").attr('id');
                    var hour = inputId.replace("total", "");
                    var object = {};

                    object["total"] = parseInt(total);
                    object["hour"] = hour;
                    object["info"] = info;
                    object["date"] = moment().add(1, 'day').format("YYYY-MM-DD");

                    object = JSON.stringify(object);
                    putTotal(waveId, object, "tomorrow");

                }
            });
        });

        $('#setTotalAfterTomorrow').unbind('click').click(function () {

            $("#tabAfterTomorrow tr").each(function(key, value) {
                if (key != 0) {
                    var waveId = $(value).find('td:first-child div:first-child').attr('id').replace("hour", "");
                    var info = $(value).find("td:nth-child(4) input").val();
                    var total = $(value).find("td:nth-child(2) input").val();
                    var inputId = $(value).find("td:nth-child(2) input").attr('id');
                    var hour = inputId.replace("total", "");
                    var object = {};

                    object["total"] = parseInt(total);
                    object["hour"] = hour;
                    object["info"] = info;
                    object["date"] = moment().add(2, 'day').format("YYYY-MM-DD");

                    object = JSON.stringify(object);
                    putTotal(waveId, object, "afterTomorrow");

                }
            });
        });

    }

    function putTotal(id, form, day) {
        $.ajax({
            type: "PUT",
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/waves/" + id,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            },
            data: form,
            success: function () {
                console.log("SUCCEEEESS");

                if(day == "today"){
                    $('#tabToday').DataTable().clear().destroy();
                }else if(day == "tomorrow"){
                    $('#tabTomorrow').DataTable().clear().destroy();
                }else if(day == "afterTomorrow"){
                    $('#tabAfterTomorrow').DataTable().clear().destroy();
                }
                callLoadVisits(day);
            },
            error: errorHandler,
            dataType: "json",
            contentType: "application/json"
        });
    }

    function refresh() {

        $('#refreshVisitsToday').unbind('click').click(function () {
            $('#tabToday').DataTable().clear().destroy();
            callLoadVisits("today");
        });
        $('#refreshVisitsTomorrow').unbind('click').click(function () {
            $('#tabTomorrow').DataTable().clear().destroy();
            callLoadVisits("tomorrow");
        });
        $('#refreshVisitsAfterTomorrow').unbind('click').click(function () {
            $('#tabAfterTomorrow').DataTable().clear().destroy();
            callLoadVisits("afterTomorrow");
        })

    }


    function loadVisits(data, date) {
        var today = new Date();

        var tomorrow = moment().add(1, 'day');
        var theDayAfterTomorrow = moment().add(2, 'day');

        var element;

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

        visitsTablePage(data, element, date);
    }


    function visitsTablePage(data, element, date) {
        setChanges();
        refresh();

        var theDay;

        if(moment(date).date() == moment().date()) {
            theDay = 'today';
        }else if(moment(date).date() == moment().add(1, 'day').date()){
            theDay = 'tomorrow';
        }else if(moment(date).date() == moment().add(2, 'day').date()){
            theDay = 'afterTomorrow';
        }

        element.DataTable({
            "aaData": data,
            "bProcessing": false,
                'fnCreatedRow': function (nRow, aData, iDataIndex) {
                    $(nRow).attr('id', 'row_' + iDataIndex); // or whatever you choose to set as the id/class of row
                }
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
                    'mData': 'hour',
                    'mRender': function(hour, type, full){
                        var hourId = 'hour' + full.id;
                        return '<div id=' + '"' + hourId + '"' + '>' + hour + '</div>'
                    }
                },
                {
                    'sClass': "text-center",
                    'mData': 'total',
                    'mRender': function (total, type, full) {

                        var inputId = "total" + full.hour;

                        return '<div class="input-group form-group-narrow" align="center" style="width: 100%">' +
                            '<span class="input-group-btn">' +
                            '<button class="quantity-left-minus btn btn-default-outline fa fa-minus '+ theDay +'" type="button"></button>' +
                            '</span>' +
                            '<input class="form-control input-narrow" id=' + '"' + inputId + '"' + ' value=' + "'" + total + "'" + ' disabled="disabled" type="text" style="text-align: center">' +
                            '<span class="input-group-btn">' +
                            '<button class="quantity-right-plus btn btn-default-outline fa fa-plus '+ theDay +'" type="button"></button>' +
                            '</span>' +
                            '</div>'
                    }
                },
                {
                    'sClass': "text-center",
                    'mData': 'free'
                },
                {
                    'sClass': "text-center",
                    'mData': 'info',
                    'mRender': function (info, type, full) {

                        return '<div>' +
                            '<input class="form-control" placeholder="Задайте бонус" contenteditable="true" value="'+ ((info != null) ? info : "") + '" type="text">' +
                            '</div>'

                    }
                }

            ]
        });

        element.unbind('click').on('click', ".quantity-left-minus", function () {

            var inputSel = $(this).parent().siblings('input');
            var inputId = inputSel.attr('id');
            var hour = inputId.replace("total", "");
            var quantity = parseInt(inputSel.val());

            $(this).closest('td').removeClass("success").addClass("danger");

            // If is not undefined
            if (quantity > 0) {
                inputSel.val(quantity - 1);
                }
        });

        element.on('click', ".quantity-right-plus", function () {
            var inputSel = $(this).parent().siblings('input');
            var inputId = inputSel.attr('id');
            var hour = inputId.replace("total", "");
            var quantity = parseInt(inputSel.val());

            $(this).closest('td').removeClass("danger").addClass("success");

            inputSel.val(quantity + 1);

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
$(ADMIN_INDEX.init);

