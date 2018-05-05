/**
 * Created by Shmidt on 02.02.2017.
 */
var ADMIN_INDEX = (function () {

    var server = "10.8.0.1";
    var serverLoc = window.location.hostname;
    var totalToPut = {};

    //main function
    function init() {
        setUserName();
        logOut();
        clickUpload();
        getOperators();
        signUp();
    }

    $.fn.serializeObject = function () {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function () {
            if (o[this.name] !== undefined) {
                if (!o[this.name].push) {
                    o[this.name] = [o[this.name]];
                }
                o[this.name].push(this.value || '');
            } else {
                o[this.name] = this.value || '';
            }
        });
        return o;
    };
    
    function signUp(){
        $('#confirmsignup').on('click', function(){

            var formData = {username: null, name: null, password: null};
            var pass1 = $('#password1').val();
            var pass2 = $('#password2').val();
            formData.username = $('#usernameOp').val();
            formData.name = $('#nameOp').val();
            formData.password =  pass1.toString();
            formData = JSON.stringify(formData);

            var serverLoc = window.location.hostname;
            var errorCredentials = "Пароли не совпадают";
            $('#error_console2').find('span').fadeOut();


            if( pass1 == pass2 ){
                $.ajax({
                    type: "POST",
                    url: "http://"+ serverLoc +":8080/web-service-demo-1.0/signup",
                    data: formData,
                    success: function (data) {
                        console.log(data);
                        $('#dataTable3').DataTable().destroy();
                        getOperators();
                        $('#myModalAddUser').modal('toggle');
                    },
                    error: errorHandler,
                    dataType: "json",
                    contentType: "application/json"
                });
            }else{
                $('#error_console2').find('span').html(errorCredentials).fadeIn();
            }

        });
    }

    function getOperators() {
        $.ajax({
            type: "GET"
            , dataType: "json"
            , url: "http://" + serverLoc + ":8080/web-service-demo-1.0/users?admin=false"
            , headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            }
            , success: loadClients
            , error: errorHandler
        });
    }     //GET for all the clients in the table to send to POOL

    function loadClients(data) {

        var dataTable3 = $('#dataTable3');

        dataTable3.DataTable({
            "bProcessing": true
            ,"bDeferRender": true
            ,"bScroller": true
            , "bStateSave": true
            , "ordering": false
            , "lengthChange": true
            , "searching": true
            , "info": true
            , "aaData": data
            , "aoColumns": [


                
                {
                    "mData": "username"
                }
                , {
                    "mData": "name"
                }
                , {
                    'sClass': "text-center",
                    "mData": "poolLimit"
                }
                , {
                    'sClass': "text-center",
                    "mData": "clientCount"
                }
                , {
                    'sClass': "text-center",
                    "mData": "lastLogin",
                    "mRender": function (lastLogin) {
                        return formatDate(lastLogin);
                    }

                }
                , {
                    "className": "dt-center",
                    "mRender": function () {
                        return '<div class="action-buttons">'+
                            '<a class="table-actions btn_password" data-toggle="modal"'+
                            ' data-target="#myModalPassword" href="">' +
                                '<i class="fa fa-key"></i></a>' +
                            '<a class="table-actions btn_edit" data-toggle="modal"'+
                            ' data-target="#myModalEdit" href="">'+
                                '<i class="fa fa-pencil"></i></a>' +
                            '<a class="table-actions btn_delete"  data-toggle="modal"'+
                            ' data-target="#myModalDelete" href="">'+
                                '<i class="fa fa-trash-o"></i></a>'+
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
        });
        //$('#loadSpinner').fadeOut();
        $('#rowDataTable').fadeIn();
        dataTable3.on('click', ".btn_delete", function() {
            var rowToDelete = dataTable3.DataTable().row($(this).closest('tr')).data();
            var rowIndex = dataTable3.DataTable().row($(this).closest('tr')).index();
            var userId = [];
            userId.push(rowToDelete.id);
            var user = $(this).closest('tr').find('td:nth-child(2)').html();
            $('#userNameSpan').html(user);
            //$('#myModalDelete .modal-content').attr('id', rowIndex);

            $("#deleteOperator").unbind('click').on('click', function(){

                deleteUser(userId, function() {
                    dataTable3.DataTable().row(rowIndex).remove().draw( false );
                });
            });
        });
        var userId;

        dataTable3.on('click', ".btn_edit", function() {
            $(".editable-form #userName").editable("destroy").empty();
            $(".editable-form #name").editable("destroy").empty();
            $(".editable-form #poolLimit").editable("destroy").empty();

            var rowData = dataTable3.DataTable().row($(this).closest('tr')).data();
            userId = rowData.id;
            $(".editable-form #userName").editable({
                type: 'text',
                pk: 1,
                mode: 'inline',
                value: rowData.username
            });
            $(".editable-form #name").editable({
                type: 'text',
                pk: 1,
                mode: 'inline',
                value: rowData.name
            });
            $(".editable-form #poolLimit").editable({
                type: 'text',
                pk: 1,
                title: 'Введите лимит клиентов',
                mode: 'inline',
                value: rowData.poolLimit,
                validate: function(value) {
                    if ($.isNumeric(value) == '') {
                        return 'Only numbers are allowed';
                    }
                }
            });
        });

        $('#editOperator').unbind("click").click(function () {
            var operatorsInfo = {username: null, name: null, poolLimit: null};
            operatorsInfo.username = $("#userName").editable('getValue').userName;
            operatorsInfo.name = $("#name").editable('getValue').name;
            operatorsInfo.poolLimit = $("#poolLimit").editable('getValue').poolLimit.toString();
            operatorsInfo = JSON.stringify(operatorsInfo);

            editUser(operatorsInfo, userId, function(){
                dataTable3.DataTable().destroy();
                getOperators();
            });
        });

        $('#setPoolLimit').unbind("click").click(function () {
            var newPool = {poolLimit: null};
            newPool.poolLimit = $("#poolLimit").editable('getValue').poolLimit.toString();
            newPool = JSON.stringify(newPool);
            editUser(newPool, userId, function(){
                console.log("set pool limit from now");
                dataTable3.DataTable().destroy();
                getOperators();
            });
            generatePoolLimit(userId);
        });

        dataTable3.on('click', ".btn_password", function() {
            var userIdPass = dataTable3.DataTable().row($(this).closest('tr')).data().id;
            $('#error_console').find('span').fadeOut();

            $('#changePassword').unbind("click").click(function () {
                var errorCredentials = "Пароли не совпадают";
                var passwordInfo = {password: null};
                var pass = $('#passwordNew').val().toString();
                var passRep = $('#passwordNew2').val().toString();
                if(pass == passRep){
                    passwordInfo.password = pass;
                    passwordInfo = JSON.stringify(passwordInfo);
                    editUser(passwordInfo, userIdPass, function(){
                        $('#passwordNew').val('');
                        $('#passwordNew2').val('');
                        dataTable3.DataTable().destroy();
                        getOperators();
                        $('#myModalPassword').modal('hide');
                    });
                }else{
                    $('#error_console').find('span').html(errorCredentials).fadeIn();
                }
            });
        });

    }

    function generatePoolLimit(userId) {
        $.ajax({
            type: "POST"
            , dataType: "json"
            , url: "http://" + serverLoc + ":8080/web-service-demo-1.0/users/"+ userId +"/generate-pool"
            , headers: {
                'Content-Type': 'application/json'
                , 'token': localStorage.token
            }
            , success: function () {
                console.log("success generating pool");
            }
            , error: errorHandler
        });
    }

    function editUser(operatorsInfo, userId, handleData) {

        $.ajax({
            type: "PUT",
            dataType: "json",
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            },
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/users/" + userId,
            data: operatorsInfo,
            success: handleData,
            error: errorHandler
        });
    }

    function formatDate(date) {
        return moment(date).format("DD-MM-YYYY");
    }

    function deleteUser(userId, handleData) {
        var paramURL = $.param({
            id: userId
        });
        $.ajax({
            type: "DELETE",
            url: "http://" + serverLoc + ":8080/web-service-demo-1.0/users?" + paramURL,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
                , 'token': localStorage.token
            },
            success: handleData ,
            error: errorHandler
            // dataType: "json",
            // contentType: "application/json"
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
            uploadFile($("#file").file);
        })
    }


    function uploadFile(fileCSV) {
        $.ajax({
            type: "POST"
            , dataType: "json"
            , url: "http://" + serverLoc + ":8080/load-clients-from-csv"
            , headers: {
                'Content-Type': 'text/csv'
                , 'token': localStorage.token
            }
            , data: fileCSV
            , success: function () {
                console.log("success uploading");
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

    return {
        init: init
    }

})();
$(ADMIN_INDEX.init);