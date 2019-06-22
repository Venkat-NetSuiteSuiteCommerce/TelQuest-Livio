/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define([
		'SC.BaseComponent'
	,	'Backbone'

	,	'UnitTest.SC.BaseComponent.Assets.AssetView'
	,	'UnitTest.SC.BaseComponent.Assets.NoAssetView'
	]
,	function (
		SCBaseComponent
	,	Backbone

	,	UnitTestSCBaseComponentAssetsAssetView
	,	UnitTestSCBaseComponentAssetsNoAssetView
	)
{
	return {

		mountToApp: function mountToApp (application)
		{
			var asset_router = Backbone.Router.extend({
					routes: {
						'asset': 'showAssetView'
					,	'notasset': 'showNotAssetView'
					}

				,	showAssetView: function showAssetView ()
					{
						var view = new UnitTestSCBaseComponentAssetsAssetView({application: application});
						return view.showContent();
					}

				,	showNotAssetView: function showNotAssetView ()
					{
						var view = new UnitTestSCBaseComponentAssetsNoAssetView({application: application});
						return view.showContent();
					}
				})

			,	asset_component = SCBaseComponent.extend({
					application: application
				,	componentName: 'SC.BaseComponent.Test'

				,	_isViewFromComponent: function (view, is_instance)
					{
						return !!(is_instance ? view instanceof UnitTestSCBaseComponentAssetsAssetView : view === UnitTestSCBaseComponentAssetsAssetView);
					}
				});

			new asset_router();

			return asset_component;
		}
	};
})