# Extended Rich Text Editor (Extended-RTE)<br/><br/>

# Objective:<br/>
This projects aims at developing a web based plugin which would cater the needs of the website
developers for developing an independent HTML editor with rich text capabilities. Using this plugin
will inturn reduce the development effort required to produce a complex web application with high user
interation. It can be easily customized as per requirements to suit the needs of different projects. The
idea has been succesfully tetsted and implemented in other projects.<br/><br/>

The Extended-RTE is comprised of some first of its kind features all packed in one plugin. Some
features and benefits offered by this plugin are:<br/>
1. Hyperlink's processing with custom callback function support which can be used RME(Rich media entry) suport for previewing summary data/thumbnail of pasted links.<br/>
2. Rich Emoticons library integrated.<br/>
4. Rich text editor (Basic HTML support).<br/><br/>

# Usage:<br/>

1. For Non-Angular Applications:<br/>
    
    1. Include `script.cdn.js` file to your HTML code:<br/>
        `<script type="text/javascript" src="https://gitcdn.link/repo/vineet-atlogys/plugins/master/extended-rte/script.cdn.js"></script>`<br/>
    2. Include `rte-module` to your HTML tag.<br/>
        `<html ng-app="rte-module">`<br/>
    3. Use '<extended-Rte>' tag where you whish to include the editor in your application.<br/>
        `<extended-Rte edi-id="textareaID2" edi-model="variable2"></extended-Rte>`<br/>
        Supported attribures:<br/>
        `edi-id="textareaID2"` (Attribute Type = String | Unique Id assigned to every editor instance.)<br/>
       ` edi-model="variable2"` (Attribute Type = Variable(type String) | Unique Variable assigned to every editor instance which holds the final editor value i.e HTML code.)<br/>
        `char-count-limit="2500"` (Attribute Type = int | Flag for showing the char count while you updating the editor's content)<br/>
        `linkcb="eRTE_handleRTELinkFn"` (Attribute Type = Variable(type Function) | Callback function used for autolink detection and link processing)<br/>

    Usage Example Links:<br/>
    https://gitcdn.link/repo/vineet-atlogys/plugins/master/demo/extended-rte/index.html
    https://raw.githubusercontent.com/vineet-atlogys/plugins/master/demo/extended-rte/index.html

# Demo:<br/>
    https://embed.plnkr.co/tXTnuhJYmApEZS2e033V/
    https://plnkr.co/edit/9uLH9bOQpL4TIzxJ3wle?p=preview
    https://embed.plnkr.co/9uLH9bOQpL4TIzxJ3wle/