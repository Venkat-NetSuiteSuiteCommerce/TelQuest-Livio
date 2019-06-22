/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	[
		'Invoice'
	,	'jasmine2-typechecking-matchers'
	,	'Application'
	]
,	function (
		InvoiceModule
	)
{
	'use strict';

	return describe('Invoice Module', function() {

		describe('Public Properties Exposed', function() {

			it('should have public properties for each of its components', function() {
				expect(InvoiceModule).toBeDefined();
				expect(InvoiceModule.mountToApp).toBeDefined();
				expect(InvoiceModule.MenuItems).toBeDefined();			
			});

		});

	});
});