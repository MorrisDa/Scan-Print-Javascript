var myApp = angular.module('myApp', ['angular-jwt']);

myApp.service('sortPlaces', function() {

	function resortPlaces() {

		this.sort = function(places, n) {
			var out = [];
			for (var i = 0, r = 0, partial = []; i < places.length; i++) {

				partial.push(places[i]);
				r++;

				if (r == n || i == places.length - 1) {
					out.push(partial);
					partial = [];
					r = 0;
				}

			}

			return out;
		}
	}

	return new resortPlaces();

}).service('prettyData', function() {

	//this service is intended for concatenating pretty strings; bypassed angular.
	function c() {
		this.pretty = function(d) {
			d = d || {};
			return "<b>Time</b>: " + d.created_at + "<br/>" + "<b>Hash Pass</b>: " + d.hash_pass + "<br/>" + "<b>Type</b>: " + d.hash_type + "<br/>" + "<b>Shop Id</b>: " + d.shop_id + "<br/>" + "<b>Activation Code</b>: " + d.activation_code + "<br/>";
		}

		this.prettyPort = function(c) {
			var out = "";
			for (var i = 0; i < c.length; i++) {
				if (i == 0)
					out += "<br/>"
				out += "<li>" + c[i] + "</li>";
				out += "<br/>";
			}
			return out;
		}
	}

	return new c();

}).service('$headerCompiler', function() {
	//create the header object for angular $http service from uman-friendly data in config .json
	function c() {
		this.toHeaderObject = function(h) {
			var out = {};
			for (var i = 0; i < h.length; i++)
				for (var k in h[i])
				out[k] = h[i][k];
			return out;
		}
	}

	return new c();

}).service('tokenRefresher', ['$http', 'jwtHelper', 'settings',
function($http, jwtHelper, settings) {
	//check if the token should be refreshed.
	function c() {
		this.valid = function(tok) {
			if (jwtHelper.isTokenExpired(tok))
				return false;
			else
				return true;
		}
	}

	return new c();
	//return new tok();

}]).service('Poster', ['$http', 'settings', 'tokenRefresher', '$headerCompiler',
function($http, settings, tokenRefresher, $headerCompiler) {

	function c() {
		//first token on construct:
		this.token = settings.auth.token;
		var self = this;

		this.send = function(data, cll) {

			if (tokenRefresher.valid(self.token)) {
				App.error(12);
				$http({
					method : settings.apis.passRetails.method.toUpperCase(),
					data : data,
					url : settings.apis.passRetails.url,
					headers : (function() {
						var b = $headerCompiler.toHeaderObject(settings.apis.passRetails.headers);
						//append token to header
						b['Authorization'] = b['Authorization'] + ' ' + self.token;
						return b;
					})()
				}).success(function(data, status, headers, config) {
					// this callback will be called asynchronously
					// when the response is available
					cll(false, data);

				}).error(function(data, status, headers, config) {
					// called asynchronously if an error occurs
					cll({
						status : status,
						code : 57,
						msg : data.errors[0]
					}, null)
					// or server returns response with an error status.
				});
			} else {
				App.error(17);
				//if token is expired, we ask for the password again; username should be stored in App.settings.auth.username. Card should be scan again (we don't store it)
				App.login();
			}

		}
	}

	return new c();

}]).service('Deleter', ['$http', 'settings', 'tokenRefresher', '$headerCompiler',
function($http, settings, tokenRefresher, $headerCompiler) {

	function c() {
		//first token on construct:
		this.token = settings.auth.token;
		var self = this;

		this.deleteCard = function(data, cll) {
			if (tokenRefresher.valid(self.token)) {
				App.unError(12);
				$http({
					method : settings.apis.deleteCard.method.toUpperCase(),
					params : {q: data},
					url : settings.apis.deleteCard.url,
					headers : (function() {
						var b = $headerCompiler.toHeaderObject(settings.apis.deleteCard.headers);
						//append token to header
						b['Authorization'] = b['Authorization'] + ' ' + self.token;
						return b;
					})()
				}).success(function(data, status, headers, config) {
					// this callback will be called asynchronously
					// when the response is available
					cll(false, data);

				}).error(function(data, status, headers, config) {
					// called asynchronously if an error occurs
					cll({
						status : status,
						code : 57,
						msg : data.errors[0]
					}, null)
					// or server returns response with an error status.
				});
			} else {
				App.error(17);
				//if token is expired, we ask for the password again; username should be stored in App.settings.auth.username. Card should be scan again (we don't store it)
				App.login();
			}

		}
	}

	return new c();

}]).service('Connect', function() {

	function c() {
		var self = this;

		/*
		 * {{serial}} string //the path of the serial port we are going to connect to;
		 * {{cll}} function //callback that will be invoked on connection success or on connection fails. it's invoked with err,data as node standard
		 * {{options}} object for future implementations | optional
		 * @API PUBLIC
		 *
		 */

		this.connect = function(serial, options, cll) {
			if ( typeof options !== 'object') {
				cll = options;
			}
			var out = [];
			var serialPort = require("serialport");
			serialPort.list(function(err, ports) {
				var track = [];
				if (!err && ports) {
					var found = false;
					ports.forEach(function(port) {
						track.push(port.comName);
						if (port.comName == serial) {

							found = true;
							var SerialPort = require("serialport").SerialPort
							var serialPort = new SerialPort(serial, {
								baudrate : 9600
							});

							serialPort.on('close', function(dat) {
								self.sendClose({
									code : 3,
									msg : "connection has been broken, try again maybe"
								})
							})

							serialPort.on("open", function() {
								cll(false, {
									msg : "connection estabilished"
								});

								//object for making a serious hack. The board send us the data in two different packages, so we have to compose them safely.
								var UID = {
									opened : false,
									string : "",
									reset : function() {
										this.opened = false;
										this.string = '';
									},
									//open the string, setting flag to open and
									open : function(d) {
										this.opened = true;
										this.string = d;
									},
									append : function(d) {
										this.string = this.string + d
									},
									getValid : function() {
										if (this.string.length == 14 && /[^a-zA-Z0-9]/.test(this.string))
											return this.string;
										else
											return false;
									}
								}

								serialPort.on('data', function(data) {
									var data = data.toString();
									//if it is start string (magic input keyword 'w'), and open a string
									if (data.indexOf('w') !== -1)
										UID.open(data.replace("w", ""));
									//check if it is a end string ()
									else if (data.indexOf('z') !== -1 && UID.opened) {
										UID.append(data.replace("z", ""));
										//check if it is a valid UID NFC string, sebd data and reset UID object; 
										UID.string = UID.string.trim();
										UID.string = UID.string.trim();
										if (UID.string.length == 14) {
											self.SendData(UID.string);
											UID.reset();
										}
									} else if (data.indexOf('z') !== -1 && data.indexOf('w') !== -1 && data.length == 16)
										self.SendData(data.replace("w", "").replace("z", ""));
									//we absume there are not blank data between data with 'w' and data with 'z'. So we simply clear and close;
									else
										UID.reset();
								});

							});
						}
					});

					if (!found)
						cll({
							code : 1,
							msg : "could not find device with this serial port on your laptop, founded devices are available as extra data",
							data : track
						}, null)
					//$('.arduinoPlug').css("display", "block");
				} else {

					if (!found)
						cll({
							code : 2,
							msg : "failing to list serial ports on your device. check nodeserial is properly installed",
							data : []
						}, null);
					//$('.serialPlug').css("display", "block");
				}

			});
		}
		var callback = function(err, res) {
		};
		var close_cll = function(err, res) {
		};
		this.onData = function(cll) {
			callback = cll;
		}
		this.sendClose = function(dat) {
			close_cll(false, dat)
		}

		this.onClose = function(cll) {
			close_cll = cll;
		}

		this.SendData = function(dat) {
			callback(false, dat);
		}
	}

	return new c();
});

/*
 * APPLICATION CONTROLLERS
 */

myApp.controller('global', ['$scope', 'settings', 'Connect', '$http', 'Poster', 'prettyData', 'Deleter',
function($scope, settings, Connect, $http, Poster, prettyData, Deleter) {

	$scope.placeId = '';
	$scope.placeName = '';
	$scope.UID = '';
	$scope.type = 'card';
	$scope.print = false;
	$scope.read = false;
	$scope.delete = false;
	$scope.save = false;
	$scope.history = [];
	//send data to server

	$scope.printAgain = function(i) {
		console.log(i)
		App.print(i)
	}

	$scope.sendData = function() {
		if ($scope.read) {
			App.unError(12);
		}
		else if ($scope.delete) {
			App.unError(32);
			Deleter.deleteCard($scope.UID, function(err,res) {
				console.log(err,res)
				if (!err && res && !res.error) {
					App.error(32);
				}
				else App.error(33);

			});
		}
		else if ($scope.UID && $scope.type && $scope.placeId) {
			App.unError(12);

			var data = {
				hash_pass : $scope.UID,
				hash_type : $scope.type,
				shop_id : $scope.placeId
			}

			//err is an object with
			Poster.send(data, function(err, res) {
				if (!err && res) {
					App.unError(15);
					App.unError(17);
					$scope.history.unshift({uid: $scope.UID, pass: res.pass.activation_code});
					if ($scope.history.length > 3) $scope.history.pop();
					App.error(15, prettyData.pretty(res.pass));
					if ($scope.print)
						App.print(res.pass.activation_code);
				} else
					switch(err.status) {
						case 400:
							App.error(14, err.msg);
							break;
						case 401:
							App.error(17);
							App.login();
							break;
						default:
							App.error(13, "<br/>status: " + err.status + "<br/>message: " + err.status + "<br/>");
							break;
					}
			});
		} else {
			App.error(10);
		}
	}
	//connect to device
	$scope.connect = function() {
		Connect.connect(settings.serialPort, function(err, res) {
			if (!err && res) {
				App.unError(1);
				App.unError(2);

				//when we receive data from our connector
				Connect.onData(function(err, data) {
					if (!err && data && typeof data == 'string' && data.length == 14) {
						$scope.UID = data;
						$scope.$apply()
						App.unError(3);
						$scope.sendData();
					} else
						App.error(3);
				});

				//when the connector dies:
				Connect.onClose(function(err, data) {
					App.error(2);
				});
			} else {
				switch(err.code) {
					case 1 :
						App.error(1, settings.serialPort + ". <br/>available serial ports are: " + prettyData.prettyPort(err.data));
						break;
					case 2 :
						App.error(1, settings.serialPort + ". <br/>" + err.msg);
						break;
				}
			}
		})
	}
	//connect to device
	$scope.connect();

	//bind data input immediately
	$scope.bindInputData = function(id, name) {
		$scope.placeId = id;
		$scope.placeName = name;
	}
}]).controller('places', ['$scope', 'settings', 'sortPlaces', '$http', '$headerCompiler',
function($scope, settings, sortPlaces, $http, $headerCompiler) {

	var animation = (function() {
		var an = ['tada', 'bounceIn', 'fadeInUp', 'flipInY']
		return 'animated' + ' ' + an[Math.floor(Math.random() * an.length)];
	})();
	$('#main').addClass(animation);
	
	$('body').addClass("backFigo");
	//array of arrays of three places objects
	$scope.places = [];
	//array of places objects
	$scope.unsortedPlaces = [];
	//function for loading places:
	$scope.loadPlaces = function() {
		$http({
			method : settings.apis.placesRetrieve.method.toLowerCase(),
			url : settings.apis.placesRetrieve.url,
			headers : $headerCompiler.toHeaderObject(settings.apis.placesRetrieve.headers)
		}).success(function(data, status, headers, config) {

			console.log("--- DEBUG INFO - RETRIEVE PLACES ---");
			console.log(data, status);
			console.log("--- END DEBUG INFO - RETRIEVE PLACES ---");

			if ( typeof data.shops == 'object') {
				App.unError(8)
				App.unError(9)
				$scope.unsortedPlaces = data.shops;
				$scope.places = sortPlaces.sort(data.shops, 3);
			} else {
				App.error(9)
			}
		}).error(function(data, status, headers, config) {
			// called asynchronously if an error occurs
			$scope.places = [];
			App.error(8)
			// or server returns response with an error status.
		});
		return this;
	}
	//loading places:
	$scope.loadPlaces();

	//hide any place page, compose the class of the page to be shown (passed as page parameter) and show it.
	$scope.togglePage = function(page) {
		$(".fragment").addClass("hidden");
		var accessor = ".frag-" + page;
		$(accessor).removeClass("hidden");
	}
	//set search to blank
	$scope.search = '';

	//do the search inside
	$scope.reSort = function() {
		var key = $scope.search;
		var sorted = [];
		for (var i = 0; i < $scope.unsortedPlaces.length; i++) {
			var term = $scope.unsortedPlaces[i].name;
			if (term.toLowerCase().indexOf(key.toLowerCase()) !== -1)
				sorted.push($scope.unsortedPlaces[i]);
		}
		//create model compliat to the view (three items per page)
		$scope.places = sortPlaces.sort(sorted, 3);
	};

	//html class setting while compiling html
	$scope.active = function(i) {
		return i == 0 ? 'active' : '';
	}
	//html class setting while compiling html
	$scope.display = function(i) {
		return i == 0 ? '' : 'hidden';
	}
}]);
