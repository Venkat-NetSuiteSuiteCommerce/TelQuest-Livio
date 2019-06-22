/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define('Synthetic.Click'
	, [
			'DeviceDetection'
		,	'jQuery'
		,	'underscore'
 		]
	,	function (
			DeviceDetection
		,	jQuery
		,	_
		)
{
	'use strict';

	function onClick(ev, clientX, clientY)
	{
		ev.target.dispatchEvent(
			new MouseEvent('click', {
				view: window
			, bubbles: true
			, cancelable: true
			, clientX: clientX
			, clientY: clientY
			})
		);

		//prevents default to avoid double click (synthetic + native)
		ev.preventDefault();
	}

	function onFocus(ev)
	{
		ev.target.focus();
	}

	var touch_data = {
		maxDelay: 120
	,	maxDelta: 4
	,	tags: {
			button: 'click'
		,	a: 'click'
		, select: 'focus'
		, input: 'focus'
		, textarea: 'focus'
	}
	,	timestamp: null
	,	clientX: 0
	,	clientY: 0
	,	click: onClick
	,	focus: onFocus
	};

	function getClientX(ev)
	{
		return _.result(getChangedTouch(ev), 'clientX');
	}

	function getClientY(ev)
	{
		return _.result(getChangedTouch(ev), 'clientY');
	}

	function getChangedTouch(ev)
	{
		return _.chain(ev).result('changedTouches').first().value();
	}

	function onTouchStart(ev)
	{
		touch_data.timestamp = ev.timeStamp;
		touch_data.clientX = getClientX(ev);
		touch_data.clientY = getClientY(ev);
	}

	function onTouchEnd(ev)
	{
		var tagName = ev.target.tagName.toLowerCase()
		, handler = touch_data.tags[tagName];

		//ignore because not a clickable element
		if (handler === undefined) {
			return;
		}

		var delay = ev.timeStamp - touch_data.timestamp
		, clientX = getClientX(ev)
		, clientY = getClientY(ev)
		, deltaX = Math.abs(clientX - touch_data.clientX)
		, deltaY = Math.abs(clientY - touch_data.clientY);

		//ignore because delay or scroll
		if (delay > touch_data.maxDelay ||
				deltaX > touch_data.maxDelta ||
				deltaY > touch_data.maxDelta)
		{
			return;
		}

		//GO! dispatch synthetic action
		touch_data[handler](ev, clientX, clientY);
	}

	function mountToApp()
	{
		if(!DeviceDetection.isIPad())
		{
			return;
		}

		jQuery('body')
			.on('touchstart', onTouchStart)
			.on('touchend', onTouchEnd);
	}

	return {
		mountToApp: mountToApp
	};
});
