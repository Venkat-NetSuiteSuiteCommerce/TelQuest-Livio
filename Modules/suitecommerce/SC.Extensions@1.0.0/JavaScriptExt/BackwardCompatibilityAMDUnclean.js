/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

if(typeof SCM !== 'undefined')
{
	Object.keys(SCM).forEach(function(module_name)
	{
		define(module_name, function()
		{
			return SCM[module_name];
		});
	});
}