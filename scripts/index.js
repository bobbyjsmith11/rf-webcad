
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
        "freqs": [10,100,1000],
        "pns": [-60,-80,-90],
        "numPts": 1000
    }

  $.ajax( {
            url: "https://95zr214h42.execute-api.us-east-2.amazonaws.com/dev/callInterpolatePhaseNoise",
            type: "POST",
            datatype: 'JSON',
            contentType: "application/json",
            async: true,
            crossDomain: true,
            data: JSON.stringify(dat_json),
            success: function (data) {
                MY_DAT = data;
                console.log(data);
            },
            error: function (result) {
            }
  });
}

function test_fn2 () {
    
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
