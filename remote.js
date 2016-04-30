'use strict';
var alexa = require('alexa-app'),
    HarmonyUtils = require('harmony-hub-util'),
    harmony_clients = {},
    conf = require('./remote_conf.js'),
    hub_ip = conf.hub_ip,
    app_id = conf.app_id,
    devDirecTV = conf.devDirecTV,
    devTV = conf.devTV,
    devRoku = conf.devRoku,
    devFire = conf.devFire,
    devDVD = conf.devDVD,
    devReciever = conf.devReciever,
    actTV = conf.actTV,
    actRoku = conf.actRoku,
    actMusic = conf.actMusic,
    Fire = conf.actFire,
    Movie = conf.actMovie,
    PowerOff = conf.actPowerOff,
    hub_name = conf.hub_name;
    

// Define an alexa-app
var app = new alexa.app('remote');
var DVR = "None";
var RECIEVER = "None";
var TV = "None";
var DVD = "None";
var ROKU = "None";
var FIRE = "None";


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

app.intent('SELECTHUB',
	   {
	       "slots" : {'HUB' : 'LITERAL'},
	       "utterances" : ["{set hub} {Family|Master|Garage|HUB}"]
	   },
	   function (req, res) {
	       console.log('Selecting hub ');
	       var hub = req.slot('HUB');
	       res.say('Selecting hub ' + hub);
	       console.log('Selecting hub ' + hub);
		   if (hub.toLowerCase() === conf.hub_name1.toLowerCase())
		   {
    				hub_ip = conf.hub_ip1;
    				hub_name = conf.hub_name1;
            }
            else if (hub.toLowerCase() === conf.hub_name2.toLowerCase())
		   {
    				hub_ip = conf.hub_ip2;
    				hub_name = conf.hub_name2;
            }
            else if (hub.toLowerCase() === conf.hub_name3.toLowerCase())
		   {
    				hub_ip = conf.hub_ip3;
    				hub_name = conf.hub_name3;
            }
            else
            {
    	    			hub_ip = conf.hub_ip1
    	    			hub_name = conf.hub_name1;
    	    			
			}
			
			console.log('Selecting hub ip ' + hub_ip);
			DVR = hub_name + " " + devDirecTV;
	       	console.log('DVR name ' + DVR);
	       	TV = hub_name + " " + devTV;
	       	console.log('TV name ' + TV);
	       	RECIEVER = hub_name + " " + devReciever;
	       	console.log('Receiver name ' + RECIEVER);
			ROKU = hub_name + " " + devRoku;
	       	console.log('Roku name ' + ROKU);
	       	DVD = hub_name + " " + devDVD;
	       	console.log('DVD name ' + DVD);
	 });

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
	       console.log('FFWD DVR by ' + amt);
		   execCmd(DVR, 'FastForward', amt, function (res) {
		       console.log("Command FFWD  was executed with result : " + res);
		   });
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
	       		   console.log('RWD DVR by ' + amt);
		   execCmd(DVR, 'Rewind', amt, function (res) {
		       console.log("Command RWD  was executed with result : " + res);
		   });
	   });
	   
app.intent('PauseDVR',
	   {
	       "slots" : {},
	       "utterances" : ["{pause}"]
	   },
	   function (req, res) {
	       res.say('Pausing DVR!');
	       console.log('Pausing DVR!');
	       execCmd(DVR, 'Pause', 1, function (res) {
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
	       execCmd(DVR, 'Play', 1, function (res) {
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
	       res.say('Setting DVR to ' + amt);
 	       console.log('change channel DVR to ' + amt);
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
		   execCmd(DVR, number,1, function (res) {
				   console.log("Change Channel DVR was executed with result : " + res);
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
	       execCmd(DVR, 'Guide', 1, function (res) {
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
	       execCmd(DVR, 'List', 1, function (res) {
		   console.log("Command guide executed with result : " + res);
	       });
	   });
	
app.intent('PageDown',
	   {
	       "slots" : {},
	       "utterances" : ["{down|page down}"]
	   },
	   function (req, res) {
	       res.say('Page down!');
	       console.log('Page down');
	       execCmd(DVR, 'PageDown', 1, function (res) {
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
	       execCmd(DVR, 'PageUp', 1, function (res) {
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
	       		console.log('Move up by ' + amt);
		   		execCmd(DVR, 'DirectionUp', amt, function (res) {
		       	console.log("Command Move Up  was executed with result : " + res);
		   });
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
	       		console.log('Move up by ' + amt);
		   		execCmd(DVR, 'DirectionDown', amt, function (res) {
		       	console.log("Command Move Down  was executed with result : " + res);
		   });
	   });	      	      

app.intent('MoveLeft',
	   {
	       "slots" : {},
	       "utterances" : ["{move left}"]
	   },
	   function (req, res) {
	       res.say('moving left!');
	       console.log('move left');
	       execCmd(DVR, 'DirectionLeft', 1, function (res) {
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
	       execCmd(DVR, 'DirectionRight', 1, function (res) {
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
	       execCmd(DVR, 'Select', 1, function (res) {
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
	       execCmd(DVR, 'Menu', 1, function (res) {
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
	       execCmd(DVR, 'Info', 1, function (res) {
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
	       execCmd(DVR, 'Exit', 1, function (res) {
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
	       execCmd(RECIEVER, 'PowerToggle', 1, function (res) {
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
	       execCmd(RECIEVER, 'PowerToggle', 1, function (res) {
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
	       execCmd(RECIEVER, 'InputNext', 1, function (res) {
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
	       execActivity(actPowerOff, function (res) {
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
	       execActivity(actMovie, function (res) {
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
	       execActivity(actfire, function (res) {
		   console.log("Command to Watch Fire executed with result : " + res);
	       });
	   });


app.intent('FireMoveRight',
	   {
	       "slots" : {},
	       "utterances" : ["{fire right}"]
	   },
	   function (req, res) {
	       res.say('moving right!');
	       console.log('move right');
	       execCmd(FIRE, 'DirectionRight', 1, function (res) {
		   console.log("Command fire right executed with result : " + res);
	       });
	   });

app.intent('FireMoveLeft',
	   {
	       "slots" : {},
	       "utterances" : ["{fire left}"]
	   },
	   function (req, res) {
	       res.say('moving left!');
	       console.log('move left');
	       execCmd(FIRE, 'DirectionLeft', 1, function (res) {
		   console.log("Command fire left executed with result : " + res);
	       });
	   });

app.intent('FireMoveUp',
	   {
	       "slots" : {},
	       "utterances" : ["{fire up}"]
	   },
	   function (req, res) {
	       res.say('moving up!');
	       console.log('move up');
	       execCmd(FIRE, 'DirectionUp', 1, function (res) {
		   console.log("Command fire up executed with result : " + res);
	       });
	   });
	   
app.intent('FireMoveDown',
	   {
	       "slots" : {},
	       "utterances" : ["{fire down}"]
	   },
	   function (req, res) {
	       res.say('moving Down!');
	       console.log('move Down');
	       execCmd(FIRE, 'DirectionDown', 1, function (res) {
		   console.log("Command fire Down executed with result : " + res);
	       });
	   });	 
	   	   
app.intent('FireOK',
	   {
	       "slots" : {},
	       "utterances" : ["{fire ok}"]
	   },
	   function (req, res) {
	       res.say('ok!');
	       console.log('move ok');
	       execCmd(FIRE, 'OK', 1, function (res) {
		   console.log("Command fire ok executed with result : " + res);
	       });
	   });	

	   
app.intent('FireStop',
	   {
	       "slots" : {},
	       "utterances" : ["{fire stop}"]
	   },
	   function (req, res) {
	       res.say('stopping!');
	       console.log('stop');
	       execCmd(FIRE, 'Stop', 1, function (res) {
		   console.log("Command fire stop executed with result : " + res);
	       });
	   });	

app.intent('FirePlay',
	   {
	       "slots" : {},
	       "utterances" : ["{fire play}"]
	   },
	   function (req, res) {
	       res.say('Playing!');
	       console.log('Play');
	       execCmd(FIRE, 'Play', 1, function (res) {
		   console.log("Command fire Play executed with result : " + res);
	       });
	   });		   

	   
app.intent('FireRWD',
	   {
	       "slots" : {},
	       "utterances" : ["{fire rewind}"]
	   },
	   function (req, res) {
	       res.say('rewinding!');
	       console.log('rewind');
	       execCmd(FIRE, 'Rewind', 1, function (res) {
		   console.log("Command fire rwd executed with result : " + res);
	       });
	   });	

app.intent('FirePause',
	   {
	       "slots" : {},
	       "utterances" : ["{fire pause}"]
	   },
	   function (req, res) {
	       res.say('pausing!');
	       console.log('pause');
	       execCmd(FIRE, 'Pause', 1, function (res) {
		   console.log("Command fire pause executed with result : " + res);
	       });
	   });		   

app.intent('FireFWD',
	   {
	       "slots" : {},
	       "utterances" : ["{fire forward}"]
	   },
	   function (req, res) {
	       res.say('forwarding!');
	       console.log('FWD');
	       execCmd(FIRE, 'FastForward', 1, function (res) {
		   console.log("Command fire FWD executed with result : " + res);
	       });
	   });		   
	   
app.intent('FireMenu',
	   {
	       "slots" : {},
	       "utterances" : ["{fire menu}"]
	   },
	   function (req, res) {
	       res.say('Menu!');
	       console.log('Menu');
	       execCmd(FIRE, 'Menu', 1, function (res) {
		   console.log("Command fire Menu executed with result : " + res);
	       });
	   });	
	   
app.intent('FireBack',
	   {
	       "slots" : {},
	       "utterances" : ["{fire back}"]
	   },
	   function (req, res) {
	       res.say('Back!');
	       console.log('Back');
	       execCmd(FIRE, 'Back', 1, function (res) {
		   console.log("Command fire back executed with result : " + res);
	       });
	   });	

app.intent('FireSearch',
	   {
	       "slots" : {},
	       "utterances" : ["{fire search}"]
	   },
	   function (req, res) {
	       res.say('Searching!');
	       console.log('Search');
	       execCmd(FIRE, 'Search', 1, function (res) {
		   console.log("Command fire search executed with result : " + res);
	       });
	   });	
	   
app.intent('FireExit',
	   {
	       "slots" : {},
	       "utterances" : ["{fire exit}"]
	   },
	   function (req, res) {
	       res.say('Exiting!');
	       console.log('Exit');
	       execCmd(FIRE, 'Exit', 1, function (res) {
		   console.log("Command fire exit executed with result : " + res);
	       });
	   });	

app.intent('FireDel',
	   {
	       "slots" : {},
	       "utterances" : ["{fire delete}"]
	   },
	   function (req, res) {
	       res.say('Deleting!');
	       console.log('Delete');
	       execCmd(FIRE, 'Delete', 1, function (res) {
		   console.log("Command fire Delete executed with result : " + res);
	       });
	   });		
	   
app.intent('FireHome',
	   {
	       "slots" : {},
	       "utterances" : ["{fire home}"]
	   },
	   function (req, res) {
	       res.say('home!');
	       console.log('home');
	       execCmd(FIRE, 'Home', 1, function (res) {
		   console.log("Command fire home executed with result : " + res);
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
	       execActivity(actMusic, function (res) {
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
	      execActivity(actRoku, function (res) {
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
	     execActivity(actTV, function (res) {
		  console.log("Command to TV executed with result : " + res);
	     });
	 });
	       
module.exports = app;




