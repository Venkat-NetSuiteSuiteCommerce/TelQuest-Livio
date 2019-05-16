/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module jQueryExtras

#scPush

A jQuery plugin for manag push content that comes from the right side. To set up:

 * invoke this plugin to the content that will be pushed
 * that content must define a 'data-id' attribute (if not, it will be automatically generated)
 * add an element (button or else) to be the 'pusher' by adding data-type='sc-pusher'
 * that pusher must define a 'data-target' with the data-id of the push content
 * previously defined (if not defined, it will be automatically generated)

Available options:

	{
		target: 'mobile'/'tablet' -> only for mobile or both mobile and tablet
	}

Default options:

	{
		target: 'mobile' -> mobile only
	}
*/
define(
	'jQuery.scPush'
,	[
		'jQuery'
	,	'underscore'
	,	'Utils'
	]
,	function(
		jQuery
	,	_
	,	Utils
	)
{
	'use strict';

	jQuery.fn.scPush = function (options)
	{
		var settings = jQuery.extend({}, jQuery.fn.push.defaults, options )
		,	$main = jQuery('.layout-container');

		// add an overlay on tablet devices to avoid unexpected behaviors (avoid navigations outside the pusher)
		setOverlay();

		// remove unnecesary styles when navigating (caused by pusher content events)
		$main.removeClass('sc-pushing');
		$main.css({ 'margin-top': '', 'height': ''}).removeClass('sc-pushing-partial');

		// check if there was an opened pusher
		var opened_pusher_id = jQuery('[data-pushing]').attr('data-pushing')
		,	opened_pusher = jQuery('[data-id="' + opened_pusher_id + '"]');

		if (opened_pusher.length > 0)
		{
			opened_pusher.addClass('sc-pushing-reopened');
			openPushContent(opened_pusher_id, true);
			$main.addClass('sc-pushing');
		}

		return this.each(function ()
		{
			var self = this
			,	$this = jQuery(this)
			,	$push_header = $this.find('.sc-pusher-header, [data-type="sc-pusher-header"]');

			if (!$push_header.length)
			{
				// add push header containing back button
				$push_header = jQuery('<div class="sc-pusher-header"><a href="#" class="sc-pusher-header-back" data-action="sc-pusher-dismiss">' + _('Back').translate() + '</a></div>');
				$this.prepend($push_header);
			}

			// add data-type for styling
			var push_target_size = settings.target === 'tablet' ? 'sc-pushable-md' : 'sc-pushable-xs';
			$this.attr('data-pusher', push_target_size);

			// get push content id (assign a new one if doesn't have)
			var id = $this.data('id');
			if (!id)
			{
				id = 'sc-pusher-' + new Date().getTime();
				$this.attr('data-id', id);
			}

			var openFn = jQuery.proxy(function(e)
			{
				var proxy = jQuery.proxy(openPushContent, this);

				if(options && options.beforeOpen)
				{
					var res = options.beforeOpen(proxy, e);
					if(!res)
					{
						return;
					}
				}
				else
				{
					e.preventDefault();
				}

				// save current scroll height
				this.currentScroll = jQuery(document.body).scrollTop();

				// open the pusher content
				proxy(id);

				if(options && options.afterOpen)
				{
					options.afterOpen(proxy, e);
				}

			}, this);


			var closeFn = jQuery.proxy(function(e)
			{

				e.preventDefault();

				$this.trigger('beforeClose');

				jQuery('#content').removeAttr('data-pushing');

				jQuery('[data-id="' + id + '"]').removeClass('sc-pushing-reopened');

				$main.removeClass('sc-pushing');

				jQuery('[data-view="Footer"]').show();

				if (Utils.getViewportWidth() < 768)
				{
					this.currentScroll && jQuery(document.body).scrollTop(this.currentScroll);
				}
				else
				{
					$main.css({ 'margin-top': '', 'height': ''}).removeClass('sc-pushing-partial');

					jQuery(document.body).scrollTop(this.currentScroll);
					jQuery('.main-push-overlay').removeClass('active');
				}

				if ($this.attr('data-action'))
				{
					$this.attr('data-action', $this.attr('data-action').replace('sc-pushing', ''));
				}


				$this.trigger('afterClose');
			}, this)

			// search for pusher and add handler
			var pusher = jQuery('[data-type="sc-pusher"][data-target="' + id + '"]');

			$this.on('open', openFn);

			// open push action
			pusher.on('click', openFn);

			// close push action

			$this.on('close', closeFn);

			$push_header.find('[data-action="sc-pusher-dismiss"]').on('click', closeFn);

	    });
	};

	function setOverlay()
	{
		if (Utils.getViewportWidth() >= 768)
		{
			var $main = jQuery('.layout-container')
			,	overlay = jQuery('<div class="main-push-overlay" data-action="main-push-overlay-hide"></div>');

			$main.find('.main-push-overlay').remove();
			$main.append(overlay);

			overlay.on('click', function()
			{
				jQuery(this).removeClass('active');
				var pushed_content = jQuery('[data-action="sc-pushing"]');

				jQuery('#content').removeAttr('data-pushing');
				jQuery('[data-id="' + pushed_content.attr('data-id') + '"]').removeClass('sc-pushing-reopened');
				$main.removeClass('sc-pushing');
				jQuery('[data-view="Footer"]').show();

				$main.css({ 'margin-top': '', 'height': ''}).removeClass('sc-pushing-partial');

				pushed_content.attr('data-action', pushed_content.attr('data-action').replace('sc-pushing', ''));

				// scroll back to the original scroll position
				jQuery(document.body).scrollTop(pushed_content[0].currentScroll);

			});
		}
	}

	function openPushContent(id, isStatic)
	{
		// let the content know what pusher is opened (useful when navigating so it remains open)
		jQuery('#content').attr('data-pushing', id);

		jQuery('[data-id="' + id + '"]').attr('data-action', 'sc-pushing');

		var open_handler = jQuery.proxy(onPushOpened, this);

		if (isStatic)
		{
			open_handler();
		}
		else
		{
			jQuery('[data-id="' + id + '"][data-action="sc-pushing"]').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e)
			{
				open_handler();

				// remove handlers cause jQuery 'one' in Chrome will execute both webkitTransitionEnd and transitionend
				jQuery(this).off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
			});
		}

	}

	function onPushOpened()
	{
		var $main = jQuery('.layout-container');

		if (Utils.getViewportWidth() < 768)
		{
			$main.addClass('sc-pushing');
			jQuery('[data-view="Footer"]').hide();
		}
		else
		{
			$main.css({ 'margin-top': -this.currentScroll, 'height': '+=' + this.currentScroll}).addClass('sc-pushing-partial');
			jQuery('.main-push-overlay').addClass('active');
		}
	}

	jQuery.fn.push.defaults = {
		target: 'mobile'
    ,	appendPusher: false
	};
});
