/*
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
*/

define(
	'UnitTest.Backbone.CompositeView.CellContainerView'
,	[	
		'Backbone'
	,	'Backbone.CompositeView'
	,	'Backbone.CollectionView'
	,	'UnitTest.Backbone.CompositeView.CellView'
	,	'UnitTest.Backbone.CompositeView.CellsCollection'
	,	'UnitTest.Backbone.CompositeView.CellModel'
	,	'UnitTest.Backbone.CompositeView.cell_container_view_customcell_template.tpl'
	]
,	function (
		Backbone
	,	BackboneCompositeView
	,	BackboneCollectionView
	,	CellView
	,	CellsCollection
	,	CellModel
	,	cell_container_view_template_tpl
	)
	{
		function makeCollection (N)
		{
			var c = new CellsCollection();
			for (var i = 0; i < N; i++)
			{
				var a = new CellModel();
				a.set('id', i);
				a.set('color', 'color('+i+','+(i*i/3)+')');
				c.add(a);
			}
			return c;
		}

		return Backbone.View.extend({

				template:cell_container_view_template_tpl

			,	initialize: function()
				{
					BackboneCompositeView.add(this); //make it a composite view (a container)
				}

			,	childViews: {
					CollectionContainer: function ()
					{
						// return new Mouth();
						var collectionView = new BackboneCollectionView({
							childView: CellView
						,	childViewOptions: {
								someStrangeOption : 'dark side of the moon'
							}
						,	collection: makeCollection(5)
						});

						return collectionView;
					}
				}
			});
	}
);