{{!
   © 2017 NetSuite Inc.
   User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
   provided, however, if you are an authorized user with a NetSuite account or log-in, you
   may use this code subject to the terms that govern your access and use.
}}

<div data-cms-area="item_details_top_banner" data-cms-area-filters="page_type"></div>
<div class="product-details-full">
    <div data-cms-area="item_details_banner" data-cms-area-filters="page_type"></div>


    <article class="product-details-full-content" itemscope itemtype="https://schema.org/Product">
        <meta itemprop="url" content="{{itemUrl}}">
        <div id="banner-details-top" class="product-details-full-banner-top-details"></div>

        <section class="product-details-full-main-content">
            <div class="product-details-full-main-content-left">
                <div>
                    <h1 class="product-details-full-content-header-title" itemprop="name">{{pageHeader}}</h1>
                    <div data-view="Product.Sku"></div>
                    <div class="product-details-full-rating" data-view="Global.StarRating"></div>
                </div>

                <div class="product-details-full-image-gallery-container">
                    <div id="banner-image-top" class="content-banner banner-image-top"></div>
                    <div data-view="Product.ImageGallery"></div>
                    <div id="banner-image-bottom" class="content-banner banner-image-bottom"></div>
                    <div data-view="ProductBadges"></div>

                </div>
                <div class="clearfix"></div>
                {{#unless isLoggedIn}}
                    <div class="product-detail-full-cms-banner-area" data-cms-area="product-detail-full-cms-banner-area" id="product-detail-full-cms-banner-area" data-cms-area-filters="page_type"></div>
                {{/unless}}

            </div>

            <div class="product-details-full-main-content-right">
                <div class="product-details-full-content-header">
                    <div class="product-detail-cms-banner-area" data-cms-area="product-detail-cms-banner-area" id="product-detail-cms-banner-area" data-cms-area-filters="page_type"></div>

                    <div class="top-pdp-options" >
                        {{#if webstore_free_shipping}}
                            <img class="pdp-option"  src="https://www.telquestintl.com/site/freeshipping.png" ></img>
                        {{else}}
                            <img class="pdp-option" src="https://www.telquestintl.com/site/fastshipping.png" ></img>
                        {{/if}}
                        <button id="price_match_btn" class="price-request-button"><img class="price-request-image" src="https://www.telquestintl.com/site/pricematch.png" ></button>
                        <a target="_blank" class="pdp-option" href="https://www.telquestintl.com/return-policy"> <div ><img  src="https://www.telquestintl.com/site/30dayreturns.png" ></div></a>
                        <a target="_blank" class="pdp-option" href="https://www.telquestintl.com/telquest-rewards"> <div ><img  src="https://www.telquestintl.com/site/claimrewards.png"></div></a>
                    </div>
                    <hr>
                    <div class="product-detail-page-item-description">
                        {{{model.item.featureddescription}}}
                    </div>
                    <div class="product-detail-page-item-description">



                        {{!--  {{#unless isLoggedIn}}
                             <a data-target="fakeLogin">{{translate 'Login For Better Pricing'}}</a>
                         {{/unless}} --}}



                        {{!----  Div under product SKU    ----}}
                        <div data-cms-area="item_info" data-cms-area-filters="path"></div>
                        {{!---- Div under product sku for all product pages ----}}
                        <div data-cms-area="item_info_2" data-cms-area-filters="page_type"></div>
                    </div>

                    <div class="custom-pdp-section row">

                        <div class="col-md-6">

                            <section data-view="Product.Options"></section>
                            <div class="upsell-items" data-view="UpsellItems.Items"></div>
                        </div>

                        <div class="col-md-6 actions">
                            <div class="actions-container">
                                {{#if isPriceEnabled}}
                                    <p>{{vendor_stock_message}}</p>
                                    <div class="price-container">
                                        <div class="price-block" data-view="Product.Price"></div>
                                        <div  data-view="Quantity" class="quantity-block clearfix"></div>

                                    </div>

                                    <section class="product-details-full-actions">

                                        <div class="product-details-full-actions-container">
                                            {{#if showCart}}

                                                <div data-view="MainActionView"></div>
                                            {{/if}}
                                        </div>
                                        <br>
                                        <div data-view="ProductDetails.AddToQuote" class="product-details-full-actions-addtoquote"></div>
                                        <br>
                                        <div class="product-details-full-actions-container">

                                            <div data-view="AddToProductList" class="product-details-full-actions-addtowishlist"></div>

                                        </div>

                                    </section>
                                    {{!-- {{#if webstore_free_shipping}}
                                         <p class="free_shipping_banner"><i class="fa fa-truck"></i>  Free Shipping</p>
                                     {{/if}} --}}


                                {{/if}}
                            </div>

                            <div data-cms-area="payment_methods" data-cms-area-filters="page_type"></div>

                            <div data-cms-area="request_price_match" data-cms-area-filters="page_type"></div>

                            {{!---- cms box under social ----}}
                            <div data-cms-area="undersocial" data-cms-area-filters="page_type"></div>
                        </div>
                    </div>

                    <hr style="border-bottom: 1px solid #cccccc;">

                    <div data-view="SocialSharing.Flyout" class="product-details-full-social-sharing"></div>
                    <div data-view="PrintPage"></div>

                    <div class="product-details-full-main">
                        {{#if isItemProperlyConfigured}}
                            <form id="product-details-full-form" data-action="submit-form" method="POST">

                                <section class="product-details-full-info">
                                    <div id="banner-summary-bottom" class="product-details-full-banner-summary-bottom"></div>
                                </section>


                                <div data-view="Quantity.Pricing"></div>

                                <div data-view="Product.Stock.Info"></div>

                                <section data-view="Warranty.Options"></section>

                                <div data-view="StockDescription"></div>

                                <div class="product-details-full-main-bottom-banner">
                                    <div id="banner-summary-bottom" class="product-details-full-banner-summary-bottom"></div>
                                </div>
                            </form>
                        {{else}}
                            <div data-view="GlobalViewsMessageView.WronglyConfigureItem"></div>
                        {{/if}}

                    </div>
                </div>
            </div>
        </section>
        <div id="banner-details-bottom" class="product-details-full-banner-details-bottom" data-cms-area="item_info_bottom_path" data-cms-area-filters="path"></div>
        <div id="banner-details-bottom" class="product-details-full-banner-details-bottom" data-cms-area="item_info_bottom" data-cms-area-filters="page_type"></div>

    </article>
</div>

<div class="product-details-full-content-related-items">
    <div data-view="Related.Items"></div>
</div>

<div class="product-details-full-divider-desktop"></div>

<section data-view="Product.Information"></section>

<div class ="product-details-full">
    <article class="product-details-full-content" itemscope itemtype="https://schema.org/Product">

        <div id="banner-details-bottom" class="content-banner banner-details-bottom" data-cms-area="item_details_banner_bottom" data-cms-area-filters="page_type"></div>
    </article>

    <div data-view="ProductReviews.Center"></div>

    <div class="product-details-full-content-correlated-items">
        <div data-view="Correlated.Items"></div>
    </div>
</div>



{{!----
Use the following context variables when customizing this template:

   model (Object)
   model.item (Object)
   model.item.internalid (Number)
   model.item.type (String)
   model.quantity (Number)
   model.options (Array)
   model.options.0 (Object)
   model.options.0.cartOptionId (String)
   model.options.0.itemOptionId (String)
   model.options.0.label (String)
   model.options.0.type (String)
   model.location (String)
   model.fulfillmentChoice (String)
   pageHeader (String)
   itemUrl (String)
   isItemProperlyConfigured (Boolean)
   isPriceEnabled (Boolean)

----}}
