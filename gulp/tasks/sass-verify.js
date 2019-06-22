/* jshint node: true */
/*
@module gulp.sass-verify
Small verification tool that will do the following verifications:
#Hardcoded colors
In general our source code shouldn't have hardcoded colors but instead all colors should be calculated from the _colors sass variables. This way it is easy to change the color palette of the skin by just changing sass variables values.
*/
'use strict';
var path = require('path')
,   gulp = require('gulp')
,   shell = require('shelljs')
,   glob = require('glob').sync
,   _ = require('underscore')
,   package_manager = require('../package-manager')
,   args   = require('yargs').argv;
function ignoreFile(f)
{
    return f.indexOf('third_parties')!==-1;
}
gulp.task('sass-verify', function (cb)
{
    var globs = package_manager.getGlobsFor('sass');
    var colorRegex = /#([\da-f]{3})|(rgba?\s*\()|(black)/i;
    var sassVariableDeclarationRegex = /^\s*\$/
    _.each(globs, function(g)
    {
        var moduleName = g.split('@')[0];
        moduleName = moduleName.substring(moduleName.lastIndexOf('/') + 1, moduleName.length);
        var files = glob(g);
        var hardcodedColors = {};
        _.each(files, function(f)
        {
            if(ignoreFile(f))
            {
                return;
            }
            var content = shell.cat(f);
            content = content.split('\n');
            _.each(content, function(line)
            {
                if(colorRegex.exec(line) && !sassVariableDeclarationRegex.exec(line))
                {
                    hardcodedColors[f] = hardcodedColors[f] || [];
                    hardcodedColors[f].push(line);
                }
            });
        });
        if(_.keys(hardcodedColors).length)
        {
            console.log('Module ', moduleName, 'contains hardcoded colors in files: ');
            console.log(hardcodedColors, '\n')
        }
    });
    cb();
});