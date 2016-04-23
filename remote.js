'use strict';
var alexa = require('alexa-app'),
    HarmonyUtils = require('harmony-hub-util'),
    harmony_clients = {},
    conf = require('./remote_conf.js'),
    hub_ip = conf.hub_ip,
    app_id = conf.app_id,
    DirecTV = conf.DirecTV,
    TV = conf.TV,
    Reciever = conf.Reciever,
    Telv = conf.Telv,
    Roku = conf.Roku,
    Music = conf.Music,
    Fire = conf.Fire,
    Movie = conf.Movie,
    PowerOff = conf.PowerOff;
    


// Define an alexa-app
var app = new alexa.app('remote');

app.launch(function(req, res) {
    console.log("Launching the application");
});


function execCmdDF(hutils, is_device, dev_or_act, cmd, cnt, fn, res) {
    console.log("execCmd called with cnt = " + cnt + " is_dev " + is_device +
		" dev/act " + dev_or_act + " cmd = " + cmd);
    if (cnt === 0) {
	fn(res);
	hutils.end();
	return;
    }
    hutils.executeCommand(is_device, dev_or_act, cmd).then(function (res) {
	console.log(cnt + ". Command " + cmd + " to device/activity " +
		    dev_or_act + " was executed with result : " + res);
	if (res) {
	    setTimeout(function () {
		execCmdDF(hutils, is_device, dev_or_act, cmd, cnt - 1, fn, res);
	    }, 100);
	}
    }, function(err) {
	console.log("ERROR Occured " + err);
	console.log("      stack " + err.stack);
    });
}

function execCmd(dev, cmd, cnt, fn, res) {
    new HarmonyUtils(hub_ip).then(function (hutil) {
	execCmdDF(hutil, true, dev, cmd, cnt, fn, res);
    });
}

function execCmdCurrentActivity(cmd, cnt, fn, res) {
    new HarmonyUtils(hub_ip).then(function (hutils) {
	hutils.readCurrentActivity().then(function (current_activity) {
	    execCmdDF(hutils, false, current_activity, cmd, cnt, fn, res);
	});
    });
}

function execActivity(act, fn) {
    new HarmonyUtils(hub_ip).then(function (hutils) {
	hutils.executeActivity(act).then(function (res) {
	    fn(res);
	});
    });
}

app.pre = function(req, res, type) {
    if (req.applicationId !== app_id) {
	console.log(" Received and invalid applicaiton ID " + req.applicationId);
	res.fail("Invalid applicationId");
    }
};

app.intent('FFWDDVR',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{fast|} forward {by|} {1-4|AMOUNT}"]
	   },
	   function (req, res) {
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       if (isNaN(amt)) {
		   amt = 1;
	       }
	       res.say('Fast forward DVR  by ' + amt);
	       for (var i = 0; i < amt;i++)
	       {
		   console.log('FFWD DVR by ' + amt);
		   execCmd(DirecTV, 'FastForward', 1, function (res) {
		       console.log("Command FFWD  was executed with result : " + res);
		   });
	       }
	   });
app.intent('RWDDVR',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{rewind|backup} {by|} {1-4|AMOUNT}"]
	   },
	   function (req, res) {
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       if (isNaN(amt)) {
		   amt = 1;
	       }
	       res.say('Rewind DVR by ' + amt);
	       for (var i = 0; i < amt;i++)
	       {
		   console.log('RWD DVR by ' + amt);
		   execCmd(DirecTV, 'Rewind', 1, function (res) {
		       console.log("Command RWD  was executed with result : " + res);
		   });
	       }
	   });
app.intent('PauseDVR',
	   {
	       "slots" : {},
	       "utterances" : ["{pause}"]
	   },
	   function (req, res) {
	       res.say('Pausing DVR!');
	       console.log('Pausing DVR!');
	       execCmd(DirecTV, 'Pause', 1, function (res) {
		   console.log("Command Pause executed with result : " + res);
	       });
	   });
app.intent('PlayDVR',
	   {
	       "slots" : {},
	       "utterances" : ["{play}"]
	   },
	   function (req, res) {
	       res.say('Playing DVR!');
	       console.log('Playing DVR!');
	       execCmd(DirecTV, 'Play', 1, function (res) {
		   console.log("Command Play executed with result : " + res);
	       });
	   });
app.intent('Channel',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["select channel {1-1000|AMOUNT}"]
	   },
	   function (req, res) {
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       res.say('Setting DirecTV to ' + amt);
 	       console.log('change channel DirecTV to ' + amt);
	       var numpar = amt;
	       var digits = [];
	       while (numpar > 0) {
		   digits.push(numpar % 10);
		   console.log('numpar is ' + numpar % 10);
		   numpar = parseInt(numpar / 10);
		}
	       console.log('digits reversed');
	       var number;
	       number = digits.pop().toString();
	       while (number != undefined)
	       {
		   console.log('Number is ' + number);
		   execCmd(DirecTV, number,1, function (res) {
				   console.log("Change Channel DirecTV was executed with result : " + res);
		   });
		   number = digits.pop().toString();
		   console.log('Next number is ' + number);
	       }
	       res.say('Channel' + amt);
	   });

app.intent('Guide',
	   {
	       "slots" : {},
	       "utterances" : ["{guide|tv guide}"]
	   },
	   function (req, res) {
	       res.say('Showing TV Guide!');
	       console.log('Guide!');
	       execCmd(DirecTV, 'Guide', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });
	      
app.intent('List',
	   {
	       "slots" : {},
	       "utterances" : ["{list|dvr list}"]
	   },
	   function (req, res) {
	       res.say('Showing list!');
	       console.log('List');
	       execCmd(DirecTV, 'List', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });
	
app.intent('PageDown',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{down|page down} {by|} {1-9|AMOUNT}"]
	   },
	   function (req, res) {
	       res.say('Page down!');
	       console.log('Page down');
	       execCmd(DirecTV, 'PageDown', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });

	   });

app.intent('PageUp',
	   {
	       "slots" : {},
	       "utterances" : ["{up|page up}"]
	   },
	   function (req, res) {
	   	   res.say('Page up!');
	       console.log('Page up');
	       execCmd(DirecTV, 'PageUp', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });

app.intent('MoveUp',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{move up} {by|} {1-9|AMOUNT}"]
	   },
	   function (req, res) {
	       console.log('Up');
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       if (isNaN(amt)) {
		   		amt = 1;
	       }
	       res.say('Moving up ' + amt);
	       for (var i = 0; i < amt;i++)
	       {
		   		console.log('Move up by ' + amt);
		   		execCmd(DirecTV, 'DirectionUp', 1, function (res) {
		       	console.log("Command Move Up  was executed with result : " + res);
		   });
		  }
		});

app.intent('MoveDown',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{move down} {by|} {1-9|AMOUNT}"]
	   },
	   function (req, res) {
	      console.log('Down');
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       if (isNaN(amt)) {
		   		amt = 1;
	       }
	       res.say('Moving down ' + amt);
	       for (var i = 0; i < amt;i++)
	       {
		   		console.log('Move up by ' + amt);
		   		execCmd(DirecTV, 'DirectionDown', 1, function (res) {
		       	console.log("Command Move Down  was executed with result : " + res);
		   });
		  } 
	   });	      	      

app.intent('MoveLeft',
	   {
	       "slots" : {},
	       "utterances" : ["{move left}"]
	   },
	   function (req, res) {
	       res.say('moving left!');
	       console.log('move left');
	       execCmd(DirecTV, 'DirectionLeft', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });	      	      

app.intent('MoveRight',
	   {
	       "slots" : {},
	       "utterances" : ["{move right}"]
	   },
	   function (req, res) {
	       res.say('moving right!');
	       console.log('move right');
	       execCmd(DirecTV, 'DirectionRight', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });
	   	      	      	      	      	      	      
app.intent('Select',
	   {
	       "slots" : {},
	       "utterances" : ["{select}"]
	   },
	   function (req, res) {
	       res.say('selecting!');
	       console.log('selecting');
	       execCmd(DirecTV, 'Select', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });

app.intent('Menu',
	   {
	       "slots" : {},
	       "utterances" : ["{menu}"]
	   },
	   function (req, res) {
	       res.say('Menu!');
	       console.log('Menu');
	       execCmd(DirecTV, 'Menu', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });
	   	   	      	      	      	      	      	      
app.intent('Info',
	   {
	       "slots" : {},
	       "utterances" : ["{info}"]
	   },
	   function (req, res) {
	       res.say('Info!');
	       console.log('Info');
	       execCmd(DirecTV, 'Info', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });

app.intent('Exit',
	   {
	       "slots" : {},
	       "utterances" : ["{exit}"]
	   },
	   function (req, res) {
	       res.say('Exiting!');
	       console.log('Exit');
	       execCmd(DirecTV, 'Exit', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });
	   	   	   	      	      	      	      	      	      
app.intent('IncreaseVolume',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{increase|} volume {by|} {1-9|AMOUNT}"]
	   },
	   function (req, res) {
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       if (isNaN(amt)) {
		   amt = 1;
	       }
	       res.say('Increasing volume by ' + amt);
	       console.log('Increasing volume by ' + amt);
	       execCmdCurrentActivity('Volume,Volume Up', amt, function (res) {
		   console.log("Command Volume UP was executed with result : " + res);
	       });
	   });
app.intent('DecreaseVolume',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{decrease volume|reduce volume|down volume|volume down} {by|} {1-9|AMOUNT}"]
	   },
	   function (req, res) {
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       if (isNaN(amt)) {
		   amt = 1;
	       }
	       res.say('Decreasing volume by ' + amt);
	       console.log('Decreasing volume by ' + amt);
	       execCmdCurrentActivity('Volume,Volume Down', amt, function (res) {
		   console.log("Command Volume Down was executed with result : " + res);
	       });
	   });

app.intent('MuteVolume',
	   {
	       "slots" : {},
	       "utterances" : ["{mute|quiet|shut up|unmute}"]
	   },
	   function (req, res) {
	       res.say('Muting!');
	       console.log('Muting!');
	       execCmdCurrentActivity('Volume,Mute', 1, function (res) {
		   console.log("Command Mute executed with result : " + res);
	       });
	   });


app.intent('IncreaseTVVolume',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{increase|} TV volume by {1-9|AMOUNT}"]
	   },
	   function (req, res) {
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       if (isNaN(amt)) {
		   amt = 1;
	       }
	       res.say('Increasing TV volume by ' + amt);
	       console.log('Increasing volume by ' + amt);
	       execCmd(TV, 'VolumeUp', amt, function (res) {
		   console.log("Command Volume UP was executed with result : " + res);
	       });
	   });
app.intent('DecreaseTVVolume',
	   {
	       "slots" : {'AMOUNT' : 'NUMBER'},
	       "utterances" : ["{decrease TV volume|reduce TV volume} by {1-9|AMOUNT}"]
	   },
	   function (req, res) {
	       var amt = parseInt(req.slot('AMOUNT'), 10);
	       if (isNaN(amt)) {
		   amt = 1;
	       }
	       res.say('Decreasing TV volume by ' + amt);
	       console.log('Decreasing volume by ' + amt);
	       execCmd(TV, 'VolumeDown', amt, function (res) {
		   console.log("Command Volume Down was executed with result : " + res);
	       });
	   });

app.intent('MuteTVVolume',
	   {
	       "slots" : {},
	       "utterances" : ["{mute|unmute} {TV|telivision}"]
	   },
	   function (req, res) {
	       res.say('Muting TV!');
	       console.log('Muting!');
	       execCmd(TV, 'Mute', 1, function (res) {
		   console.log("Command Mute executed with result : " + res);
	       });
	   });

app.intent('TurnOffTV',
	   {
	       "slots" : {},
	       "utterances" : ["{turn the TV off|turn TV off}"]
	   },
	   function (req, res) {
	       res.say('Turning TV off!');
	       console.log('Turning TV off!');
	       execCmd(TV, 'PowerOff', 1, function (res) {
		   console.log("Command TV PowerOff executed with result : " + res);
	       });
	   });

app.intent('TurnOnTV',
	   {
	       "slots" : {},
	       "utterances" : ["{turn on the TV|turn the TV on|turn on TV|turn TV on}"]
	   },
	   function (req, res) {
	       res.say('Turning TV on!');
	       console.log('Turning TV on!');
	       execCmd(TV, 'PowerOn', 1, function (res) {
		   console.log("Command TV PowerOn executed with result : " + res);
	       });
	   });

app.intent('TurnOffAmplifier',
	   {
	       "slots" : {},
	       "utterances" : ["{turn the amplifer off|turn amplifier off}"]
	   },
	   function (req, res) {
	       res.say('Turning amplifer off!');
	       console.log('Turning amplifier off!');
	       execCmd(Reciever, 'PowerToggle', 1, function (res) {
		   console.log("Command for amplifer PowerToggle executed with result : " + res);
	       });
	   });

app.intent('TurnOnAmplifier',
	   {
	       "slots" : {},
	       "utterances" : ["{turn on the amplifier|turn the amplifier on}"]
	   },
	   function (req, res) {
	       res.say('Toggle power on the amplifier!');
	       console.log('Turning amplifier on!');
	       execCmd(Reciever, 'PowerToggle', 1, function (res) {
		   console.log("Command Amplifier PowerToggle executed with result : " + res);
	       });
	   });

app.intent('AmplifierInputNext',
	   {
	       "slots" : {},
	       "utterances" : ["{select next amplifier input}"]
	   },
	   function (req, res) {
	       res.say('selecting next input on amplifier!');
	       console.log('Selecting next amplifier input!');
	       execCmd(Reciever, 'InputNext', 1, function (res) {
		   console.log("Command Amplifier InputNext executed with result : " + res);
	       });
	   });


app.intent('TurnOff',
	   {
	       "slots" : {},
	       "utterances" : ["{shutdown|good night|power everything off|power off everything|turn everything off|turn off everything|shut down}"]
	   },
	   function (req, res) {
	       res.say('Turning off everything!');
	       console.log('Turning off everythign!');
	       execActivity(PowerOff, function (res) {
		   console.log("Command to PowerOff executed with result : " + res);
	       });
	   });


app.intent('Movie',
	   {
	       "slots" : {},
	       "utterances" : ["{movie|start movie|watch movie}"]
	   },
	   function (req, res) {
	       res.say('Turning on Movie Mode!');
	       console.log('Turning on Movie Mode!');
	       execActivity(Movie, function (res) {
		   console.log("Command to Watch a Movie executed with result : " + res);
	       });
	   });


app.intent('Fire',
	   {
	       "slots" : {},
	       "utterances" : ["{fire|start fire|watch fire}"]
	   },
	   function (req, res) {
	       res.say('Turning on Fire');
	       console.log('Turning on Fire!');
	       execActivity(fire, function (res) {
		   console.log("Command to Watch Fire executed with result : " + res);
	       });
	   });

app.intent('Music',
	   {
	       "slots" : {},
	       "utterances" : ["{music|start music}"]
	   },
	   function (req, res) {
	       res.say('Turning on Music Mode!');
	       console.log('Turning on Music Mode!');
	       execActivity('Listen to Music', function (res) {
		   console.log("Command to Music executed with result : " + res);
	       });
	   });

app.intent('Roku',
	 {
	     "slots" : {},
	     "utterances" : ["{roku|start roku}"]
	 },
	 function (req, res) {
	      res.say('Turning on Roku!');
	      console.log('Turning on Roku Mode!');
	      execActivity(Roku, function (res) {
		 console.log("Command to Roku executed with result : " + res);
	      });
	 });

app.intent('TV',
	 {
	     "slots" : {},
	     "utterances" : ["{TV|start TV}"]
	 },
	 function (req, res) {
	     res.say('Turning on TV!');
	     console.log('Turning on TV Mode!');
	     execActivity(Telv, function (res) {
		  console.log("Command to TV executed with result : " + res);
	     });
	 });
	       
module.exports = app;




