$(function () {

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

    // hide the wrong data message
    $('#error_console').find('span').hide();
});


function myForm() {
    var errorSip = "Ввыберети СИП из списка";
    var errorCredentials = "Данные введены неправильно";

    var formDataObj = $("#myForm").serializeObject();
    var formData = JSON.stringify(formDataObj);
    var server = "10.8.0.1";
    var serverLoc = window.location.hostname;

    if(formDataObj.sip == null && formDataObj.username != "admin"){
        $('#error_console').find('span').html(errorSip).fadeIn();
    } else {
        $.ajax({
            type: "POST",
            url: "http://"+ serverLoc +":8080/web-service-demo-1.0/login",
            data: formData,
            success: function (data) {
                localStorage.token = data.token;
                var admin = jwt_decode(localStorage.token).admin;
                var idUser = jwt_decode(localStorage.token).id;
                console.log(admin);
                if(admin == true){
                    window.location.href = "adminindex.html";
                } else if(idUser == 2){
                    window.location.href = "userindex2.html";
                } else{
                        window.location.href = "userindex.html";
                }
            },
            error: function (xhr, str) {
                $('#error_console').find('span').html(errorCredentials).fadeIn();
            },
            dataType: "json",
            contentType: "application/json"
        });
    }


}