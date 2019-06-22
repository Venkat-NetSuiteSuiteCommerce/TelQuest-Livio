define('Header.Profile.Site.View',	[
		'Profile.Model'
	,	'Header.Profile.View'
	,	'underscore'
	]
,	function(
		Profile
	,	HeaderProfileView
	,	_
	)
{
	'use strict';

	_.extend(HeaderProfileView.prototype, {
		getContext: _.wrap(HeaderProfileView.prototype.getContext, function (fn) {
			var context = fn.apply(this, _.toArray(arguments).slice(1));
			var profile = Profile.getInstance();

			return _.extend(context, {
				salesrep: profile.get('salesrep')
			});
		})
	})
});
