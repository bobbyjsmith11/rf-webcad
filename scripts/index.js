
function helloNameWrapped () {
    var my_name = {'first_name' : 'Cristina', last_name : 'Freitas', what_i_like: 'bunda'};
    $.ajax({
        type: "POST",
        data: JSON.stringify(my_name),
        url: "http://localhost:3000/HelloNameWrapped",
        contentType: "application/json"
    });

};

function helloNameRaw () {
    // var my_name = {'first_name' : 'Cristina', last_name : 'Freitas', what_i_like: 'bunda'};
    dat = "first_name=Cristina"
          + "&last_name=Freitas"
          + "&what_i_like=bunda";
    $.ajax({
        type: "POST",
        datatype: "JSON",
        async: true,
        data: dat,
				url: "https://95zr214h42.execute-api.us-east-2.amazonaws.com/dev",
        contentType: "application/json",
        success: function (data) {
					console.log(data);
				},
				error: function	(result) {
				}
    });

};
