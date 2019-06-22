/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

/*
@module BackboneExtras

#Backbone.Validation.callbacks

This code is responsible of showing / hiding error on forms input validation.

It extends the callbacks of the Backbone Validation plugin https://github.com/thedersen/backbone.validation

##Usage

First the view must have a model or collection attribute in order to activate the validation callbacks

	MyView = Backbone.View.extend({
		template: 'my_template'
	,	model: myModel
	});

The view template must have for each control group
	- data-validation="control-group": for each control group
	- data-validation="control" : for each element where a error message is shown

Example:

	<div class="login-form-controls-group" data-validation="control-group">
		<label>
			{{translate 'Password <small>*</small>'}}
		</label>
		<div  class="login-form-controls" data-validation="control">
			<input type="password" name="password" id="login-password" >
		</div>
	</div>

*IMPORTANT* If you are using bootstrap3, be sure that you call Backbone.Validation.callbacks.setSelectorStyle('bootstrap3') or your error messages will not be shown.
*/
define('Backbone.Validation.callbacks'
,	[	'Backbone'
	,	'underscore'
	,	'Backbone.Validation'
	,	'Utils'
	]
,	function (
		Backbone
	,	_
	)
{
	'use strict';

	var selectors = {
		controlGroup: { attr: 'data-validation', value: 'control-group' }
	,	control: { attr: 'data-validation', value: 'control' }
	,	error: { attr: 'data-validation-error', value: '' }
	,	errorInline: { attr: 'data-validation-error', value: 'inline' }
	,	errorBlock: { attr: 'data-validation-error', value: 'block' }

	,	build: function(selectorName)
		{
			var selector = selectors[selectorName];
			return '['+ selector.attr +'="'+ selector.value +'"]';
		}
	};

	_.extend(Backbone.Validation.callbacks, {

		valid: function (view, attr, selector)
		{
			var $control = view.$el.find('['+ selector +'="'+ attr +'"]')
				// if its valid we remove the error classnames
			,	$group = $control.closest(selectors.build('controlGroup')).removeAttr(selectors.error.attr)
			,	$target = $control.data('error-style') === 'inline' ? $group.find(selectors.build('errorInline')) : $group.find(selectors.build('errorBlock'));

			view.helpMessages = view.helpMessages || {};

			if (view.helpMessages[attr])
			{
				$target.text(view.helpMessages[attr]);
			}

			// we also need to remove all of the error messages
			return $target.remove().end();
		}

	,	invalid: function (view, attr, error, selector)
		{
			//removes back-end errors
			view.hideError();

			var $target
			,	$control = view.$el.find('['+ selector +'="'+ attr +'"]')
			,	$group = $control.closest(selectors.build('controlGroup')).attr(selectors.error.attr, selectors.error.value);

			//This case happens when calling validation on attribute setting with { validate: true; }
			if (!view.$savingForm)
			{
				view.$savingForm = $control.closest('form');
			}

			if ($control.data('error-style') === 'inline')
			{
				// if we don't have a place holder for the error
				// we need to add it. $target will be the placeholder
				if (!$group.find(selectors.build('errorInline')).length)
				{
					$group
						.find(selectors.build('control'))
						.append('<span ' + selectors.errorInline.attr +'="'+ selectors.errorInline.value +'"></span>');
				}

				$target = $group.find(selectors.build('errorInline'));
			}
			else
			{
				// if we don't have a place holder for the error
				// we need to add it. $target will be the placeholder
				if (!$group.find(selectors.build('errorBlock')).length)
				{
					$group
						.find(selectors.build('control'))
						.append('<p ' + selectors.errorBlock.attr + '="' + selectors.errorBlock.value +'"></p>');
				}

				$target = $group.find(selectors.build('errorBlock'));
			}

			view.helpMessages = view.helpMessages || {};
			view.helpMessages[attr] = $target.text();

			return $target.text(error);
		}
	});

	return Backbone.Validation.callbacks;
});