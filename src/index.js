//The main object application
function Application() {
	//native nodejs file system module;
	this.fs = require('fs');

	//keep track of current context in inner objects;
	var self = this;

	this.settings = (function() {
		var def = {
			"serialPort" : "/dev/cu.usbserial-A602VGLF",
			"auth" : {
				"username" : "",
				"password" : "",
				"unsafe" : false
			},
			"apis" : {
				"placesRetrieve" : {
					"url" : "http://www.unipiazza.it/api/shops/all",
					"method" : "get",
					"headers" : [{
						"Accept" : "application/unipiazza.v5"
					}]
				},
				"passRetails" : {
					"url" : "http://www.unipiazza.it/api/pass_retails",
					"method" : "post",
					"headers" : [{
						"Accept" : "application/unipiazza.v5"
					}, {
						"Authorization" : "Bearer"
					}]
				},
				"login" : {
					"data" : [{
						"scope" : "admin"
					}],
					"url" : "http://www.unipiazza.it/auth/sign_in",
					"method" : "post",
					"headers" : []
				}
			}
		}

		//check if type of a is the same as type of b;
		function isConforme(a, b) {
			if ( typeof b == typeof a)
				return true;
			else
				return false;
		}

		/*
		*  {{a}} object || the model object
		*  {{b}} object || the object that should be compliant to the model object a
		*  return b complian to a (fields are of the same type in each inner object)
		*/
		//check if object b is compliant to model a, if not replace uncompliant fields.
		function conformize(a, b) {
			for (var key in a)
			if (b[key]) {
				if (!isConforme(a[key], b[key]))
					b[key] = a[key];
				else if ( typeof a[key] == 'object')
					b[key] = conformize(a[key], b[key]);
			} else
				b[key] = a[key];
			return b;
		}

		try {
			//read settings from local JSON and try to parse. This is inside a try/catch because if parsing fails an error in thrown. doing in a try catch is standard;
			return conformize(def, JSON.parse(self.fs.readFileSync('config.json', "utf8")));
		} catch(e) {
			//if error throws (json parsing error), config.json is not valid json and we use default options;
			return def;
		}

	})();

	//ID of HTML element that are used for error reporting:
	this.errorsLocation = {
		1 : "connectionAlert",
		2 : "loginError",
		3 : "placeError",
		4 : "inputError",
		5 : "tokenError",
	}

	this.errors = {
		//error with the same location_id are intended to stay in different positions in layout.
		//relate message with location_id, set type (bootstrap like: danger, warning, info, success)
		//showAlso: append further doms element got by property ID   jquery e.g: $('#connectButton')
		//You can insert {{extra}} magic string and provide the content to put in as second parameter while invoking new Application().error(1, 'message'); Otherwise extra got blank text
		1 : {
			location_id : this.errorsLocation[1],
			message : "Could not connect to Card reader on serial port: {{extra}} Plug it or change serialPort field in config.json",
			kind : "danger",
			showAlso : "connectButton"
		},
		2 : {
			location_id : this.errorsLocation[1],
			message : "Your device has been disconnected, please plug it again and click 'try connecting'",
			kind : "danger",
			showAlso : "connectButton"
		},
		31 : {
			location_id : this.errorsLocation[1],
			message : "We have not found any installed Dymo printer. Make sure you have installed DYMO software",
			kind : "danger",
		},
		32 : {
			location_id : this.errorsLocation[1],
			message : "We haven't found any compatible printer; check error logs for infos",
			kind : "danger",
		},
		25 : {
			location_id : this.errorsLocation[1],
			message : "Token seems to be expired, and you set unsafe mode to false in config.json, so you should provide your password again, and re-scan your NFC tag",
			kind : "warning",
			showAlso : "reLogin"
		},
		26 : {
			location_id : this.errorsLocation[5],
			message : "Bad Username e/o Password",
			kind : "danger"
		},
		3 : {
			location_id : this.errorsLocation[1],
			message : "There was an error in reading this UID, please try again",
			kind : "warning"
		},
		5 : {
			location_id : this.errorsLocation[2],
			message : "Please wait server response..",
			kind : "warning"
		},
		6 : {
			location_id : this.errorsLocation[2],
			message : "Bad Username e/o Password",
			kind : "danger"
		},
		7 : {
			location_id : this.errorsLocation[2],
			message : "Password and Username are both required",
			kind : "danger"
		},
		8 : {
			location_id : this.errorsLocation[3],
			message : "Could not retrieve places from API",
			kind : "warning",
			showAlso : "placeButton"
		},
		9 : {
			location_id : this.errorsLocation[3],
			message : "Data is not compliant with expected model, see log info for details and server response",
			kind : "danger",
			showAlso : "placeButton"
		},
		10 : {
			location_id : this.errorsLocation[4],
			message : "Data Cannot be sent to server. You must at least select a place and state a type",
			kind : "danger"
		},
		12 : {
			location_id : this.errorsLocation[4],
			message : "<span class='fui-upload'></span>  Please wait, we are talking to the server",
			kind : "warning"
		},
		33 : {
			location_id : this.errorsLocation[4],
			message : "<span class='fui-danger'></span>  Error in deleting this card from server",
			kind : "danger"
		},
		32 : {
			location_id : this.errorsLocation[4],
			message : "The card was successfully deleted from server",
			kind : "success"
		},
		17 : {
			location_id : this.errorsLocation[4],
			message : "<span class='fui-cross'></span> Your communication token is invalid, try again",
			kind : "danger"
		},
		13 : {
			location_id : this.errorsLocation[4],
			message : "<span class='fui-cross'></span>  Attention! Server answered with {{extra}} status. impossible to uplad this UID. Try again",
			kind : "danger"
		},
		14 : {
			location_id : this.errorsLocation[4],
			message : "<span class='fui-cross'></span> Error with data: {{extra}}",
			kind : "warning"
		},
		15 : {
			location_id : this.errorsLocation[4],
			message : "<span class='fui-check'></span> Your data has been successfully uploaded to server. Data are:<br/><br/> {{extra}}",
			kind : "success"
		}

	};
	//keep track of errors occurred;
	this.errorsOccured = [];

	this.loginAndInit = function() {
		self.login(null, null, function() {
			self.bootstrap();
		});
	}
	//get an array like so [{'titolo':'la veria storia di'}, {'sottotitolo':'una favola bellissima'}] and output an object like so: {'titolo': 'la veria storia di', 'sottotitolo':'una favola bellissima'}
	this.toHeaderObject = function(h) {
		if (h) {
			var out = {};
			for (var i = 0; i < h.length; i++)
				for (var k in h[i])
				out[k] = h[i][k];
			return out;
		}
	}
}

Application.prototype.print = function(code) {
	console.log('printing :', code)
	try {
	var lab = this.fs.readFileSync("printer/_Template/label.label").toString();
	var a = lab.replace(/<String>(.+?)<\/String>/g, "<String>" + code + "</String>");
	var label = dymo.label.framework.openLabelXml(a);
	var printers = dymo.label.framework.getPrinters();

	console.log(printers)

	if (printers.length == 0)
		App.error(31);

	var printerName = "";
	for (var i = 0; i < printers.length; ++i) {
		var printer = printers[i];
		if (printer.printerType == "LabelWriterPrinter") {
			printerName = printer.name;
			break;
		}
	}

	if (printerName) label.print(printerName);
	else app.error(32);
	}
	catch(e) {
		alert("Dyno javascript SDK is not working properly");
	}
}

//add the message related with the provided location_id, and set the class according to error type (bootstrap css: alt-waring, alt-danger, alt-success, alt-info);
/*  api public
 * {{code}} int | error code (as given in Application.error)
 * {{ext}} string | further data to provide on the message, inserted in {{extra}} magic input
 */
Application.prototype.error = function(code, ext) {
	var self = this;
	if ( typeof code !== 'number' && typeof code == 'object') {
		for (var i = 0; i < code.length; i++)
			self.error(code[i], ext);
		return;
	}
	var context = this.errors[code];
	if (!context)
		return {
			code : 54,
			msg : "the code you provide is not defined, fuck you!"
		};
	var accessor = '#' + context.location_id;
	var classe = 'alert-' + context.kind;
	var msg = "";
	ext ? msg = context.message.replace("{{extra}}", ext) : msg = context.message.replace("{{extra}}", '');
	$(accessor).css("display", "block").html(msg).addClass(classe);
	if (context.showAlso) {
		var u = '#' + context.showAlso;
		$(u).css("display", "block");
	}

}
/*  api public
* {{code}} int | error code (as given in Application.error)
*/
//unerror the code given by error and all the errors that stays in the same location id.
Application.prototype.unError = function(code) {
	var context = this.errors[code];
	if (!context)
		return {
			code : 54,
			msg : "the code you provide is not defined, fuck you!"
		};
	var accessor = '#' + context.location_id;

	$(accessor).removeClass("alert-warning").removeClass("alert-danger").removeClass("alert-info").removeClass("alert-success").css("display", "none");
	if (context.showAlso) {
		var u = '#' + context.showAlso
		$(u).css("display", "none");
	}
}
/*  api public
* {{serverData}} object | the login server response
* {{settings}} object | file config.js
*/
//bootstrap the angularjs application
Application.prototype.bootstrap = function(a) {
	//animate entering:
	$('#login').addClass('animated bounceOutLeft');
	//keep track of current context;
	var self = this;
	//oooooh please, wait a moment for the animation to complete. morrixDa
	setTimeout(function() {
		angular.element(document).ready(function() {
			myApp.constant('settings', self.settings);
			angular.bootstrap(document, ['myApp']);
		});
	}, 500);

}
/*  api public
 * {{username}} string | optional | username
 * {{password}} string | optional | password
 * if the value aren't provided they gets got in DOM's input
 */
Application.prototype.login = function(username, password, cll) {

	//keep the current object reference (self = this)
	var self = this;

	//get username and password in DOM;

	var username = username || self.settings.auth.username || $("#login input[type=text]").val(), password = password || self.settings.auth.password || $("#login input[type=password]").val();
	//reset old error;
	this.unError(5);

	if (username && password) {
		this.unError(6)
		this.error(5)
		$.ajax({
			type : self.settings.apis.login.method.toUpperCase(),
			url : self.settings.apis.login.url,
			data : (function() {
				var b = self.toHeaderObject(self.settings.apis.login.data);
				b.email = username;
				b.password = password;
				return b;
			})(),
			//success response by server (200 status code)
			success : function(data) {
				self.unError(7);
				self.unError(25);
				self.unError(26);
				console.log("\n--- DEBUG INFO - LOGIN --- ");
				console.log("Server data is:\n");
				console.log(data);
				console.log("--- END DEBUG INFO - LOGIN --- \n");
				//story in memory password (can be unsafe) for token refresh
				if (self.settings.auth.unsafe)
					self.settings.auth.password = password;
				else
					self.settings.auth.password = "";
				//story in memory user for token refresh
				self.settings.auth.username = username;
				//set token to
				self.settings.auth.token = data.token;
				//clear form value not to store password.
				$("#login input[type=text]").val('');

				//unerror previous 25 error (token expired) if existing;
				//App.unError(25);
				//bootstrap parameter sets consequence of sucessful login, whether to bootstrap the angularJs application or invoke a callback passing data, as in case of token refresh;
				if (cll)
					cll();
			},
			//unsuccessful response by server (different than 200 status code)
			error : function() {
				self.error([6, 26])
			}
		});
	} else
		self.error([7, 25]);
}
var App = new Application();

//if there is username and password provided in
(function(a) {
	if (a.settings.auth.username && a.settings.auth.password && a.settings.auth.unsafe)
		a.login(a.settings.auth.username, a.settings.auth.password, function() {
			a.bootstrap();
		});
})(App)
