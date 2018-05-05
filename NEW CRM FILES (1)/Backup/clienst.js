$(function () {
    
    
    var decoded = jwt_decode(localStorage.token);
    $('#user_toggle').text(decoded.name);
    
    var operatorId = decoded.id;
    
    
    $.ajax({
        type: "GET",
        dataType: "json",
        url: "http://127.0.0.1:4567/clients",
        headers: {
        'Content-Type': 'application/json',
        'token': localStorage.token
        },
       success: function( data ) {
            $.each(data, function (key, val) {
                $('#dataTable1').append('<tr></tr>');
                var lastTr = $('#dataTable1 tr:last');
                lastTr.append('<td class="check hidden-xs"><label><input name="optionsRadios1" type="checkbox" value="option1"><span></span></label></td>');
                lastTr.append('<td>' + val.name + '</td>');
                lastTr.append('<td>' + val.phoneNumber + '</td>');
                lastTr.append('<td class="hidden-xs">' + val.email + '</td>');
                lastTr.append('<td class="hidden-xs">' + val.dealMade + '</td>');

                var statusText, spanClass;
                if (val.status == 0) {
                    statusText = 'Approved';
                    spanClass = 'label label-success';
                } else if (val.status == 1) {
                    statusText = 'Pending';
                    spanClass = 'label label-warning';
                } else if (val.status == 2) {
                    statusText = 'Rejected';
                    spanClass = 'label label-danger';
                }

                if (statusText != null && spanClass != null) {
                    var td = $("<td>").addClass('hidden-xs').appendTo(lastTr);
                    $('<span>').addClass(spanClass).text(statusText).appendTo(td);
                } else {
                    alert("it is not a right status");
                }

                lastTr.append('<td class="hidden-xs">' + val.responsible + '</td>');
                lastTr.append('<td class="actions"><div class="action-buttons"><a class="table-actions" href=""><i class="fa fa-eye"></i></a><a class="table-actions" href=""><i class="fa fa-pencil"></i></a><a class="table-actions" href=""><i class="fa fa-trash-o"></i></a></div></td>');

          });
      },
        error: function() {alert('it doesnt work')}

    
    });
});




