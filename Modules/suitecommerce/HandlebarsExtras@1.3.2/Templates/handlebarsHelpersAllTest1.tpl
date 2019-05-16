{{!
	© 2017 NetSuite Inc.
	User may not copy, modify, distribute, or re-bundle or otherwise make available this code;
	provided, however, if you are an authorized user with a NetSuite account or log-in, you
	may use this code subject to the terms that govern your access and use.
}}

{
	"description": "this template generates json using several combination of all handlebar helpers defined so we can test them :)",
	"translate": "{{translate 'hello $(0) $(1)' 'my' 'precious'}}",
	"formatCurrency": "{{formatCurrency '10000' '$'}}",
	"each1": "{{#each each1}}{{this}}, first: {{@first}}, last: {{@last}}, index: {{@index}} {{/each}}",
	"each2": "{{#each each2}}{{a}}{{/each}}",
	"each3": "{{#each each3}}{{a}}{{/each}}",
	"highlightKeyword": "{{highlightKeyword 'hello world' 'world'}}",
	"breaklines1": "{{breaklines breaklines1 }}",
	"ifEquals1": "ifEquals1:{{#ifEquals ifEquals1 ifEquals2}}noimprimo{{/ifEquals}}{{#ifEquals ifEquals1 ifEquals1}}siimprimo{{/ifEquals}}",
	"objectToAttributes1": "{{#with objectToAttributesData1}} {{objectToAttributes}} {{/with}}",
	"objectToAtrributes1": "{{#with objectToAttributesData1}} {{objectToAtrributes}} {{/with}}"
}