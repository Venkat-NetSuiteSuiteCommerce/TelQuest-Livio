define('Warranty.Product.Model', [
    'Product.Model',
    'SC.Configuration',
    'underscore'
], function WarrantyProductModel(
    ProductModel,
    Configuration,
    _
) {
    _.extend(ProductModel.prototype, {
        getWarrantyOptions: function getWarrantyOptions() {
            var children;

            if (this.get('item').get('_isParent')) {
                children = this.getSelectedMatrixChilds();

                if (children && children.length) {
                    return children[0].get('_warrantyOptions');
                }
            }

            return this.get('item').get('_warrantyOptions');
        },

        isWarrantyAvailable: function isWarrantyAvailable() {
            var children;
            if (this.get('item').get('_isParent')) {
                children = this.getSelectedMatrixChilds();
                if (children && children.length) {
                    return children[0].get('_isWarrantyAvailable');
                }
            }

            return this.get('item').get('isWarrantyAvailable');
        },

        setOption: _.wrap(ProductModel.prototype.setOption, function setOption(fn) {
            var isWarrantyAvailable;
            var warrantyOption;
            fn.apply(this, _.toArray(arguments).slice(1));
            isWarrantyAvailable = this.isWarrantyAvailable();
            warrantyOption = this.getOption(Configuration.get('warranty.itemOption'));
            if (!isWarrantyAvailable && warrantyOption && warrantyOption.get('value') && warrantyOption.get('value').internalid) {
                this.setOption(Configuration.get('warranty.itemOption'), '');
            }
        })
    });
});
