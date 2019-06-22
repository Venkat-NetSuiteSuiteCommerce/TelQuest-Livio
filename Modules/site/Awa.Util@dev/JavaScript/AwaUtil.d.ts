declare interface AwaUtil {
    /**
Shortcut for `_.wrap()` given class's prototype method.

Usage: 

```
overrideInstanceMethod(ItemModel, 'getStockInfo', function getStockInfo(stockInfo) {
    stockInfo.isBackOrderable = !!this.get('isbackorderable');
    return stockInfo;
});
```

Which is equivalent to:

```
ItemModel.prototype.getStockInfo = _.wrap(ItemModel.prototype.getStockInfo, function (fn) {
    var args = Array.prototype.slice.call(arguments, 1);
    var stockInfo = fn.apply(this, args);
    stockInfo.isBackOrderable = !!this.get('isbackorderable');
    return stockInfo;
});
``` 
@param Class the Class that has the method to override. (Class.prototype[methodName])
@param methodName the name of the method to override
@param newMethod the new method's implementation
@param dontCallSuper {boolean} if given it won't call `Class.prototype[methodName]` to get the original method's return value. false by default.
     */
    overrideInstanceMethod<T extends (typeof Function) & { prototype: any }, R extends any = any, RR extends any = any>
        (Class: T, methodName: string, newMethod: (this: T, returnValue: R) => RR, dontCallSuper?: boolean): void

    /**
     * Gets a url parameter value by name
     * @param name name of the param to obtain
     */
    urlParam(name: string): string | undefined

    /** 
     * Similar to overrideInstance but for View's getContext method. 
     * It will automatically call _,.extend() on the original getContext() return value and yours. Examples:
     * 
```
// with a function - this is the view instance and context the original class' getContext() result
awaUtil.extendViewContext(GlobalViewsStarRatingView, function (context) {
    return { 
        isInStockOrBackOrderable: this.model.getStockInfo().isInStock || this.model.getStockInfo().isBackOrderable 
    };
});

// just an object
awaUtil.extendViewContext(HomeView, {coolImages: config.get('my.cool.images')});
```
     */
    extendViewContext<T extends (typeof Function) & { prototype: any }, R extends ViewContext = ViewContext, RR extends R = R>
        (Class: T, newContextObjectOrFunction: ((this: T, returnValue: R) => RR) | ViewContext, dontCallSuper?: boolean): void

    debug: {

        /**
         * Simulates page generator turned on in the browser. Useful to quickly develop SEO related features.  
         * 
         * DONT do this in production! and don't rely on this alone - always test in the real thing. 
         * 
         * TIP: You can copy all the html with `copy(document.querySelector('html').outerHTML)`
         */
        simulatePageGenerator(enabled?: boolean): void

        /** returns true if the current website is served from shopping-local.ssp, checkout-local.ssp, etc */
        isLocalSsp(): boolean

        installHandlebarsDebugHelper(): void
    },

    dom: {
        /**
         * Returns $els matching selector `config.parent` that `config.containing` descendant elements matching `config.child` inside `root`element. Examples: 
```
var itemListElementThatDontContainItemPropPosition = getAncestorsContaining({
    root: 'body', 
    parent: '[itemprop="itemListElement"]', 
    child: '[itemprop="position"]', 
    containing: false
})
```
         */
        getAncestorsContaining(config: {root: string|JQuery|HTMLElement, parent: string, child: string, notContaining?: boolean}): JQuery 
    }
}

declare type ViewContext = { [name: string]: any }
