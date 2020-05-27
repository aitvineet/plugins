# Extended Rich Text Editor (Extended-RTE)
This projects aims at developing a web based plugin which would cater the needs of website
developers for developing an independent HTML editor with rich text capabilities. Using this plugin
will inturn reduce the development effort required to produce a complex web application with high user
interactions. It can be easily customized as per requirements to suit the needs of different projects. The
idea has been succesfully tetsted and implemented in other projects.<br/>

The Extended-RTE is comprised of some first of its kind features all packed in one plugin. Some
features and benefits offered by this plugin are:<br/>
1. Processing Hyperlinks with custom callback function support that can be used as RME(Rich media entry) suport for previewing summary data/thumbnail of pasted links.<br/>
2. Rich Emoticons library integrated.<br/>
4. Rich text editor (Basic HTML support).<br/><br/>

# Getting Started:<br/>
Use Git or checkout with SVN using the web URL. Copy `extended-rte` folder in your app for including editor plugin.
https://github.com/vineet-atlogys/plugins.git<br/><br/>

# Installing:<br/>

## For non-Angular Applications:
1. Include `script.cdn.js` file to your `index.html`:<br/>
    `<script type="text/javascript" src="https://gitcdn.link/repo/vineet-atlogys/plugins/master/extended-rte/script.cdn.js"></script>`<br/>
2. Include `rte-module` to your HTML tag.<br/>
    `<html ng-app="rte-module">`<br/>
3. Use `<extended-Rte>` tag where you whish to include the editor in your application.<br/>
    `<extended-Rte edi-id="uniqueId" edi-model="modelVariable"></extended-Rte>`<br/>

## For Angular Applications:
1. Include files(that are not already included in your app) from `script.cdn.js` file to your `index.html`.<br/>
2. Include `rte-module` to Angular module.<br/>
   `angular.module( "exampleApp", ["rte-module"])`<br/>
3. Use `<extended-Rte>` tag where you whish to include the editor in your application.<br/>
    `<extended-Rte edi-id="uniqueId" edi-model="modelVariable"></extended-Rte>`<br/><br/>

## Supported attributes inside editor tag:<br/>
`edi-id="textareaID2"` (Attribute Type = `String` | Unique Id assigned to every editor instance.)<br/>
` edi-model="variable2"` (Attribute Type = `Variable(type String)` | Unique Variable assigned to every editor instance which holds the final editor value i.e HTML code.)<br/>
`char-count-limit="2500"` (Attribute Type = `int` | Flag for showing the char count while you updating the editor's content)<br/>
`linkcb="eRTE_handleRTELinkFn"` (Attribute Type = `Variable(type Function)` | Callback function used for autolink detection and link processing)<br/>

## Usage Example Links:<br/>
https://gitcdn.link/repo/vineet-atlogys/plugins/master/demo/extended-rte/index.html<br/>
https://raw.githubusercontent.com/vineet-atlogys/plugins/master/demo/extended-rte/index.html<br/><br/>

# Demo:<br/>
https://embed.plnkr.co/tXTnuhJYmApEZS2e033V/<br/>
https://plnkr.co/edit/9uLH9bOQpL4TIzxJ3wle?p=preview<br/>
https://embed.plnkr.co/9uLH9bOQpL4TIzxJ3wle/