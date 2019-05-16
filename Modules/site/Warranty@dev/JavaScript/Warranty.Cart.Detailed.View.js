define('Warranty.Cart.Detailed.View', [
    'Cart.Detailed.View',
    'Warranty.Line.Modal.View',
    'GlobalViews.Confirmation.View',
    'Backbone.CollectionView',
    'SC.Configuration',
    'AjaxRequestsKiller',
    'LiveOrder.Model',
    'underscore',
    'jQuery',
    'jquery.cookie'
], function WarrantyCartDetailedView(
    CartDetailedView,
    WarrantyLineModalView,
    GlobalViewsConfirmationView,
    BackboneCollectionView,
    Configuration,
    AjaxRequestsKiller,
    LiveOrderModel,
    _,
    jQuery
) {

    _.extend(CartDetailedView.prototype, {

        showContent: _.wrap(CartDetailedView.prototype.showContent, function initialize(fn) {
            var self = this;
            fn.apply(this, _.toArray(arguments).slice(1));
            if (this.allLinesReady()) {
                _.defer(function () {
                    self.model.cartLoad.done(function cartLoadDone() {
                        self.showWarrantyModal();
                    });
                });
            } else {
                this.model.on('change', function onModelChanged() {
                    self.model.cartLoad.done(function cartLoadDone() {
                        self.showWarrantyModal();
                    });
                });
            }
        }),

        allLinesReady: function allLinesReady() {
            return this.model.get('lines').all(function allLines(line) {
                return line.get('internalid');
            });
        },

        getLinesThatAcceptWarranties: function getLinesThatAcceptWarranties() {
            var warrantyLines = jQuery.cookie('warrantyLines') || [];
            return this.model.get('lines').filter(function filterLines(line) {
                var warrantyOption = line.getOption(Configuration.get('warranty.itemOption'));
                return (!line.get('internalid') || (warrantyLines.indexOf(line.get('internalid')) < 0)) &&
                    line.get('item').get('_isWarrantyAvailable') && (!warrantyOption || !warrantyOption.get('value'));
            });
        },

        updateLines: function updateLines(options) {
            var linesToUpdate = options.lines;
            var liveOrder = options.cart;
            var self = this;

            linesToUpdate = linesToUpdate.filter(function filterLinesToUpdate(line) {
                var warrantyOption = line.getOption(Configuration.get('warranty.itemOption'));
                return line.get('internalid') && line.get('item').get('_isWarrantyAvailable') && warrantyOption && warrantyOption.get('value');
            });

            if (linesToUpdate && linesToUpdate.length) {
                liveOrder.model.updateLines(linesToUpdate).done(function doneUpdate() {
                    liveOrder.render();
                    self.$containerModal.modal('hide');
                });
            } else {
                this.showError('You must select at least one warranty to a line.');
            }
        },

        hideWarrantyModal: function hideWarrantyModal() {
            this.$containerModal.modal('hide');
        },

        destroy: _.wrap(CartDetailedView.prototype.destroy, function destroy(fn) {
            fn.apply(this, _.toArray(arguments).slice(1));
            this.warrantyModal && this.warrantyModal.destroy();
            this.model.off('change');
        }),

        addToCookie: function addToCookie(options) {
            var linesToUpdate = options.lines;
            var alreadyInCookie = jQuery.cookie('warrantyLines') || [];
            jQuery.cookie('warrantyLines', _.union(alreadyInCookie, _.pluck(linesToUpdate, 'id')));
        },

        showWarrantyModal: function showWarrantyModal() {
            var lines = this.getLinesThatAcceptWarranties();

            if (lines && lines.length) {
                this.warrantyModal = new GlobalViewsConfirmationView({
                    title: _.translate('Extended Consumer Warranty'),
                    page_header: _.translate('Extended Consumer Warranty'),
                    confirmLabel: 'Add Warranty',
                    cancelLabel: 'No Thanks',
                    callBack: this.updateLines,
                    autohide: false,
                    callBackParameters: {
                        lines: lines,
                        cart: this
                    },
                    modalClass: 'global-views-modal-large',
                    cancelCallBack: this.hideWarrantyModal,
                    view: BackboneCollectionView,
                    viewParameters: {
                        collection: lines,
                        viewsPerRow: 1,
                        childView: WarrantyLineModalView,
                        modalClass: 'global-views-modal-large'
                    },
                    destroyCallBack: this.addToCookie,
                    destroyCallBackParameters: {
                        lines: lines,
                        cart: this
                    }
                });

                this.application.getLayout().showInModal(this.warrantyModal);
            }
        }
    });

});

