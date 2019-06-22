/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	'jQuery.sidebarMenu'
,	[
		'jQuery'
]
,	function(
		jQuery
	)
{
	'use strict';

	function Menu(el) {
		var wrapper = el
		, last_opened_menu = wrapper
		, root_ul = wrapper.find('.header-sidebar-menu:first')
		, animating = false
		, has_animation_support = detectAnimationSupport()

		, class_names = {
			  menuOpened: 'header-sidebar-menu-opened'
			, menuPath: 'header-sidebar-menu-path'
			, menuTransition: 'header-sidebar-menu-transition'
			, animateIn: 'header-sidebar-menu-flyer-in'
			, animateOut: 'header-sidebar-menu-flyer-out'
			, flyer: 'header-sidebar-menu-flyer'
		}
		, height_stack = [];

		//initializing menu
		last_opened_menu.addClass(class_names.menuPath);
		last_opened_menu.addClass(class_names.menuOpened);

		jQuery(root_ul).on('click', '[data-action="push-menu"]', function (e) {

			e.preventDefault();
			e.stopPropagation();

			if (animating === true)
			{
				return;
			}
			animating = true;

			var anchor = jQuery(this)
			, parent_li = anchor.closest('li')
			, pushing_menu = anchor.next();

			animate(pushing_menu, class_names.animateIn, function () {

				//change the last opened menu.
				last_opened_menu.removeClass(class_names.menuOpened);
				last_opened_menu = parent_li;

				//add current opened subview
				parent_li
					.addClass(class_names.menuPath)
					.addClass(class_names.menuOpened);
			});
		});

		jQuery(root_ul).on('click', '[data-action="pop-menu"]', function (e) {

			e.preventDefault();
			e.stopPropagation();

			if (animating === true)
			{
				return;
			}
			animating = true;


			var anchor = jQuery(this)//anchor is the back button
			, anchor_menu = anchor.closest('ul')
			, opened_li = anchor.closest('.' + class_names.menuOpened);

			opened_li
				.removeClass(class_names.menuPath)
				.removeClass(class_names.menuOpened);

			last_opened_menu = opened_li.closest('.' + class_names.menuPath);
			last_opened_menu.addClass(class_names.menuOpened);
			animate(anchor_menu, class_names.animateOut);
		});

		var flyer_className = '.' + class_names.flyer;
		jQuery(wrapper).on('animationend MSAnimationEnd oAnimationEnd webkitAnimationEnd', flyer_className, function () {

			var cb = jQuery(this).data('callback');
			if (cb)
			{
				cb();
			}

			jQuery(this).remove();
			animating = false;
			root_ul.addClass(class_names.menuTransition);//fix ios transition glitch
		});

		function animate(sub_menu, animation_class, cb) {

			var flyer_menu = sub_menu.clone(false);

			flyer_menu.removeClass()
				.addClass(class_names.flyer)
				.insertAfter(root_ul)
				.addClass(animation_class);

			if (animation_class === class_names.animateIn)
			{
				height_stack.push(root_ul.height());
				root_ul.css('height', flyer_menu.height());
			}
			else 
			{
				root_ul.css('height', height_stack.pop());
			}

			flyer_menu.data('callback', cb);

			if (!has_animation_support){
				if (cb)
				{
					cb();
				}
				flyer_menu.remove();
				animating = false;
				root_ul.addClass(class_names.menuTransition);//fix ios transition glitch
			}
		}
	}


	function detectAnimationSupport()
	{
		var	domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
			elm = document.createElement('div');


		if( elm.style.animationName !== undefined ) { 
			return true;
		}

		for( var i = 0; i < domPrefixes.length; i++ ) {
			if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
				return true;
			}
		}

		return false;
	}


	jQuery.fn.sidebarMenu = function () {
		return this.each(function () {
			Menu(jQuery(this));
		});
	};

	return jQuery.fn.sidebarMenu;

});