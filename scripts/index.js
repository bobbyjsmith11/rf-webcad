
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
                "freqs": [10, 100, 1000, 10000, 100000, 1000000],
                "refPn": [-60, -80, -100, -120, -140, -150],
                "vcoPn": [-40, -60, -80, -100, -120, -130],
                "pllFom": -229,
                "kphi": 5e-3,
                "kvco": 10e6, 
                "fpfd": 10e6,
                "N": 200,
                "R": 1,
                "flt_type": "passive2",
                "c1": 2.6449935e-10,
                "c2": 1.277269e-9,
                "c3": 0,
                "c4": 0,
                "r2": 3044.2825,
                "r3": 0,
                "r4": 0
                }

    $.ajax({
        type: "POST",
        datatype: "JSON",
        async: true,
        data: JSON.stringify(dat_json),
        url: "https://95zr214h42.execute-api.us-east-2.amazonaws.com/dev/callSimulatePhaseNoise",
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
