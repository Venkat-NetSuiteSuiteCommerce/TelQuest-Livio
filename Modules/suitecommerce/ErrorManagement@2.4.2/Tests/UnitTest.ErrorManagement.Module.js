/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define([
		'ErrorManagement'
	,	'UnitTestHelper'
	]
,	function (
		ErrorManagement
	,	UnitTestHelper
	)
{
	'use strict';

	return describe('ErrorManagement Module', function ()
	{
		var helper, layout

		describe('Extends the layout with error handling methods', function ()
		{
			it('page not found', function ()
			{
				try {Backbone.history.start();}catch(ex){}
				helper = new UnitTestHelper({
						applicationName: 'ErrorManagement'
					,	mountModules: [ErrorManagement]
					,	startApplication: true
				});
				layout = helper.application.getLayout();				
				try {Backbone.history.stop();}catch(ex){}

				expect(layout.notFound).toBeDefined();
			});

			it('internal server error', function ()
			{
				expect(layout.internalError).toBeDefined();
			});

			it('expired link', function ()
			{
				expect(layout.expiredLink).toBeDefined();
			});

			it('forbidden', function ()
			{
				expect(layout.forbiddenError).toBeDefined();
			});

			it('unauthorized error', function ()
			{
				expect(layout.unauthorizedError).toBeDefined();
			});
		});

		describe('When an ajax error occurs, the handler is called based on the response status', function ()
		{
			jQuery(document).ajaxError(function (e, jqXhr, options, error_text)
			{
				var intStatus = parseInt(jqXhr.status, 10);
				if (intStatus === 401 || intStatus === 206 || (intStatus === 200 && !jqXhr.responseText))
				{
					if(window.__isUnitTest){jqXhr.responseJSON = {};}
				}
			});
			it('401 triggers unauthorizedError', function (done)
			{
				window.__isUnitTest = true;
				spyOn(layout, 'unauthorizedError');

				jQuery.ajax({
					url: '/401'
				,	killerId: _.uniqueId('ajax_killer_')
				,	timeout: 1
				,	error: function (jqXhr)
					{
						jqXhr.status = 401;
						setTimeout(function()
						{
							expect(layout.unauthorizedError).toHaveBeenCalled();
							done();
						}, 0); 
					}
				});
			});

			it('403 triggers forbiddenError', function (done)
			{
				spyOn(layout, 'forbiddenError');
				
				jQuery.ajax({
					url: '/403'
				,	killerId: _.uniqueId('ajax_killer_')
				,	timeout: 1
				,	error: function (jqXhr)
					{
						jqXhr.status = 403;
						setTimeout(function()
						{
							expect(layout.forbiddenError).toHaveBeenCalled();
							done();
						}, 0); 
					}
				});
			});

			it('404 triggers notFound', function (done)
			{
				spyOn(layout, 'notFound');
				
				jQuery.ajax({
					url: '/404'
				,	killerId: _.uniqueId('ajax_killer_')
				,	timeout: 1
				,	error: function (jqXhr)
					{
						jqXhr.status = 404;
						setTimeout(function()
						{
							expect(layout.notFound).toHaveBeenCalled();
							done();
						}, 0); 
					}
				});
			});

			it('500 triggers internalError', function (done)
			{
				spyOn(layout, 'internalError');
				
				jQuery.ajax({
					url: '/500'
				,	timeout: 1
				,	killerId: _.uniqueId('ajax_killer_')
				,	error: function (jqXhr)
					{
						jqXhr.status = 500;
						setTimeout(function()
						{
							expect(layout.internalError).toHaveBeenCalled();
							done();
						}, 0); 
					}
				});
			});
		});
	});
});