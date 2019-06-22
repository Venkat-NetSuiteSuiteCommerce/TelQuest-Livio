# Usage

cp -r some/where/this-folder/awa-scripts some/sca/distribution/folder
cd some/sca/distribution/folder
npm install


# Commands

 * `npm run validate-es5` : validates all .js files (in JavaScript and SuiteScript folders) to be valid ecma version 5 (so no let, const, arrow functions exists in the code that break old browsers and SEO) 