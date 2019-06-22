///<reference path="MfsNsIntelliSense.min.js"/> 
var oldButtonValue;
var Button;
var secondaryButton;
var redirectedUrl;
var success = false;
var windowname = 'psi';
var w = null;
var usingSSO = false;
var ssoUrl = '';
var Location = '';
var wsUrl = '';
var deliveryOrder;
var License = '';
var msgDivTimer;
var checkLoopInterval;
var autoShipCheckCount = 0;

var js$ = jQuery.noConflict(true);

function pj_ButtonClickSpeedInt(button, URL, xml, disable, blankwindow, ssourl, portallocation, transactionId, AutoShip, license) {

	oldButtonValue = button.value;
	if (ssourl != '') {
		ssoUrl = ssourl;
		usingSSO = true;
	}

	if (portallocation != '') {
	    Location = portallocation;
	}

	if (license != '') {
		License = license;
	}

	Button = button;

	if (blankwindow == true)
		windowname = Math.random().toString(36).replace(/[^a-z]+/g, '');

	if (transactionId)
		deliveryOrder = transactionId;

	if (disable) {
		secondaryButton = js$('#secondary' + js$(Button).attr('id'))[0];
		Button.disabled = disable;
		Button.value = 'Sending to Pacejet... Please wait...'
		secondaryButton.disabled = Button.disabled;
		secondaryButton.value = Button.value;
		if (!AutoShip) {
			w = window.open('', windowname);
			try {
				w.document.writeln('<style>body{font-family:arial}</style><b>Please wait...</b>');
			} catch (e) { }
		}
	}

	if (URL.indexOf('localhost') > -1)
		URL = URL.replace('https:', 'http:');
	else
		URL = URL.replace('http:', location.protocol);

	var body = { 'pImportEntityXml': unescape(xml) };

	wsUrl = URL;

	var xhr = js$.ajax({
		url: URL,
		type: "POST",
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		data: JSON.stringify(body),
		processData: false,
		success:
			function (data) {
				handleResponse(data, Button, AutoShip);
			},
		complete:
			function (xhr, status) {
				if (!success) {
					if (status === 'error' || !xhr.responseText) {
						alert('There was an unknown error.  Please contact Pacejet Support.');

						resetButtons();
					} else {
						//IE fix because it can't handle the type of json coming back.
						var data = js$.parseJSON(xhr.responseText.replace('({"d":', '{"d":').replace('}}});', '}}}'));
						handleResponse(data, Button, AutoShip);
					}
				}
			}

	});

}

function pj_ButtonClick(button, URL, disable, blankwindow, portallocation, transactionId, AutoShip, license) {

	if (blankwindow == true)
		windowname = Math.random().toString(36).replace(/[^a-z]+/g, '');

	if (portallocation != '') {
	    Location = portallocation;
	}

	if (license != '') {
		License = license;
	}

	Button = button;

	showMessageDiv();
	oldButtonValue = Button.value;

	if (disable) {
		secondaryButton = js$('#secondary' + js$(Button).attr('id'))[0];
		Button.disabled = disable;
		Button.value = 'Sending to Pacejet... Please wait...'
		secondaryButton.disabled = Button.disabled;
		secondaryButton.value = Button.value;

		setTimeout(function () {
			if (Button.disabled) {
				Button.disabled = false;
				Button.value = oldButtonValue;
				secondaryButton.disabled = Button.disabled;
				secondaryButton.value = Button.value;
			}
		}, 5000);
	}

	if (transactionId)
		deliveryOrder = transactionId;

	wsUrl = URL;

	if (AutoShip) {
		js$.get(URL + "&go=1", function (data) {
			if (data.redirect) {

			}
		});
		checkLoopInterval = setInterval(function () { checkForImport(wsUrl, deliveryOrder) }, 5000);
	} else {
		window.open(URL, windowname, '');
	}
}

function showMessageDiv(url, msg) {
	try {
		var divMessage = msg == null ? 'Sent to Pacejet.  Please wait... <a href="javascript:history.go(0);">refresh page<a/>' : msg;
		if (js$('#div__alert').length > 0) {
			js$('#div__alert').remove();
		}
		var divTag = js$('<div>');
		divTag.attr('id', 'div__alert');
		divTag.append('<div width="100%" class="uir-alert-box confirmation session_confirmation_alert" style=""><div class="icon confirmation"><img alt="" src="/images/icons/messagebox/icon_msgbox_confirmation.png"></div><div class="content"><div class="title">Confirmation</div><div class="descr">' + divMessage + '</div></div></div>');
		divTag.insertBefore('#div__title');

		if (url) {
			divMessage = "Sent to Pacejet. Please wait... <a href='" + url + "' target='" + windowname + "'>View in Pacejet<a/>";
		}
	}
	catch (e) {
		//NOMNOMNOM
		if (console) {
			console.log(e.message);
		}
	}
}

function handleResponse(msg, button, AutoShip) {
	success = true;
	if (msg.d.RedirectURL.length > 0) {

		showMessageDiv();

		setTimeout(function () {
			if (!AutoShip) {
				var redirectedUrl = msg.d.RedirectURL;
				console.log(redirectedUrl);
				if (usingSSO == true)
					redirectedUrl = ssoUrl + "&ReturnURL=" + escape(redirectedUrl);

				w = window.open(redirectedUrl, windowname);
				if (w)
					w.focus();
				else
					showMessageDiv(redirectedUrl);

			}

			if (AutoShip) {
				button.value = "Auto Shipping...";
				button.disabled = true;
				secondaryButton.value = button.value;
				secondaryButton.disabled = button.disabled;

				if (License != null) {
					checkLoopInterval = setInterval(function () { checkForImport(wsUrl, deliveryOrder) }, 5000);
				}

			} else {
				resetButtons();
			}

		}, 500);

	} else {
		if (msg.d.Notifications.HighestSeverity > 0) {
		    alert('There was an error: ' + msg.d.Notifications.HighestSeverityNotification.Message);
		    w.close();
			clearInterval(checkLoopInterval);
		}

		resetButtons();
	}
}

function resetButtons() {
	if (Button.disabled) {
		Button.disabled = false;
		Button.value = oldButtonValue;
		secondaryButton.disabled = Button.disabled;
		secondaryButton.value = Button.value;
	}
}

function checkForImport(URL, transactionId) {
	var imported = false;

	autoShipCheckCount++;

	if (autoShipCheckCount > 50) {
		clearInterval(checkLoopInterval);
		return;
	}

	URLSetting = parseUri(URL);
	var URL = URLSetting.protocol + '://' + URLSetting.host + '/PacejetObjectLibraryWS/Main.asmx/getShipUpdateEntityByDeliveryOrderControlNumber';
	var data = { pLocation: Location, DeliveryOrderControNumber: transactionId, pLicenseID: License };

	if (URL.indexOf('localhost') > -1)
		URL = URL.replace('https:', 'http:');
	else
		URL = URL.replace('http:', location.protocol);

	js$.ajax({
		type: 'POST',
		url: URL,
		data: data,
		dataType: "xml",
		success: function (data) {
			xmlDoc = js$.parseXML(data.documentElement.innerHTML);
			$xml = js$(xmlDoc);
			$title = $xml.find("Status");
			if ($title.text() == "Success") {
				clearInterval(checkLoopInterval);
				document.location = document.location;
				showMessageDiv(null, "Successfully shipped.  Page updating...");
			} else if ($title.text() == "Error") {
				var errorText = $xml.find("ErrorText");
				alert('Error encountered processing the shipment, most often this is caused by missing or invalid data. ' + (errorText != null ? '\n\nError: ' + errorText.text() : "") + "\n\nPlease click the Ship or Stage buttons, attempt to ship again, and resolve any issues.");
				clearInterval(checkLoopInterval);
			}
			resetButtons();
		},
		error: function (e) {
			clearInterval(checkLoopInterval);
			if (console)
				console.log(e.responseText)
		}
	});

}

//Helper functions
function S4() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

(function (js$) {
	// Create the request object
	// (This is still attached to ajaxSettings for backward compatibility)
	js$.ajaxSettings.xdr = function () {
		return (window.XDomainRequest ? new window.XDomainRequest() : null);
	};

	// Determine support properties
	(function (xdr) {
		js$.extend(js$.support, { iecors: !!xdr });
	})(js$.ajaxSettings.xdr());

	// Create transport if the browser can provide an xdr
	if (js$.support.iecors) {

		js$.ajaxTransport(function (s) {
			var callback,
			  xdr = s.xdr();

			return {
				send: function (headers, complete) {
					xdr.onload = function () {
						var headers = { 'Content-Type': xdr.contentType };
						complete(200, 'OK', { text: xdr.responseText }, headers);
					};

					// Apply custom fields if provided
					if (s.xhrFields) {
						xhr.onerror = s.xhrFields.error;
						xhr.ontimeout = s.xhrFields.timeout;
					}

					xdr.open(s.type, s.url);

					// XDR has no method for setting headers O_o

					xdr.send((s.hasContent && s.data) || null);
				},

				abort: function () {
					xdr.abort();
				}
			};
		});
	}
})(js$);

js$.fn.center = function () {
	var w = js$(window);
	if (w.width() == 0)
		w = js$(document);

	this.css("position", "absolute");
	this.css("top", "100px");
	this.css("left", (w.width() - this.width()) / 2 + w.scrollLeft() + "px");
	return this;
}

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri(str) {
	var o = parseUri.options,
		m = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source", "protocol", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor"],
	q: {
		name: "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};
