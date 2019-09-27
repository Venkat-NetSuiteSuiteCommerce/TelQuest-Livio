{{!
   © 2017 NetSuite Inc.
   User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
   provided, however, if you are an authorized user with a NetSuite account or log-in, you
   may use this code subject to the terms that govern your access and use.
}}

<div class="product-views-price">
    {{!--  <div>
          {{#unless isLoggedIn}}
              <a data-target="fakeLogin">{{translate 'Login For Better Pricing'}}</a>
          {{/unless}}
      </div>

   --}}
    {{#if showMessages}}
        {{#if isInStock}}
            <p class="stock-available-checkmark"><i class="fa fa-check"></i>  {{translate inStockMessage}}</p>
        {{else}}
            <p class="out-of-stock-message">{{translate outOfStockMessage}}</p>
        {{/if}}
    {{/if}}



    {{#each fakeMatrixPrices}}
        {{#if showComparePrice}}
            {{#if isNew}}
                <p class="table-product-ad-price">
                    {{translate 'Advertised Price: '}} <span class="product-views-price-old price-strike">{{comparePriceFormatted}}</span>
                </p>
            {{/if}}
        {{/if}}
    {{/each}}




    {{#if isPriceEnabled}}
        {{#if fakeMatrixPrices}}
            {{#each fakeMatrixPrices}}
                {{#if isNew}}
                    <div class="prices-internal-description">
                    <span class="product-views-price-exact" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
                    <meta itemprop="priceCurrency" content="{{currencyCode}}"/>
                        <!-- Single -->
                        {{#if showComparePrice}}
                            <p class="product-views-price-old table-product-ad-price">
                                {{translate 'Advertised Price:  '}} <span class="product-views-price-old price-strike">{{comparePriceFormatted}}</span>
                            </p>

                         {{!--   {{#if percentDiff}}
                                <div class="product-views-price-discount message-info">
                                    {{translate '$(0)% discount' percentDiff}}
                                </div>
                            {{/if}}

                          --}}
                        {{/if}}

                        {{#if OnlinePriceOnly}}
                            <p class="Online_Price_Only_Message">
                            <span> <i class="fas fa-dollar-sign"></i> {{translate 'Online Price Only'}} </span>
                            </p>
                        {{/if}}

                        <p class="product-views-price-lead" data-rate="{{price}}">
                            <span>{{translate 'Your Price'}}</span>
                            <p class="table-product-final-price" itemprop="price">{{priceFormatted}}


                        </p>

                         </span>

                        {{!--     <div >
                                  <span class="prices-internal-description-condition">{{custitem_awa_condition}}</span>
                              <i data-toggle="tooltip" class="cart-summary-expander-tooltip" title="{{# if isNew}}{{../newMessage}}{{/if}}" ></i>
                              </div>

                              --}}
                    </div>
                {{/if}}
            {{/each}}

            {{#if fakeMatrixPricesRecertified}}
                {{#each fakeMatrixPricesRecertified}}
                    {{#if isRecertified}}
                        <p class="stock-available used" data-rate="{{price}}">Used starting at: {{priceFormatted}}</p>
                    {{/if}}


                {{/each}}
            {{/if}}
        {{else if isPriceRange}}
            <span class="product-views-price-range" itemprop="offers" itemscope itemtype="https://schema.org/AggregateOffer">
            <meta itemprop="priceCurrency" content="{{currencyCode}}"/>
                <!-- Price Range -->
            <p class="product-detail-views-price-lead">
                {{translate '<span itemprop="lowPrice" data-rate="$(0)" >$(1)</span> to <span itemprop="highPrice" data-rate="$(2)">$(3)</span>' minPrice minPriceFormatted maxPrice maxPriceFormatted}}
            </p>
                {{#if showComparePrice}}
                    <small class="product-views-price-old">
                        {{comparePriceFormatted}}
                    </small>
                    {{#if percentDiff}}
                        <div class="product-views-price-discount message-info">
                            {{translate '$(0)% discount' percentDiff}}
                        </div>
                    {{/if}}
                {{/if}}
                <link itemprop="availability" href="{{#if isInStockOrBackOrderable}}https://schema.org/InStock{{else}}https://schema.org/OutOfStock{{/if}}"/>
         </span>

        {{else}}
        <div class="product-views-price-exact" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
            <meta itemprop="priceCurrency" content="{{currencyCode}}"/>
            <!-- Single -->
            <div class="prices-internal-description">


                {{#if showComparePrice}}
                    <p class="product-views-price-old table-product-ad-price">
                        {{translate 'Advertised Price:  '}}  <span class="price-strike">{{comparePriceFormatted}}</span>
                    </p>
                {{/if}}

                    {{#if price}}
                    <p class="product-views-price-lead" data-rate="{{price}}"></p>
                        <p class="your-price" itemprop="price">{{translate 'Your Price '}} {{priceFormatted}}</p>
                    {{else}}
                        <p class="out-of-stock-message">{{translate outOfStockMessage}}</p>
                    {{/if}}

              {{!--  {{#if percentDiff}}
                    <div class="product-views-price-discount message-info">
                        {{translate '$(0)% discount' percentDiff}}
                    </div>
                {{/if}}
               --}}
                <link itemprop="availability" href="{{#if isInStockOrBackOrderable}}https://schema.org/InStock{{else}}https://schema.org/OutOfStock{{/if}}"/>

            </div>
            </span>
        {{/if}}
    {{else}}

        {{#if showHighlightedMessage}}
            <div class="product-views-price-login-to-see-prices-highlighted">
                <p class="product-views-price-message">
                    {{translate 'Please <a href="$(0)">log in</a> to see price or purchase this item' urlLogin}}
                </p>
            </div>
        {{else}}
            <div class="product-views-price-login-to-see-prices">
                <p class="product-views-price-message">
                    {{translate '<a href="$(0)">Log in</a> to see price' urlLogin}}
                </p>
            </div>
        {{/if}}
    {{/if}}
</div>



    {{!----
    Use the following context variables when customizing this template:

        isPriceEnabled (Boolean)
        urlLogin (String)
        isPriceRange (Boolean)
        showComparePrice (Boolean)
        isInStock (Boolean)
        model (Object)
        model.item (Object)
        model.item.internalid (Number)
        model.item.type (String)
        model.quantity (Number)
        model.internalid (String)
        model.options (Array)
        model.options.0 (Object)
        model.options.0.cartOptionId (String)
        model.options.0.itemOptionId (String)
        model.options.0.label (String)
        model.options.0.type (String)
        model.options.0.values (Array)
        model.location (String)
        model.fulfillmentChoice (String)
        model.description (String)
        model.priority (Object)
        model.priority.id (String)
        model.priority.name (String)
        model.created (String)
        model.createddate (String)
        model.lastmodified (String)
        currencyCode (String)
        priceFormatted (String)
        comparePriceFormatted (String)
        minPriceFormatted (String)
        maxPriceFormatted (String)
        price (Number)
        comparePrice (Number)
        minPrice (Number)
        maxPrice (Number)
        showHighlightedMessage (Boolean)

    ----}}
