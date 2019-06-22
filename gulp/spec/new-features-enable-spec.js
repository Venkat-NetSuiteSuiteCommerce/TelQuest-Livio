var shell = require('shelljs')
    ,	package_manager = require('../package-manager')
    ,	exec = require('./exec')
    ,	path = require('path')

var newFeaturesToTest = [
    {
        configProperty: 'showTaxDetailsPerLine',
        expectedDefaultValue: false
    },
    {
        configProperty: 'isThreeDSecureEnabled',
        expectedDefaultValue: false
    },
    {
        configProperty: 'matrixchilditems.enabled',
        expectedDefaultValue: false
    }

];

describe('gulp configuration new features', function()
    {
        var manifestPath = path.join('LocalDistribution', 'configurationManifest.json');

        it('gulp configuration', function(done)
            {
                shell.rm('-rf', 'LocalDistribution');
                exec('gulp', ['configuration'], function(code)
                {
                    expect(code).toBe(0);
                    expect(shell.test('-f', manifestPath)).toBe(true);
                    done()
                });
            }
        );

        it('new features configuration default should match', function(done)
            {
                var manifest = JSON.parse(shell.cat(manifestPath));
                var result = '';

                newFeaturesToTest.map(function(newFeature)
                    {
                        var propertyFound;
                        manifest.map(function(entry)
                            {
                                var found = Object.keys(entry.properties || {}).find(function(property)
                                    {
                                        return property === newFeature.configProperty
                                    }
                                );
                                propertyFound = propertyFound || found;
                                if(found && entry.properties[found].default !== newFeature.expectedDefaultValue)
                                {
                                    result += '\nProperty "' + found.toString() + '" doesn\'t match expected default value. Is '+entry.properties[found].default+ ' and expected is '+ newFeature.expectedDefaultValue;
                                }
                            }
                        );
                        if(!propertyFound)
                        {
                            result += 'New feature property not found: '+newFeature.configProperty + '\n';
                        }
                    }
                );

                if(result)
                {
                    fail(result);
                }

                done();
            }
        );
    }
);
