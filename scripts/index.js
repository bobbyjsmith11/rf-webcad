
function helloNameWrapped () {
    var my_name = {'first_name' : 'Cristina', last_name : 'Freitas', what_i_like: 'bunda'};
    $.ajax({
        type: "POST",
        data: JSON.stringify(my_name),
		url: "https://95zr214h42.execute-api.us-east-2.amazonaws.com/dev",
        contentType: "application/json",
        success: function (data) {
					console.log(data);
				},
        error: function	(result) {
            console.log(result);
				}
    });

};

function test_fn() {
    var dat_json = {
                    "fc": 100e3,
                    "pm": 45,
                    "kphi": 5e-3,
                    "kvco": 10e6, 
                    "N": 200,
                    "R": 1,
                    "fstart": 0.1,
                    "fstop": 100e6,
                    "ptsPerDec": 100,
                    "flt_type": "passive2",
                    "c1": 2.6449935e-10,
                    "c2": 1.277269e-9,
                    "c3": 0,
                    "c4": 0,
                    "r2": 3044.2825,
                    "r3": 0,
                    "r4": 0
                };

  $.ajax( {
            type: "POST",
            datatype: 'JSON',
            async: true,
            data: dat_json,
		    url: "https://95zr214h42.execute-api.us-east-2.amazonaws.com/dev/simulatePll",
            contentType: "application/json",
            success: function (data) {
                MY_DAT = data;
                console.log(data);
            },
            error: function (result) {
            }
  });
}

function test_fn2 () {
    // var my_name = {'first_name' : 'Cristina', last_name : 'Freitas', what_i_like: 'bunda'};
    // dat = "first_name=Cristina"
    //       + "&last_name=Freitas"
    //       + "&what_i_like=bunda";
    // var my_name = {'first_name' : 'Cristina', last_name : 'Freitas', what_i_like: 'bunda'};
    var dat_json = {
                    "fc": 100e3,
                    "pm": 45,
                    "kphi": 5e-3,
                    "kvco": 10e6, 
                    "gamma": 1.024,
                    "N": 200,
                    "loop_type": "passive2"
    };

    $.ajax({
        type: "POST",
        datatype: "JSON",
        async: true,
        data: JSON.stringify(dat_json),
		url: "https://95zr214h42.execute-api.us-east-2.amazonaws.com/dev/solveForComponents",
        contentType: "application/json",
        success: function (data) {
            MY_DAT = data;
            console.log(data);
                },
        error: function	(result) {
            console.log(result);
				}
    });

};
