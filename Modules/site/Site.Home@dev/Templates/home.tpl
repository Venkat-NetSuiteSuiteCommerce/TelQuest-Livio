{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}
<div class="home-slider-container clearfix">
    <div class="home-image-slider">

        <ul data-slider class="home-image-slider-list">
            {{#each homeSlides}}
                <li>
                    <div class="home-slide-main-container test">
                        {{#if fullUrlImage}}
                            <a href="{{fullUrlImage}}" class="home-slide-main-full-url"></a>
                        {{/if}}
                        <img src="{{imageUrl}}" alt="" class="home-slide-image desktop">
                        {{#if mobileImageUrl}}
                            <img src="{{mobileImageUrl}}" alt="" class="home-slide-image mobile">
                        {{/if}}
                        <div class="home-slide-caption">
                            <div class="home-slide-caption-container">
                                {{#if title}}
                                <div class="home-slide-caption-content">
                                    <h2 class="home-slide-caption-title">{{translate title}}</h2>
                                    <p>{{translate text}}</p>
                                    <div class="home-slide-caption-button-container">
                                        <a href="{{buttonURL}}" class="home-slide-caption-button">{{translate buttonText}}<i class="home-slide-button-icon"></i></a>
                                    </div>
                                </div>
                                {{/if}}
                            </div>
                        </div>
                    </div>
                </li>
            {{/each}}
            {{!--<li>
                <div class="home-slide-main-container" style="background-image: url('http://www.athq.com/images/A/panasonic-homepage.jpg')">
                    <img src="http://www.athq.com/images/A/panasonic-homepage.jpg" alt="" class="home-slide-image">
                    <div class="home-slide-caption">
                        <div class="home-slide-caption-content">
                            <h2 class="home-slide-caption-title">{{translate 'NEW POLYCOM FOR OFFICES'}}</h2>
                            <p>{{translate 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ullamcorper interdum tellus. Suspendisse cursus, dolor ac tristique euismod, massa libero laoreet nulla, quis euismod ipsum mauris blandit tellus. '}}</p>
                            <div class="home-slide-caption-button-container">
                                <a href="" class="home-slide-caption-button">{{translate 'LEARN MORE'}}<i class="home-slide-button-icon"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </li>

            <li>
                <div class="home-slide-main-container" style="background-image: url('http://www.athq.com/images/A/Why_ATHQ.jpg')">
                    <img src="http://www.athq.com/images/A/Why_ATHQ.jpg" alt="" class="home-slide-image">
                    <div class="home-slide-caption container">
                        <div class="home-slide-caption-content">
                            <h2 class="home-slide-caption-title">{{translate 'NEW POLYCOM FOR OFFICES'}}</h2>
                            <p>{{translate 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ullamcorper interdum tellus. Suspendisse cursus, dolor ac tristique euismod, massa libero laoreet nulla, quis euismod ipsum mauris blandit tellus. '}}</p>
                            <div class="home-slide-caption-button-container">
                                <a href="" class="home-slide-caption-button">{{translate 'LEARN MORE'}}<i class="home-slide-button-icon"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
            <li>
                <div class="home-slide-main-container" style="background-image: url('http://www.athq.com/images/A/FreeShipping-1132x377.jpg')">
                    <img src="http://www.athq.com/images/A/FreeShipping-1132x377.jpg" alt="" class="home-slide-image">
                    <div class="home-slide-caption container">
                        <div class="home-slide-caption-content">
                            <h2 class="home-slide-caption-title">{{translate 'NEW POLYCOM FOR OFFICES'}}</h2>
                            <p>{{translate 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ullamcorper interdum tellus. Suspendisse cursus, dolor ac tristique euismod, massa libero laoreet nulla, quis euismod ipsum mauris blandit tellus. '}}</p>
                            <div class="home-slide-caption-button-container">
                                <a href="" class="home-slide-caption-button">{{translate 'LEARN MORE'}}<i class="home-slide-button-icon"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
            <li>
                <div class="home-slide-main-container" style="background-image: url('http://www.athq.com/images/A/FreeShipping-1132x377.jpg')">
                    <img src="http://www.athq.com/images/A/FreeShipping-1132x377.jpg" alt="" class="home-slide-image">
                    <div class="home-slide-caption container">
                        <div class="home-slide-caption-content">
                            <h2 class="home-slide-caption-title">{{translate 'NEW POLYCOM FOR OFFICES'}}</h2>
                            <p>{{translate 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce ullamcorper interdum tellus. Suspendisse cursus, dolor ac tristique euismod, massa libero laoreet nulla, quis euismod ipsum mauris blandit tellus. '}}</p>
                            <div class="home-slide-caption-button-container">
                                <a href="" class="home-slide-caption-button">{{translate 'LEARN MORE'}}<i class="home-slide-button-icon"></i></a>
                            </div>
                        </div>
                    </div>
                </div>
            </li>
            --}}
        </ul>
    </div>
</div>
{{#unless isLoggedIn}}
    <div class="discount-banner" data-cms-area="promo-banner-area" data-cms-area-filters="path">

    </div>
{{/unless}}


<div class="home-container" itemscope itemtype="http://schema.org/Organization">
    <meta itemprop="name" content="ATHQ"></meta>
    <meta itemprop="url" content="{{canonical}}"></meta>
    <meta itemprop="description" content="{{description}}"></meta>
    <meta itemprop="logo" content="{{logoUrl}}"></meta>
    {{!--
    More schema.org information can be added here, like address, phone, email, currenciesAccepted, openingHours, paymentAccepted, priceRange, serviceArea, founder, foundingDate, hasPOS, legalName, location, parentOrganization, etc. See https://schema.org/Organization. Example:
    <meta itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
        <meta itemprop="streetAddress" content="38 avenue de l'Opera"></meta>
        <meta itemprop="postalCode" content="F-75002"></meta>
        <meta itemprop="addressLocality" content="Paris, France"></meta>
    </meta>
    <meta itemprop="telephone" content="( 33 1) 42 68 53 00"></meta>,
    <meta itemprop="faxNumber" content="( 33 1) 42 68 53 01"></meta>,
    <meta itemprop="email" content="secretariat(at)google.org"></meta>
    <meta itemprop="alumni" itemscope itemtype="http://schema.org/Person">
        <meta itemprop="name" content="Jack Dan"></meta>
    </meta> --}}

    {{#if isLoggedIn}}
        <div class="clearfix"></div>
    {{/if}}
    <div class="container">
        <div data-cms-area="home-title-1" data-cms-area-filters="path"></div>
        <div id="home-first-cms-content" class="home-first-cms-content carousel-merch" data-cms-area="home-first-cms-content" data-cms-area-filters="path"></div>
    </div>

    <div class="banner-container carousel-merch" data-cms-area="banner-container" data-cms-area-filters="path"></div>

    <div class="container">
        <div data-cms-area="home-title-2" data-cms-area-filters="path"></div>
        <div id="home-features-cms" class="home-features-cms carousel-merch" data-cms-area="home-features-cms" data-cms-area-filters="path"></div>
    </div>

    <div id="home-first-cms-content" class="banner-container carousel-merch" data-cms-area="second-banner-container" data-cms-area-filters="path"></div>


    <div class="container">

        <div data-cms-area="home-title-3" data-cms-area-filters="path"></div>
        <div id="home-features-cms" class="home-more-deals row carousel-merch" data-cms-area="home-more-deals" data-cms-area-filters="path">

        </div>
    </div>
</div>


{{!----
Use the following context variables when customizing this template:

	imageHomeSize (String)
	imageHomeSizeBottom (String)
	carouselImages (Array)
	bottomBannerImages (Array)

----}}
