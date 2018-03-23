(function() {


angular.module( 'rte-module', [] )


.filter('lengthWithoutHtmlTags', function() { 
    return  function(str, strLimit, strFormat){ 
        var tempResult=0, tempStrLimit=0;
        if ( strLimit && strLimit !== '' ) {
            tempStrLimit = parseInt(strLimit, 10);
        }
        if ( (str !== '') && (str !== undefined) && (str !== null) ) {
            str = String(str);
            str = str.replace(/<!--dataRMEContainerStart-->.*<!--dataRMEContainerEnd-->/g, "");
            str = str.replace(/<!--rte-preview-start((.|[\r\n])*?)<!--rte-preview-end.*?>/g, "");
            str = str.replace(/<[^>]+>/gm, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/g, "");
            var txt = document.createElement("textarea");
            txt.innerHTML = str;
            tempResult = txt.value.length;
            if ( tempStrLimit ) {
                tempResult = ( tempStrLimit - tempResult );
            }
            if ( strFormat ) {
                var tempClass = 'error';
                if ( tempResult >= 0 ){
                    tempClass = '';
                }
                tempResult = '<span class="'+tempClass+'">'+tempResult+' characters left</span>';
            }
            return tempResult;
        }
        else {
            tempResult = 0;
            if ( tempStrLimit ) {
                tempResult = ( tempStrLimit - tempResult );
            }
            if ( strFormat ) {
                tempResult = '<span>'+tempResult+' characters left</span>';
            }
            return tempResult;
        }
    };
})


.filter('trustAsHtmlFilter', function($sce) { 
    return  function(str){ 
        return $sce.trustAsHtml(str);
    };
})


.service('dirtyFormService', function() {

    var dirtyFormFlg = null;

    var getDirtyFormFlg = function(){
        return dirtyFormFlg;
    };

    var setDirtyFormFlg = function(setVal, incFlg) {
        if ( incFlg ) {
            if ( setVal ) {
                if ( !dirtyFormFlg ) {
                    dirtyFormFlg = 0;
                }
                dirtyFormFlg++;
            }
            else {
                dirtyFormFlg--;
                if ( dirtyFormFlg < 0 ) {
                    dirtyFormFlg = 0;
                }
            }
            //console.log('setDirtyFormFlg INC:', dirtyFormFlg, setVal, incFlg);
        }
        else {
            dirtyFormFlg = setVal;
            //console.log('setDirtyFormFlg:', dirtyFormFlg, setVal, incFlg);
        }
    };

    return {
        getDirtyFormFlg: getDirtyFormFlg,
        setDirtyFormFlg: setDirtyFormFlg
    };

})


.service('apiService', function( $http, $window ) {

    var isMobile = function() {
        if ( navigator.userAgent.match(/Android/i) ||
                navigator.userAgent.match(/BlackBerry/i) ||
                navigator.userAgent.match(/iPhone|iPad|iPod/i) ||
                navigator.userAgent.match(/Opera Mini/i) ||
                navigator.userAgent.match(/IEMobile/i) ||
                navigator.userAgent.match(/Windows Phone/i) ||
                $(window).width() < 944) {
            return true;
        }
        else {
            return false;
        }
    };

    var scrollToEleView = function ( eleIdentifier, UAObj, anchorTopFlg ) {

        if ( eleIdentifier && eleIdentifier !== '' ) {
            var ele = document.querySelector( eleIdentifier );
            if ( ele ) {
                var UA = UAObj ? UAObj : getUserAgent();
                if ( UA && (UA.isFirefox || UA.isChrome) ) {
                    ele.scrollIntoView({behavior: "smooth", block: "center", inline: "nearest"});
                }
                else {
                    ele.scrollIntoView( anchorTopFlg ? anchorTopFlg : false );
                }
            }
        }
    };

    var getUserAgent = function () {

        if ( getSessionStorage().cachedUA ) {
            return JSON.parse( getSessionStorage().cachedUA );
        }

        var userAgentObj = false;
        var UA = window.navigator.userAgent;
        if ( UA ) {
            userAgentObj = {};
            userAgentObj[ 'isMobile' ] = isMobile();
            userAgentObj[ 'isFirefox' ] = UA.indexOf('Firefox/') > -1 ? true : false;
            userAgentObj[ 'isChromeOnIphone' ] = UA.indexOf('CriOS') > -1 ? true : false;
            userAgentObj[ 'isChrome' ] = ( UA.indexOf('Chrome/') > -1 || 
                userAgentObj[ 'isChromeOnIphone' ] ) ? true : false;
            userAgentObj[ 'isSafari' ] = ( UA.indexOf('Safari/') > -1 && 
                !userAgentObj[ 'isChrome' ] ) ? true : false;
            userAgentObj[ 'isIE' ] = UA.indexOf('MSIE') > -1 ? true : false;
        }
        getSessionStorage().cachedUA =  JSON.stringify( userAgentObj );
        return userAgentObj;
    };

    var getSessionStorage = function(){
        return $window.sessionStorage;
    };

    var extractURL = function() {
        return {
            method: 'GET',
            //url: "https://api.embed.ly/1/extract?key=:9b9cb98708c9443f9c643dd9d1a41653&url=http://techcrunch.com/2010/11/18/mark-zuckerberg/&maxwidth=500",
            //url: "https://api.embed.ly/1/extract?key=9b9cb98708c9443f9c643dd9d1a41653&url=@id",
            url: "https://api.embed.ly/1/oembed?key=9b9cb98708c9443f9c643dd9d1a41653&url=@id",
            dataType: 'json',
            stopTracking: true,
            params: {
                //key: '9b9cb98708c9443f9c643dd9d1a41653',
                //url: 'http://techcrunch.com/2010/11/18/mark-zuckerberg/&maxwidth=500'
            }
            //,headers:  apiService.getLoggedInHttpHeader(),
        };
    };

    var submitRequest = function(aRequest) {
        return $http(aRequest);
    };

    var processResponse = function(aResponse) {
        return  aResponse.data;
    };

    return {
        isMobile : isMobile,
        scrollToEleView : scrollToEleView,
        getUserAgent : getUserAgent,
        extractURL : extractURL,
        submitRequest : submitRequest,
        processResponse : processResponse
    };

})


// Advanced RTE TinyMCE Start..
.directive( 'extendedRte', function ( $compile ) {

    var testTemplate2 =
        '<div id="@@@RTEMainID@@@" class="hide-rte-main {{!getgrpobj() ? \'upload-doc-btn\' : \'\'}}">' +
        ' <div ng-show="disableTextArea && aRTECtrl.initLoadFlg" class="hide-rte-top">' +
        '  {{aRTECtrl.disabledText}}' +
        ' </div>' +
        ' <div class="{{disableTextArea ? \'textarea-hide\' : \'\' }}">' +
        '  <div class="textEditorStyle {{(focusBorder && aRTECtrl.hasFocus) ? aRTECtrl.hasFocus : \'\' }} {{(aRTECtrl.hidemenubarFlg) ? aRTECtrl.hidemenubarFlgCls : \'\' }}">' +
        '   <div id="@@@masterDivID@@@" ng-init="aRTECtrl.init()">' +
        '    <div class="containerClassImp @@@classid@@@"></div>' +
        '   </div>' +
        '   <div class="rmeBlock" ng-if="aRTECtrl.rmeSupportFlg && aRTECtrl.getModelRMEVal().length">' +
        '       <div class="field-container"><div class="textEditorImg">' +
        '           <a class="icon-close-active right" title="Remove Image" ng-click="aRTECtrl.resetRMEImg()" ng-if="aRTECtrl.modelDataRMEImg.length"></a>' +
        '           <span ng-bind-html="aRTECtrl.modelDataRMEImg"></span>' +
        '           </div><div class="textEditorContent">' +
        '           <a class="icon-close-active right" title="Remove HTML" ng-click="aRTECtrl.resetRMEData()" ng-if="aRTECtrl.modelDataRMEData.length"></a>' +
        '           <span ng-bind-html="aRTECtrl.modelDataRMEData"></span>' +
        '       </div></div>' +
        '   </div>' +
        '   <span ng-if="charCountLimit && (!aRTECtrl.hidemenubarFlg || aRTECtrl.focusActive)" class="count-width" '+
        '       ng-bind-html="ediModel | lengthWithoutHtmlTags : charCountLimit:1 | trustAsHtmlFilter ">'+
        '   </span>'+
        '   <div ng-if="submitText && ((!aRTECtrl.hidemenubarFlg) || aRTECtrl.showSaveBtnHiddenMenu)" class="rte-cancel-reply-btn">' +
        '       <span class="no-fill">' +
        '           <a href title="Cancel" ng-click="aRTECtrl.cancelFunc();">' +
        '               <span class="label-title">Cancel</span>' +
        '           </a>' +
        '       </span>' +
        '       <span class="save-comment">' +
        '           <a href title="{{submitText}}" ng-click="submitFunc();">' +
        '               <span class="label-title">' +
        '                   {{submitText}}' +
        '               </span>' +
        '           </a>' +
        '       </span>' +
        '    </div>' +
        '    <div class="delete-frame padding-0" ng-if="aRTECtrl.rmeSupportFlg && aRTECtrl.getModelRMELinkVal().length">'+
        '       <div class="margin-20 padding-20 show-icon-hover {{aRTECtrl.getModelRMELinkVal().length - 1 !== $index ? \'border-bottom-1px\': \'\'}}" '+
        '           ng-repeat="modelRMEVal in aRTECtrl.getModelRMELinkVal() | orderBy: \'timestamp\':true" >' +
        '           <div class="delete-icon-rte" ng-click="aRTECtrl.removeModelRMELink($index);"></div>' +
        '               <div class="thick-border">' +
        '               <div class="position-relative tinymcd-img image-delete-rme" ng-if="modelRMEVal.image && modelRMEVal.image!==\'\'">' +
        '                   <div class="delete-icon-rte" ng-click="aRTECtrl.removeModelRMELink($index, true);"></div>' +
        '                   <div ng-bind-html="modelRMEVal.image"></div>' +
        '               </div>'+
        '               <div ng-bind-html="modelRMEVal.data"></div>' +
        '               <div class="clearfix"></div>' +
        '           </div>' +
        '       </div>' +
        '    </div>'+
        '    <div>' +

        '       <div ng-if="aRTECtrl.previewMode" class="modal">' +
        '           <div class="modal-content column-gutter6">' +
        '               <div class="group-info"><div class="heading-group"><h2>Preview</h2></div>' +
        //'               <div class="textEditorPreview" img-Expand-Dir ng-model="aRTECtrl.getFullModelValData" is-preview=true></div>' +
        '               <div class="textEditorPreview" ng-bind-html="aRTECtrl.getFullModelValData | trustAsHtmlFilter"></div>' +
        '               <div style="clear:both" ng-click="aRTECtrl.updatePrvMode(false);" class="btn right">OK </div>' +
        '               </div>' +
        '           </div>' +
        '       </div>' +
        

        '   </div>' +
        '  </div><div class="clearfix"></div>' +
        ' </div>' +
        '</div>';

    var linker = function ( scope, element, attrs ) {
        element.html( testTemplate2.replace( '@@@classid@@@', scope.ediId + 'class' ). 
            replace( '@@@RTEMainID@@@', 'RTEMainID_' +scope.ediId ). 
            replace( '@@@masterDivID@@@', scope.ediId + 'contdiv' ). 
            replace( '@@@imagefilesId@@@', scope.ediId +'imagefilesId' ) );//.show();
        $compile( element.contents() )( scope );
    };

    return {
        restrict: 'E',
        //templateUrl: "demo/ng-examples/adv-ckeditor.tpl.html",
        controller: "RTECtrl",
        controllerAs: "aRTECtrl",
        scope: {
            ediId: "@",
            ediClass: "@",
            ediModel: "=",
            rmeSupport: "=",
            focusFlg: "=",
            inlineFlg: "=",
            vanillaflg: "=",
            editorLoadDef: "=",
            annoFlg: "=",
            placeHolder: "@",
            modelWatch: "=",
            hideonblurflg: "=",
            hideonblurfn: "&",
            hideonblurmodel: "=",
            hidepreviewflg: "=",
            reportdirty: "=",
            dirtyfrmincflg: "=",
            reportdirtyactive: "=?",
            fieldName: "@",
            resetfn: "=",
            disableTextArea: "=",
            disableCustomLink: "=",
            getgrpobj: "=",
            getgrpobjWatch: "=",
            // showAddAttachmentBtn : "=",
            focusBorder: "=",
            hideToolbar: "=",
            docObjMap: "=",
            newtoolbar: "=",
            hidemenubarFlg: "=",
            cancelFunc: "&?",
            submitFunc: "&",
            submitText: "=",
            charCountLimit: "=",
            scrollFlg: "=",
            clearOnCancel: "="
        },
        link: linker
    };

} )
.controller( 'RTECtrl', function RTECtrl( $scope, $filter, 
    $location, $timeout, $anchorScroll, $http, apiService, dirtyFormService ) {

    var ctrl = this;
    ctrl.objId = '';
    ctrl.objClass = '';
    ctrl.modelDataVal = '';
    ctrl.modelDataRTEVal = '';
    ctrl.modelDataRMEVal = '';
    ctrl.modelDataRMEImg = '';
    ctrl.modelDataRMEData = '';
    ctrl.rmeUrl = '';
    ctrl.rmeSupportFlg = false;
    ctrl.focusFlg = true;
    ctrl.focusDone = false;
    ctrl.inlineFlg = false;
    ctrl.previewMode = false;
    ctrl.customImgUpldMode = false;
    ctrl.imageFiles = false;
    ctrl.imageFileList = [];
    ctrl.imageFileUploadMessage = false;
    ctrl.mainEditorObj = false;
    ctrl.getFullModelValData = '';
    ctrl.annoFlg = false;
    ctrl.modelUpdateSetValFlg = false;
    ctrl.vanillaFlg = false;
    ctrl.vanillaLoadFlg = false;
    ctrl.vanillaLoadFlg = false;
    ctrl.placeHolder = "";
    ctrl.placeHolderFlg = false;
    ctrl.modelWatchFlg = false;
    ctrl.showEditorflg = true;
    ctrl.hideonblurflg = false;
    ctrl.hidePreviewFlg = false;
    ctrl.reportDirtyFlg = false;
    ctrl.dirtyFrmIncFlg = false;
    ctrl.fieldName = false;
    ctrl.resetFieldFn = false;
    ctrl.updateByWatch = false;
    ctrl.custLinkFlg = false;
    ctrl.custLinkPopFlg = false;
    ctrl.custLinkUrl = '';
    ctrl.custLinkTxt = '';
    ctrl.custLinkUrlTxtSameFlg = true;
    ctrl.custLinkTxtChangeFlg = false;
    ctrl.custLinkObj = false;
    ctrl.disableCustomLink = false;
    ctrl.linksArrToShow = [];
    ctrl.loadObjType = '0';
    ctrl.localWaitingOnServer = false;
    ctrl.searchTxt = '';
    ctrl.searchTxtOrg = '';
    ctrl.initLoadFlg = false;
    ctrl.selGroupObj = false;
    ctrl.currParentNode = false;
    // ctrl.showAddAttachment = false;
    ctrl.hideToolbar = false;
    ctrl.docObjMap = false;
    ctrl.newToolbar = true;
    ctrl.hidemenubarFlg = false;
    ctrl.emojiClick = false;

    var urlName = $location.$$path;

    var getUrlText = function ( url ) {
        var urlText = '',
            tempUrl = '';

        tempUrl = url.split( '/' );
        if ( tempUrl[ 1 ] && tempUrl[ 1 ] !== '' ) {
            url = tempUrl[ 1 ];
        }

        switch ( url ) {
        case 'createDiscussions':
            urlText = 'Discussion prior to adding the Discussion Detail.';
            break;

        case 'create-status':
            urlText = 'Status prior to adding the Status Update.';
            break;

        case 'event-entry':
            urlText = 'Event prior to adding the Event Description.';
            break;

        default:
            break;
        }
        return urlText;
    };

    ctrl.getExtensionIcon = function ( fileName ) {
        return apiService.getExtensionIcon( fileName );
    };

    ctrl.disabledText = "Please select the destination (Group or People) for this " +
        getUrlText( urlName );

    ctrl.init = function () {
        if ( !angular.isUndefined( $scope.ediId ) && ( $scope.ediId !== '' ) ) {
            ctrl.objId = $scope.ediId;
        }
        if ( !angular.isUndefined( $scope.ediClass ) && ( $scope.ediClass !== '' ) ) {
            ctrl.objClass = $scope.ediClass;
        }
        if ( !angular.isUndefined( $scope.rmeSupport ) && ( $scope.rmeSupport !== '' ) ) {
            ctrl.rmeSupportFlg = $scope.rmeSupport;
        }
        if ( !angular.isUndefined( $scope.placeHolder ) && ( $scope.placeHolder !== '' ) ) {
            ctrl.placeHolder = "<p class='status-placeholder'>" + $scope.placeHolder + '</p>';
        }
        if ( !angular.isUndefined( $scope.modelWatch ) ) {
            ctrl.modelWatchFlg = $scope.modelWatch;
        }
        ctrl.showEditorflg = true;
        if ( !angular.isUndefined( $scope.hideonblurflg ) ) {
            ctrl.hideonblurflg = $scope.hideonblurflg;
        }
        if ( !angular.isUndefined( $scope.disableCustomLink ) ) {
            ctrl.disableCustomLink = $scope.disableCustomLink;
        }
        if ( !angular.isUndefined( $scope.hideToolbar ) ) {
            ctrl.hideToolbar = $scope.hideToolbar;
        }
        if ( !angular.isUndefined( $scope.newtoolbar ) ) {
            ctrl.newToolbar = true;
        }
        if ( !angular.isUndefined( $scope.getgrpobj ) ) {
            ctrl.selGroupObj = $scope.getgrpobj();
        }
        if ( !angular.isUndefined( $scope.ediModel ) && ( $scope.ediModel !== '' ) && ( $scope.ediModel !==
                null ) ) {
            if ( ctrl.rmeSupportFlg ) {
                //var matchPatternRTE = /<!--dataRTEContainerStart-->((.|[\r?\n|\r|\s])*?)<!--dataRTEContainerEnd-->/i;
                var matchPatternRTE = /<!--dataRTEContainerStart-->([\s\S]*?)<!--dataRTEContainerEnd-->/i;
                matchesArrRTE = ( $scope.ediModel ).match( matchPatternRTE );
                if ( matchesArrRTE !== null ) {
                    ctrl.modelDataRTEVal = matchesArrRTE[ 1 ];
                    var matchPattern = /href="([^"]*)/i;
                    if ( matchPattern.test( ctrl.modelDataRTEVal ) ) {
                        var getHref = ( ctrl.modelDataRTEVal ).match( /href="([^"]*)/ )[ 1 ];
                        if ( ctrl.retrievedLink !== getHref ) {
                            ctrl.retrievedLink = getHref;
                        }
                    }
                }

                var matchPatternRME =
                    /<!--dataRMEContainerStart--><div class="rmePreview"><a href="(\S*?)" target="_blank"><\/a>(.*?)<\/div><!--dataRMEContainerEnd-->/i;
                matchArrRME = ( $scope.ediModel ).match( matchPatternRME );

                extractRMELink();

                if ( matchArrRME !== null ) {
                    ctrl.rmeUrl = matchArrRME[ 1 ];
                    ctrl.modelDataRMEVal = matchArrRME[ 2 ];

                    var matchPatternRMEImg = /<!--valRMEImgStart-->(.*?)<!--valRMEImgEnd-->/i;
                    matchArrRMEImg = ( ctrl.modelDataRMEVal ).match( matchPatternRMEImg );
                    if ( matchArrRMEImg !== null ) {
                        ctrl.modelDataRMEImg = matchArrRMEImg[ 1 ];
                    }

                    var matchPatternRMEVal = /<!--valRMEDataStart-->(.*?)<!--valRMEDataEnd-->/i;
                    matchArrRMEVal = ( ctrl.modelDataRMEVal ).match( matchPatternRMEVal );
                    if ( matchArrRMEVal !== null ) {
                        ctrl.modelDataRMEData = matchArrRMEVal[ 1 ];
                    }
                } else if ( matchesArrRTE === null ) {
                    ctrl.modelDataRTEVal = $scope.ediModel;
                }
            } else {
                ctrl.modelDataRTEVal = $scope.ediModel;
            }
        }
        if ( !angular.isUndefined( $scope.focusFlg ) ) {
            ctrl.focusFlg = $scope.focusFlg;
        }
        if ( !angular.isUndefined( $scope.inlineFlg ) && ( $scope.inlineFlg ) ) {
            ctrl.inlineFlg = $scope.inlineFlg;
        }
        if ( !angular.isUndefined( $scope.vanillaflg ) && ( $scope.vanillaflg ) ) {
            ctrl.vanillaFlg = $scope.vanillaflg;
        }
        if ( !angular.isUndefined( $scope.annoFlg ) && ( $scope.annoFlg ) ) {
            ctrl.annoFlg = $scope.annoFlg;
        }
        if ( !angular.isUndefined( $scope.hidepreviewflg ) ) {
            ctrl.hidePreviewFlg = $scope.hidepreviewflg;
        }
        if ( !angular.isUndefined( $scope.reportdirty ) ) {
            ctrl.reportDirtyFlg = $scope.reportdirty;
        }
        if ( !angular.isUndefined( $scope.dirtyfrmincflg ) ) {
            ctrl.dirtyFrmIncFlg = $scope.dirtyfrmincflg;
        }
        if ( !angular.isUndefined( $scope.fieldName ) && ( $scope.fieldName !== '' ) ) {
            ctrl.fieldName = $scope.fieldName;
        }
        if ( !angular.isUndefined( $scope.resetfn ) ) {
            ctrl.resetFieldFn = $scope.resetfn;
        }
        // if( !angular.isUndefined( $scope.showAddAttachmentBtn ) ) {
        //     ctrl.showAddAttachment = $scope.showAddAttachmentBtn;
        // }

        if ( !angular.isUndefined( $scope.hidemenubarFlg ) && ( $scope.hidemenubarFlg ) ) {
            ctrl.hidemenubarFlg = $scope.hidemenubarFlg;
        }

        if ( !angular.isUndefined( $scope.docObjMap ) ) {
            ctrl.docObjMap = $scope.docObjMap;
        }

        if ( !ctrl.vanillaFlg ) {
            ctrl.loadVanillaEditor();
        }
    };

    $scope.$on( '$destroy', function () {
        if ( $scope.reportdirtyactive ) {
            $scope.reportdirtyactive = false;
            dirtyFormService.setDirtyFormFlg( false, ctrl.dirtyFrmIncFlg );
        }
    } );

    var setDocResMapData = function () {
        ctrl.calSelectedGroupFn( true );
        var tempData = {};
        tempData[ 'object_id' ] = ctrl.docObjMap.id;
        tempData[ 'object_type' ] = 7;
        var tempObjMap = ctrl.searchDDMaps[ '7' ];
        var tempResMap = ctrl.docObjMap;

        tempData[ 'image' ] = tempObjMap.dd_image;
        tempData[ 'redirectUrl' ] = '/' + tempObjMap.dd_url + '/';
        tempData[ 'link' ] = tempObjMap.dd_url + '/';
        tempData[ 'resource_map_min' ] = tempResMap;

        tempData[ 'name' ] = tempResMap.Metadata.title;
        tempData[ 'id' ] = tempResMap.document_id;
        tempData[ 'groupId' ] = tempResMap.Discussion.group_id;
        tempData[ 'adhocId' ] = ( tempResMap.Discussion.type == 2 ) ? tempData[ 'groupId' ] : 0;

        tempData[ 'link' ] = tempData.link + tempData.id;
        if ( tempData.redirectUrl == '/document-detail/' ) {
            tempData[ 'link' ] += '/' + tempData.adhocId + '/' + tempData.groupId;
        }

        tempData[ 'link' ] = ctrl.windowHref + '#/' + tempData[ 'link' ];

        ctrl.custLinkInsertFn( 3, tempData );
    };

    ctrl.getFullModelVal = function () {
        return ctrl.buildFullModelRMELinkVal();
    };

    ctrl.getModelVal = function () {
        return ctrl.modelDataRTEVal;
    };

    ctrl.setModelRMEVal = function ( dataRME ) {
        ctrl.modelDataRMEVal = dataRME;
    };

    ctrl.getModelRMEVal = function () {
        return ctrl.modelDataRMEVal;
    };

    ctrl.loadVanillaEditor = function () {
        ctrl.initTMCE();
        ctrl.vanillaLoadFlg = true;

        //tinymce.execCommand('mceFocus',false,'advTmceEditorID');
        //tinyMCE.get('advTmceEditorID').focus();
        //tinyMCE.activeEditor.focus();
        //setTimeout(function () { 
        //  tinyMCE.get('advTmceEditorID').focus();
        //  tinyMCE.get(ctrl.objId).focus();
        //},333);
    };

    ctrl.updatePrvMode = function ( setVal ) {
        if ( !setVal ) {
            ctrl.focusDone = false;
            setTimeout( function doFocus() {
                if ( !ctrl.focusDone ) {
                    var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
                    tinymce.get( tempele ).focus();
                    setTimeout( doFocus, 100 );
                }
            }, 100 );
        }
        $timeout( function () {
            $scope.$apply( function () {
                ctrl.previewMode = setVal;
            } );
        } );
    };

    ctrl.custImgUpload = function ( setVal ) {
        ctrl.setAddImagePopupVal( true );
        $scope.$apply( function () {
            ctrl.customImgUpldMode = setVal;
        } );
    };

    $scope.$watch( 'ediModel', function ( ediModel ) {
        if ( ( ediModel === null ) || angular.isUndefined( ediModel ) ) {
            ctrl.modelUpdateSetValFlg = true;
            //$scope.ediModel = '';
            //tinymce.execCommand('updateEditorVal', '');
        } else if ( ( ediModel === '#@#Reset#@#' ) ) { // || (ediModel === '') 
            $scope.ediModel = '';
            tinymce.execCommand( 'updateEditorVal', '' );
        } else if ( ctrl.modelUpdateSetValFlg && ctrl.modelWatchFlg ) {
            ctrl.modelUpdateSetValFlg = false;
            //$scope.ediModel = ediModel;
            //ctrl.init();
            if ( !angular.isUndefined( $scope.ediModel ) && ( $scope.ediModel !== '' ) ) {
                ctrl.updateByWatch = true;
                if ( ctrl.rmeSupportFlg ) {
                    //var matchPatternRTE = /<!--dataRTEContainerStart-->((.|[\r?\n|\r|\s])*?)<!--dataRTEContainerEnd-->/i;
                    var matchPatternRTE =
                        /<!--dataRTEContainerStart-->([\s\S]*?)<!--dataRTEContainerEnd-->/i;
                    matchesArrRTE = ( $scope.ediModel ).match( matchPatternRTE );
                    if ( matchesArrRTE !== null ) {
                        ctrl.modelDataRTEVal = matchesArrRTE[ 1 ];
                        //console.log('setting value-2 ',matchesArrRTE[1]);
                        //console.log('setting value-3 ',ctrl.modelDataRTEVal);
                        tinymce.execCommand( 'updateEditorVal', ctrl.modelDataRTEVal );
                        var matchPattern = /href="([^"]*)/i;
                        if ( matchPattern.test( ctrl.modelDataRTEVal ) ) {
                            var getHref = ( ctrl.modelDataRTEVal ).match( /href="([^"]*)/ )[ 1 ];
                            if ( ctrl.retrievedLink !== getHref ) {
                                ctrl.retrievedLink = getHref;
                            }
                        }
                    }

                    var matchPatternRME =
                        /<!--dataRMEContainerStart--><div class="rmePreview"><a href="(\S*?)" target="_blank"><\/a>(.*?)<\/div><!--dataRMEContainerEnd-->/i;
                    matchArrRME = ( $scope.ediModel ).match( matchPatternRME );

                    extractRMELink();

                    if ( matchArrRME !== null ) {
                        ctrl.rmeUrl = matchArrRME[ 1 ];
                        ctrl.modelDataRMEVal = matchArrRME[ 2 ];

                        var matchPatternRMEImg = /<!--valRMEImgStart-->(.*?)<!--valRMEImgEnd-->/i;
                        matchArrRMEImg = ( ctrl.modelDataRMEVal ).match( matchPatternRMEImg );
                        if ( matchArrRMEImg !== null ) {
                            ctrl.modelDataRMEImg = matchArrRMEImg[ 1 ];
                        }

                        var matchPatternRMEVal = /<!--valRMEDataStart-->(.*?)<!--valRMEDataEnd-->/i;
                        matchArrRMEVal = ( ctrl.modelDataRMEVal ).match( matchPatternRMEVal );
                        if ( matchArrRMEVal !== null ) {
                            ctrl.modelDataRMEData = matchArrRMEVal[ 1 ];
                        }
                    } else if ( matchesArrRTE === null ) {
                        ctrl.modelDataRTEVal = $scope.ediModel;
                        tinymce.execCommand( 'updateEditorVal', ctrl.modelDataRTEVal );
                    }
                } else {
                    ctrl.modelDataRTEVal = $scope.ediModel;
                    tinymce.execCommand( 'updateEditorVal', ctrl.modelDataRTEVal );
                }
            }
        }
    } );


    var extractRMELink = function() {

        var matchRMELinkContainer = 
            /<!--dataRMELinkContainerStart-->(.*?)<!--dataRMELinkContainerEnd-->/i;

        var matchArrRME = ( $scope.ediModel ).match( matchRMELinkContainer );

        var matchPatternRMELink = 
            /<!--rte-preview-start-link-->(.*?)<!--rte-preview-end-link-->/ig;

        if( matchArrRME !== null ) {
            
        matchRMELinkArr = ( matchArrRME[0] ).match(matchPatternRMELink);

        if( matchRMELinkArr !== null ) {
            ctrl.modelRMELinkVal = [];
            var rmeData;
            for(var i in matchRMELinkArr) {
                rmeData = {};
                var matchPatternRMEImgNew = /<!--rte-start-link-image-->(.*?)<!--rte-end-link-image-->/ig;
                matchArrRMEImg = ( matchRMELinkArr[i] ).match( matchPatternRMEImgNew );
                
                if ( matchArrRMEImg !== null && matchArrRMEImg.length) {
                    rmeData.image = (matchArrRMEImg[0]).
                        replace('<!--rte-start-link-image-->','').
                        replace('<!--rte-end-link-image-->','');
                }

                var matchPatternRMEValNew = /<!--rte-start-link-data-->(.*?)<!--rte-end-link-data-->/ig;
                matchArrRMEVal = ( matchRMELinkArr[i] ).match( matchPatternRMEValNew );

                if ( matchArrRMEVal !== null && matchArrRMEVal.length ) {
                    rmeData.data = matchArrRMEVal[0].
                        replace('<!--rte-start-link-data-->','').
                        replace('<!--rte-end-link-data-->','');
                }

                ctrl.setModelRMELinkVal(rmeData);
            }

        }
        }
    };


    ctrl.setAddImagePopupVal = function ( addImagePopupVal ) {
        if ( addImagePopupVal ) {
            $( "#uploadImageModal_"+ctrl.objId ).addClass( 'display-none' );
            $timeout( function () {
                $( '#' + ctrl.objId + 'imagefilesId' ).trigger( 'click' );
            } );
        }
    };

    var fileChooseEventId = document.getElementById( ctrl.objId + 'imagefilesId' );

    if ( fileChooseEventId ) {
        fileChooseEventId.onclick = fileChooseFn;
    }

    function fileChooseFn() {
        document.body.onfocus = fileChooseCalbackFn;
    }

    function fileChooseCalbackFn() {
        $timeout( function () {
            ctrl.customImgUpldMode = false;
            $( "#uploadImageModal_"+ctrl.objId ).removeClass( 'display-none' );
            ctrl.setAddImagePopupVal( false );
            document.body.onfocus = null;
        }, 222 );
    }

    $scope.$watch( 'imagefiles', function ( imageFiles ) {
        if ( imageFiles != null ) {
            ctrl.customImgUpldMode = false;
            ctrl.imageFileUploadMessage = false;

            for ( var i = 0; i < imageFiles.length; i++ ) {
                var tempv1 = ctrl.fileUploadValidation( imageFiles[ i ] );
                if ( tempv1 ) {
                    ctrl.loaderImageFn( i );
                    uploadUsing$upload( imageFiles[ i ], i );
                } else {
                    imageFiles[ i ].uploadFlg = true;
                }
            }
        }
        $( '#' + ctrl.objId + 'imagefilesId' ).val( '' );
    } );

    ctrl.loaderImageFn = function ( index ) {
        var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
        var editorInst = tinyMCE.get( tempele );
        var tempStr = '<img src="assets/images/loader-aaas.gif" />';
        var blankImageId = '@IMG@' + index;
        editorInst.insertContent( '<span style="height:300px; display:inline-block;" id="' + blankImageId +
            '" class="loader-container">' + tempStr + '</span>', false );
    };

    //if ( !angular.isUndefined($scope.disableTextArea) ){
    //$scope.$watch('disableTextArea', function(disableTextArea) {
    //ctrl.calDisableFn();
    //});
    //}

    ctrl.calDisableFn = function () {
        if ( !angular.isUndefined( $scope.disableTextArea ) ) {
            var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
            var editorInst = tinyMCE.get( tempele );
            if ( editorInst ) {
                // editorInst.getBody().setAttribute('contenteditable', !$scope.disableTextArea);               
            }
        }
    };

    ctrl.cus_inArray = function ( needle, haystack, argStrict ) {
        var key = '',
            strict = !!argStrict;
        if ( strict ) {
            for ( key in haystack ) {
                if ( haystack[ key ] === needle ) {
                    return true;
                }
            }
        } else {
            for ( key in haystack ) {
                if ( haystack[ key ] == needle ) {
                    return true;
                }
            }
        }
        return false;
    };

    ctrl.fileUploadValidation = function ( e ) {
        //var file_list = e.target.files;
        var file_list = e;
        var allowed_extList = [ "jpeg", "jpg", "png" ];
        //for (var i = 0, file; file = file_list[i]; i++) 
        {
            file = file_list;
            var sFileName = file.name;
            var sFileExtension = sFileName.split( '.' )[ sFileName.split( '.' ).length - 1 ].toLowerCase();
            var iFileSize = file.size;
            var iConvert = ( file.size / 1048576 ).toFixed( 2 );
            if ( ctrl.cus_inArray( sFileExtension, allowed_extList, false ) ) {
                if ( iFileSize <= 15728640 ) {
                    return true;
                } else {
                    simpleModalAlertService.setMessage( "Process Incomplete for file " + sFileName,
                        "Your image could not be uploaded. Please check that it is smaller than 15 MB."
                    );
                    return false;
                }
            } else {
                simpleModalAlertService.setMessage( "Process Incomplete for file " + sFileName,
                    "Your image could not be uploaded. Please check that it is a supported file type and try again."
                );
                return false;
            }
        }
    };

    function uploadUsing$upload( file, index ) {
        file.uploadFlg = false;
        var request = libraryService.uploadImageRTE();

        request.file = file;
        file.upload = $upload.upload( request );

        file.upload.then( function ( response ) {
            $timeout( function () {
                file.result = response.data;
            } );
        }, function ( response ) {
            if ( response.status > 0 ) {
                $scope.errorMsg = response.status + ': ' + response.data;
            }
        } );

        file.upload.progress( function ( evt ) {
            // Math.min is to fix IE which reports 200% sometimes
            file.progress = Math.min( 100, parseInt( 100.0 * evt.loaded / evt.total, 10 ) );
        } );

        file.upload.xhr( function ( xhr ) {
            xhr.upload.addEventListener( 'abort', function () {
                file.uploadFlg = true;
                file.progress = 100;
                //console.log(file.name + ' abort complete. '+file.progress+'-'+file.uploadFlg);
                $timeout( function () {
                    $scope.imagefiles = [];
                } );
                return;
            }, false );
        } );

        file.upload.success( function ( data, status, headers, config ) {
            file.uploadFlg = true;
            if ( !angular.isUndefined( data ) && !angular.isUndefined( data.apiResponse ) &&
                data.apiResponse.status == 'success' ) {
                //ctrl.imageFileUploadMessage = 'Image uploaded Successfully';
                var unqDate = Date.now();
                ctrl.insertImageToRTEFn( data.apiResponse.data, index, unqDate );

                ctrl.customImgUpldMode = false;
                $timeout( function () {
                    $scope.imagefiles = [];
                } );
            } else if ( angular.isUndefined( data.apiResponse ) || angular.isUndefined( data ) ||
                ( data.apiResponse.status == 'failure' ) ) {
                //ctrl.imageFileUploadMessage = 'Image cannot be uploaded. Try again later.';
                ctrl.customImgUpldMode = false;
                //simpleModalAlertService.setMessage("Process Incomplete", "Your image could not be uploaded. Please check that it is smaller than 15 MB and a supported file type and try again.");
                ctrl.removeLoaderImageFromRTE( index );
                $timeout( function () {
                    $scope.imagefiles = [];
                } );
            }
        } );
    }

    ctrl.getMeta = function ( url ) {
        $( "<img/>", {
            load: function () {
                var fnRef = this;
                var imageData = {
                    'expand': false,
                    'publicBigFilePath': url,
                    'publicBigFileSize': {
                        'height': fnRef.height,
                        'width': fnRef.width
                    },
                    'publicPath': url,
                    'publicSize': {
                        'height': fnRef.height,
                        'width': fnRef.width
                    }
                };
                if ( imageData.hasOwnProperty( 'publicBigFilePath' ) ) {
                      // var unqDate = Date.now() + Math.floor( ( Math.random() * 100 ) + 1 );
                      // ctrl.insertImageToRTEFn( imageData, false, unqDate );
                    ctrl.insertImageLinkToRTEFn( imageData );
                }
            },
            src: url
        } );
    };

    ctrl.insertImageLinkToRTEFn = function( imgData ) {

        var tempStr = '<img class="RTECustom-image-class mceNonEditable" src="' +
            imgData.publicPath + '" />';

        var overlayZoomBtn = '<span class="RTE-expand-image mceNonEditable expand-container" title="' + imgData.publicBigFilePath +
            '@@IMG-PATH-END">' + tempStr + '</span>';

        overlayZoomBtn = '<!--rte-preview-start-image-->' +
            overlayZoomBtn + '<!--rte-preview-end-image-->';

        var rmeData = {};

        rmeData.data = overlayZoomBtn;

        ctrl.setModelRMELinkVal(rmeData);
    };

    ctrl.insertImageToRTEFn = function ( imgData, index, unqDate ) {
        if ( index >= 0 ) {
            ctrl.removeLoaderImageFromRTE( index );
        }

        var uniqId = 'IMG_' + unqDate;
        var uniqImageId = 'unqimg_' + unqDate;
        var uniqDivClickId = '';
        var uniqDivParentId = 'uniqDivParentId_' + unqDate;
        var uniqDivTopId = 'uniqDivTopId' + unqDate;

        var tmpDivToAdd = '';
        var imgHeight = imgData.publicSize.height;
        if ( imgData.publicBigFileSize.width > 300 ) {
            uniqDivClickId = 'unqDivClickImg_' + unqDate;
            tmpDivToAdd = '<span id=' + uniqDivClickId +
                ' class="button-expand mceNonEditable Icon-FullImage"></span>';
        }

        //if(data.apiResponse.data.publicSize)

        var tempStr = '<img id=' + uniqImageId + ' style="min-height:' + imgHeight +
            'px;" class="RTECustom-image-class mceNonEditable" src="' +
            imgData.publicPath + '" />';
        var overlayZoomBtn = '<span id=' + uniqId +
            ' class="RTE-expand-image mceNonEditable expand-container" title="' + imgData.publicBigFilePath +
            '@@IMG-PATH-END">' + tempStr;

        if ( tmpDivToAdd !== '' ) {
            overlayZoomBtn = overlayZoomBtn + tmpDivToAdd + '</span>';
        } else {
            overlayZoomBtn = overlayZoomBtn + '</span>';
        }

        var tempeleRem = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
        var editorInst = tinyMCE.get( tempeleRem );
        //editorInst.selection.setContent(
        editorInst.insertContent( '<!--rte-preview-start-image--><p class="mceNonEditable" data-mce-contenteditable="false" id="' + uniqDivTopId + '">' +
            overlayZoomBtn + '</p><!--rte-preview-end-image--><p id="'+uniqDivParentId+'"></p>', false);

        var parId = '#' + uniqDivParentId;
        angular.element( parId ).focus();

        imgData.expand = false;
        imgData.timestamp = unqDate;
        ctrl.imageFileList.push( imgData );
    };

    ctrl.focusFn = function () {
        //console.log('focussed');
        //ctrl.vanillaLoadFlg = false;
    };

    ctrl.blurFn = function () {
        //var matchesArr = [];
        //var matchPattern = /(www\..*?[\s<]{1})/i;
        //matchesArr = currData.match(matchPattern);
        //console.log('blured',matchesArr);
        //console.log('blured',ctrl.customConvertUrl(currData));
        //ctrl.vanillaLoadFlg = false;

        ////var linkInsertCallBackFn = apiService.getLinkInsertCallBackFn();

        if ( ctrl.hideonblurflg && ctrl.getModelVal() === "" && !ctrl.customImgUpldMode &&
            !ctrl.custLinkPopFlg && !linkInsertCallBackFn ) { // && !ctrl.focusDone
            /*$timeout(function() {
                //ctrl.showEditorflg = false;
            });*/
            if ( !angular.isUndefined( $scope.hideonblurmodel ) ) {
                setTimeout( function () {
                    $scope.$apply( function () {
                        $scope.hideonblurmodel = false;
                    } );
                }, 333 );
            } else {
                setTimeout( function () {
                    $scope.hideonblurfn();
                }, 333 );
            }
        }
    };

    ctrl.customConvertUrl = function ( myString ) {
        //if(!String.linkify) {
        //String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses
        var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

        return myString //this
            .replace( urlPattern, '<a href="$&">$&</a>' )
            .replace( pseudoUrlPattern, '$1<a href="http://$2">$2</a>' )
            .replace( emailAddressPattern, '<a href="mailto:$&">$&</a>' );
        //};
        //}
    };

    ctrl.rteSelectedText = '';
    ctrl.deleteDocPopup = 'css-hide';
    var redirectUrl = false;
    if ( angular.isDefined( $scope.getgrpobjWatch ) ) {
        $scope.$watch( 'getgrpobjWatch', function ( getgrpobjWatch, oldVal ) {
            if ( !getgrpobjWatch && oldVal && oldVal.length === 0 &&
                docIdArr && docIdArr.length > 0 ) {
                deleteUploadedRTEDocFn( false );
                return;
            }
            if ( angular.isDefined( getgrpobjWatch ) ) {
                if ( getgrpobjWatch[ 0 ] && getgrpobjWatch[ 0 ].RTEId &&
                    getgrpobjWatch[ 0 ].RTEId == ctrl.objId ) {
                    var RTEId = getgrpobjWatch[ 0 ].RTEId;
                    var tempval = apiService.getCommentsRTEId();
                    if ( tempval && tempval[ RTEId ] ) {
                        docIdArr = [];
                        docIdArr = tempval[ RTEId ];
                    }
                    deleteUploadedRTEDocFn( getgrpobjWatch[ 0 ].redirectUrl );
                } else if ( getgrpobjWatch[ 0 ] && getgrpobjWatch[ 0 ].postToAnotherGrp !== undefined &&
                    getgrpobjWatch[ 0 ].postToAnotherGrp === true && !getgrpobjWatch[ 0 ].RTEId ) {
                    docIdArr = [];
                } else if ( getgrpobjWatch[ 0 ] && getgrpobjWatch[ 0 ].cancel !== undefined &&
                    getgrpobjWatch[ 0 ].cancel === true && !getgrpobjWatch[ 0 ].RTEId ) {
                    deleteUploadedRTEDocFn( getgrpobjWatch[ 0 ].redirectUrl );
                } else if ( getgrpobjWatch !== oldVal && ( !getgrpobjWatch[ 0 ] ||
                        ( getgrpobjWatch[ 0 ] && !getgrpobjWatch[ 0 ].cancel ) ) ) {
                    ctrl.calSelectedGroupFn( undefined, true );
                }
            }
        } );
    }

    ctrl.windowHref = '';
    var tempWindowHref = window.location.href;
    if ( tempWindowHref.indexOf( '#' ) > -1 ) {
        tempWindowHref = tempWindowHref.split( '#' );
        ctrl.windowHref = tempWindowHref[ 0 ].replace( 'http://', 'https://' );
    }

    ctrl.linkAttrToColMap = {
        'RTE-OBJECT-ID': 'object_id',
        'RTE-OBJECT-TYPE': 'object_type',
        'RTE-OBJECT-TITLE': 'name',
        'RTE-OBJECT-GRPID': 'group_id',
        'RTE-OBJECT-GRPACCTYPE': 'access_type',
        'RTE-OBJECT-GRPTYPE': 'group_type',
        'RTE-OBJECT-GRPNAME': 'group_name',
        'RTE-OBJECT-PRIVATEGRPID': 'private_ancestor_id',
        'RTE-OBJECT-TEXT': 'RTE-OBJECT-TEXT',
        'RTE-OBJECT-HREF': 'link'
    };

    ctrl.rejectedRTELinks = [];

    ctrl.validateLinkFn = function ( linkObj, selGrpObj, selectedTxt ) {
        var returnTxt = false,
            tempLinkResInfo = false,
            linkObjPrivateID = false,
            selGrpObjPrivateId = false;
        if ( linkObj && linkObj.name ) {
            selectedTxt = linkObj.name;
        }
        if ( linkObj && linkObj.resource_map_min && linkObj.resource_map_min.ResourceInfo ) {
            tempLinkResInfo = linkObj.resource_map_min.ResourceInfo;
        }

        if ( tempLinkResInfo && tempLinkResInfo.private_ancestor_id &&
            tempLinkResInfo.private_ancestor_id != '0' ) {
            linkObjPrivateID = tempLinkResInfo.private_ancestor_id;
        }

        if ( selGrpObj && selGrpObj.resource_map && selGrpObj.resource_map.ResourceInfo &&
            selGrpObj.resource_map.ResourceInfo.private_ancestor_id &&
            selGrpObj.resource_map.ResourceInfo.private_ancestor_id != '0' ) {
            selGrpObjPrivateId = selGrpObj.resource_map.ResourceInfo.private_ancestor_id;
        } else if ( selGrpObj && selGrpObj.private_ancestor_id &&
            selGrpObj.private_ancestor_id != '0' ) {
            selGrpObjPrivateId = selGrpObj.private_ancestor_id;
        }

        //-->console.log('validateLinkFn--> ', selectedTxt, linkObj, selGrpObj, linkObjPrivateID, selGrpObjPrivateId);

        if ( ( selGrpObj && selGrpObj.group_id && tempLinkResInfo && tempLinkResInfo.group_id &&
                selGrpObj.group_id == tempLinkResInfo.group_id ) ||
            ( selGrpObjPrivateId && tempLinkResInfo && tempLinkResInfo.group_id &&
                selGrpObjPrivateId == tempLinkResInfo.group_id )
        ) {
            returnTxt = selectedTxt;
        } else {
            if ( !linkObjPrivateID ||
                ( linkObjPrivateID && selGrpObjPrivateId &&
                    linkObjPrivateID == selGrpObjPrivateId ) ||
                ( linkObjPrivateID && selGrpObj && selGrpObj.group_id &&
                    linkObjPrivateID == selGrpObj.group_id )
            ) {

                if ( tempLinkResInfo && tempLinkResInfo.object_type && (
                        tempLinkResInfo.object_type == '1' ||
                        ( tempLinkResInfo.object_type == '2' && tempLinkResInfo.access_type == '0' ) ) ) {
                    returnTxt = selectedTxt;
                } else if ( tempLinkResInfo && tempLinkResInfo.access_type === '0' ||
                    tempLinkResInfo.access_type === 0 ||
                    tempLinkResInfo.access_type === null ) {
                    if ( tempLinkResInfo.group_type === '0' || tempLinkResInfo.group_type === 0 ||
                        tempLinkResInfo.group_type === null ) {
                        returnTxt = selectedTxt;
                    } else {
                        if ( tempLinkResInfo.object_type && ctrl.getObjTypeMaps()[ tempLinkResInfo.object_type ] &&
                            ctrl.getObjTypeMaps()[ tempLinkResInfo.object_type ].title ) {
                            //returnTxt = ctrl.getObjTypeMaps()[tempLinkResInfo.object_type].title;
                            //if ( tempLinkResInfo.group_name ) {
                            //returnTxt = returnTxt+' from '+tempLinkResInfo.group_name;
                            //}
                            returnTxt = selectedTxt;
                        }
                    }
                }
            }
        }

        return returnTxt;
    };

    ctrl.cancelFunc = function() {
        if ($scope.clearOnCancel) {
            ctrl.updateModelValMod("");
            var editor = editorInstFn();
            editor.setContent("");
            if (ctrl.placeHolder !== "" ) {
                ctrl.placeHolderFlg = true;
                editor.setContent( ctrl.placeHolder );
            }
            editor.save();
        } else {
            $scope.cancelFunc();
        }
    };

    ctrl.buildRTELink = function ( selected_obj, tempSelGroupObj, recalFlg ) {

        var targetURL, selected_text, return_text = false,
            selected_str = '',
            tmpIconClass = '',
            rteSelectedTextFlg = false;
        var selected_str_comment =
            '<!--dataRTELinkContainerStart @@@linkCodeObj@@@--><!--dataRTELinkContainerEnd-->';

        targetURL = ctrl.windowHref + '#/' + ctrl.custLinkUrl;
        if ( selected_obj && selected_obj.link && ( selected_obj.link.indexOf( 'https://' ) > -1 ||
                ( selected_obj.link.indexOf( 'http://' ) > -1 ) ) ) {
            targetURL = selected_obj.link;
        }

        selected_text = ctrl.escapeHTMLString( ctrl.custLinkTxt, false, recalFlg );
        if ( selected_obj && selected_obj.name ) {
            selected_text = selected_obj.name;
        }

        //-->console.log('targetURL ', targetURL, selected_text);
        if ( targetURL && targetURL !== '' && selected_text && selected_text !== '' ) {

            if ( selected_obj ) {

                if ( angular.isUndefined( tempSelGroupObj ) ) {
                    tempSelGroupObj = ctrl.selGroupObj;
                }
                var temp_selected_text = false;

                if ( ctrl.rteSelectedText && ctrl.rteSelectedText !== '' ) {
                    selected_text = ctrl.rteSelectedText;
                    rteSelectedTextFlg = true;
                } else if ( temp_selected_text = ctrl.validateLinkFn( selected_obj, tempSelGroupObj ) ) {
                    selected_text = temp_selected_text;
                } else {
                    return return_text;
                }

                if ( selected_obj.object_type ) {
                    if ( !rteSelectedTextFlg && ctrl.getObjTypeMaps()[ selected_obj.object_type ] &&
                        ctrl.getObjTypeMaps()[ selected_obj.object_type ].related_link_icon ) {
                        tmpIconClass =
                            ctrl.getObjTypeMaps()[ selected_obj.object_type ].related_link_icon;
                    } else if ( !rteSelectedTextFlg && ctrl.getObjTypeMaps()[ selected_obj.object_type ] &&
                        ctrl.getObjTypeMaps()[ selected_obj.object_type ].icon_class ) {
                        tmpIconClass =
                            ctrl.getObjTypeMaps()[ selected_obj.object_type ].icon_class;
                    }
                    selected_str = selected_str + ' RTE-OBJECT-TYPE="' + selected_obj.object_type + '" ';
                }
                if ( selected_obj.object_id ) {
                    selected_str = selected_str + ' RTE-OBJECT-ID="' + selected_obj.object_id + '" ';
                }
                if ( selected_obj.name ) {
                    selected_str = selected_str + ' RTE-OBJECT-TITLE="' + ctrl.escapeHTMLString(
                        selected_obj.name, true, recalFlg ) + '" ';
                }
                //if ( selected_text ) {
                //    selected_str = selected_str+' RTE-OBJECT-TEXT="'+selected_text+'" ';
                //}
                if ( targetURL ) {
                    selected_str = selected_str + ' RTE-OBJECT-HREF="' + targetURL + '" ';
                }

                if ( selected_obj.resource_map_min && selected_obj.resource_map_min.ResourceInfo ) {
                    if ( selected_obj.resource_map_min.ResourceInfo.group_type ) {
                        selected_str = selected_str + ' RTE-OBJECT-GRPTYPE="' + selected_obj.resource_map_min
                            .ResourceInfo.group_type + '" ';
                    }
                    if ( selected_obj.resource_map_min.ResourceInfo.access_type ) {
                        selected_str = selected_str + ' RTE-OBJECT-GRPACCTYPE="' + selected_obj.resource_map_min
                            .ResourceInfo.access_type + '" ';
                    }
                    if ( selected_obj.resource_map_min.ResourceInfo.group_id ) {
                        selected_str = selected_str + ' RTE-OBJECT-GRPID="' + selected_obj.resource_map_min
                            .ResourceInfo.group_id + '" ';
                    }
                    if ( selected_obj.resource_map_min.ResourceInfo.group_name ) {
                        selected_str = selected_str + ' RTE-OBJECT-GRPNAME="' + ctrl.escapeHTMLString(
                                selected_obj.resource_map_min.ResourceInfo.group_name, true, recalFlg ) +
                            '" ';
                    }
                    if ( selected_obj.resource_map_min.ResourceInfo.private_ancestor_id &&
                        selected_obj.resource_map_min.ResourceInfo.private_ancestor_id > 0 ) {
                        selected_str = selected_str + ' RTE-OBJECT-PRIVATEGRPID="' + selected_obj.resource_map_min
                            .ResourceInfo.private_ancestor_id + '" ';
                    }
                }

                selected_str_comment = selected_str_comment.replace( '@@@linkCodeObj@@@', selected_str );
            }

            var tempLinkClassStr = 'rteIntLinkClass mceNonEditable add-links';
            if ( rteSelectedTextFlg ) {
                tempLinkClassStr = '';
            }

            return_text = '<span class="' + tempLinkClassStr + ' ' + tmpIconClass + '">' +
                '<a href="' + targetURL + '" target="_self">' + ctrl.escapeHTMLString( selected_text, false,
                    recalFlg ) + selected_str_comment +
                '</a></span>';

            return return_text;
        } else {
            return return_text;
        }
    };

    ctrl.recalRTELinks = function ( tempSelGroupObj ) {
        if ( ctrl.objId ) {
            var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
            $timeout( function () {
                var editorInst = tinyMCE.get( tempele );
                if ( editorInst ) {
                    var tempContent = editorInst.getContent();
                    if ( tempContent && tempContent !== '' ) {

                        var matchPattern = /<span class=\"rteIntLinkClass(.*?)<\/span>/g;
                        if ( matchPattern.test( tempContent ) ) {

                            var intLinkRTEArr = tempContent.match( matchPattern );
                            for ( var i in intLinkRTEArr ) {

                                var tempLink = intLinkRTEArr[ i ];
                                var tempLinkAttrObj = {};
                                tempLinkAttrObj[ 'link_str' ] = tempLink;

                                var tempLinkAttr = tempLink.match( /RTE-OBJECT-.*?\"(.*?)\"/g );
                                if ( tempLinkAttr && tempLinkAttr.length ) {
                                    for ( var j in tempLinkAttr ) {
                                        var tempSubLink = tempLinkAttr[ j ].split( '="' );
                                        if ( tempSubLink.length > 1 ) {
                                            tempLinkAttrObj[ ctrl.linkAttrToColMap[ tempSubLink[ 0 ] ] ] =
                                                tempSubLink[ 1 ].substr( 0, ( tempSubLink[ 1 ].length -
                                                    1 ) );
                                        }
                                    }

                                    var tempObjToCopy = angular.copy( tempLinkAttrObj );
                                    tempLinkAttrObj[ 'resource_map_min' ] = {};
                                    tempLinkAttrObj[ 'resource_map_min' ][ 'ResourceInfo' ] =
                                        tempObjToCopy;

                                    var temp_selected_str = false;
                                    if ( temp_selected_str = ctrl.buildRTELink( tempLinkAttrObj,
                                            tempSelGroupObj, true ) ) {
                                        tempRegExp = new RegExp( tempLinkAttrObj.link_str, 'ig' );
                                        tempContent = tempContent.replace( tempRegExp,
                                            temp_selected_str );
                                    } else {
                                        ctrl.rejectedRTELinks.push( tempLinkAttrObj );
                                    }
                                }
                            }

                            if ( ctrl.rejectedRTELinks.length ) {
                                var tempRejLinkStr = '';
                                for ( var k in ctrl.rejectedRTELinks ) {
                                    var tempRejLink = ctrl.rejectedRTELinks[ k ];
                                    if ( tempRejLink.link_str && tempRejLink.link_str !== '' ) {
                                        tempRejLinkStr = tempRejLinkStr + tempRejLink.link_str +
                                            ' ';
                                        tempContent = tempContent.replace( tempRejLink.link_str, '' );
                                    }
                                }
                                if ( tempRejLinkStr && tempRejLinkStr !== '' ) {
                                    simpleModalAlertService.setMessage( "Link(s) cannot be shared",
                                        "<br/>Links from a private group can only be shared within that group itself. The following links have been removed:<br/><br/>" +
                                        tempRejLinkStr );
                                    ctrl.rejectedRTELinks = [];
                                }
                            }

                            $timeout( function () {
                                $scope.$apply( function () {
                                    ctrl.modelDataRTEVal = tempContent;
                                    editorInst.setContent( tempContent );
                                    editorInst.execCommand( 'mceFocus', false );
                                } );
                            } );
                        }
                    }
                }
            }, 333 );
        }
    };

    ctrl.calSelectedGroupFn = function ( tempRetainFlg, reCalFlg ) {

        var tempSelGroupObj = false;
        if ( !angular.isUndefined( $scope.getgrpobj ) ) {
            tempSelGroupObj = $scope.getgrpobj();

            if ( tempSelGroupObj ) {

                if ( tempSelGroupObj.length && tempSelGroupObj[ 0 ] && tempSelGroupObj[ 0 ].id ) {
                    tempSelGroupObj = tempSelGroupObj[ 0 ];
                }

                if ( !ctrl.selGroupObj || ( ctrl.selGroupObj && ctrl.selGroupObj.id &&
                        tempSelGroupObj && tempSelGroupObj.id &&
                        ctrl.selGroupObj.id !== tempSelGroupObj.id ) ) {
                    tempRetainFlg = false;
                }

                if ( tempSelGroupObj && tempSelGroupObj.id &&
                    ( tempSelGroupObj.resource_map && tempSelGroupObj.resource_map.Group &&
                        tempSelGroupObj.resource_map.Group.group_status &&
                        tempSelGroupObj.resource_map.Group.group_status == '2' )
                ) {
                    tempSelGroupObj[ 'group_id' ] = tempSelGroupObj.id;
                    tempSelGroupObj[ 'group_name' ] = tempSelGroupObj.name;
                } else if ( tempSelGroupObj.group_status && tempSelGroupObj.group_id &&
                    tempSelGroupObj.group_status == '2' ) {
                    tempSelGroupObj[ 'id' ] = tempSelGroupObj.group_id;
                } else {
                    tempSelGroupObj = false;
                }

                if ( reCalFlg ) {
                    ctrl.recalRTELinks( tempSelGroupObj );
                } else {
                    ctrl.selGroupObj = tempSelGroupObj;
                }

            } else {
                if ( ctrl.selGroupObj && ctrl.selGroupObj.id ) {
                    tempRetainFlg = false;
                }
                if ( reCalFlg ) {
                    ctrl.recalRTELinks( false );
                } else {
                    ctrl.selGroupObj = false;
                }
            }
        }
        return tempRetainFlg;
    };

    ctrl.custLinkFn = function ( setVal, retainFlg, overRideNode ) {
        $timeout( function () {
            $scope.$apply( function () {
                if ( !ctrl.localWaitingOnServer ) {
                    ctrl.custLinkUrl = '';
                    ctrl.custLinkTxt = '';
                    ctrl.custLinkObj = false;
                    ctrl.custLinkUrlTxtSameFlg = true;
                    ctrl.webLinkErrorUrl = '';
                    ctrl.webLinkErrorTxt = '';
                    ctrl.currParentNode = false;
                    ctrl.disableIntLinksFlg = false;
                    ctrl.rteSelectedText = '';

                    retainFlg = ctrl.calSelectedGroupFn( retainFlg );

                    if ( !retainFlg || !ctrl.custLinkFlg ) {
                        ctrl.loadObjType = '0';
                        ctrl.searchTxt = '';
                        ctrl.searchTxtOrg = '';
                        ctrl.linksArrToShow = [];
                        ctrl.custLinkFlg = setVal;
                    }

                    var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
                    var editorInst = tinyMCE.get( tempele );

                    if ( ctrl.custLinkFlg && !overRideNode ) {
                        var content = editorInst.selection.getContent( { format: 'text' } );
                        if ( ctrl.inlineFlg ) {
                            ctrl.tempEditorBookMark = editorInst.selection.getBookmark( 2,
                                true );
                            tinyMCE.triggerSave();
                            editorInst.save();
                        } else {
                            ctrl.tempEditorBookMark = false;
                        }

                        //console.log('NodeChange event', e, e.element.nodeName.toLowerCase(), e.element.origin, e.element.attributes, e.element.attributes['href'].value);
                        var tempParentNode = editorInst.selection.getNode();

                        if ( tempParentNode && tempParentNode.nodeName &&
                            tempParentNode.nodeName.toLowerCase() == 'a' ) {
                            ctrl.currParentNode = tempParentNode;
                            ctrl.custLinkUrl = ctrl.currParentNode.href;
                            ctrl.custLinkTxt = ctrl.currParentNode.text;
                            ctrl.rteSelectedText = ctrl.custLinkTxt;
                            ctrl.custLinkUrlTxtSameFlg = false;
                            if ( setVal ) {
                                setVal = 1;
                                ctrl.searchTxt = '';
                                ctrl.searchTxtOrg = '';
                                ctrl.linksArrToShow = [];
                                ctrl.custLinkFlg = setVal;
                                ctrl.disableIntLinksFlg = true;
                            }
                        } else if ( content && content !== '' ) {
                            ctrl.custLinkTxt = content;
                            ctrl.rteSelectedText = ctrl.custLinkTxt;
                            ctrl.custLinkUrlTxtSameFlg = false;
                        }

                        if ( ctrl.custLinkFlg == 2 &&
                            ( !retainFlg || !ctrl.linksArrToShow || !ctrl.linksArrToShow.length )
                        ) {
                            ctrl.loadRecentData( 0, true );
                        }
                    }

                    if ( !setVal ) {
                        editorInst.execCommand( 'mceFocus', false );
                    }

                    ctrl.custLinkPopFlg = setVal;

                    if ( ctrl.custLinkPopFlg == 1 ) {
                        $timeout( function () {
                            $scope.$apply( function () {
                                angular.element( '#rteLinkURLId' ).focus();
                            } );
                        } );
                    } else if ( !ctrl.custLinkPopFlg ) {
                        ctrl.currParentNode = false;
                    }

                }
            } );
        } );
    };

    ctrl.custLinkUrlFn = function () {
        $timeout( function () {
            $scope.$apply( function () {
                //if ( ctrl.custLinkUrl === '' ) {
                //  ctrl.custLinkUrlTxtSameFlg = true;
                //}
                if ( ctrl.custLinkUrl && ctrl.custLinkUrlTxtSameFlg ) {
                    ctrl.custLinkTxt = ctrl.custLinkUrl;
                }
            } );
        } );
    };

    ctrl.custLinkTxtFn = function () {
        $timeout( function () {
            $scope.$apply( function () {
                ctrl.custLinkUrlTxtSameFlg = false;
                ctrl.custLinkTxtChangeFlg = true;
            } );
        } );
    };

    ctrl.getObjTypeMaps = function () {
        return apiService.appObjectTypeMaps;
    };

    ctrl.escapeHTMLString = function ( tempStr, extraFlg, recalFlg ) {

        if ( !recalFlg ) {
            tempStr = tempStr
                .replace( /&/g, "&amp;" )
                .replace( /</g, "&lt;" )
                .replace( />/g, "&gt;" )
                .replace( /"/g, "&quot;" )
                .replace( /'/g, "&#039;" );
            if ( tempStr && tempStr !== '' ) {
                if ( extraFlg ) {
                    tempStr = tempStr.split( '--' ).join( '\\-\\-' );
                }
                tempStr = tempStr.split( '?' ).join( '&#63;' );
            }
        }

        return tempStr;
    };

    ctrl.webLinkInsertFn = function ( targetURL ) {

        ctrl.webLinkErrorUrl = false;

        if ( !ctrl.custLinkUrl || ctrl.custLinkUrl === '' ) {
            ctrl.webLinkErrorUrl = 'Please enter a URL.';
        }

        if ( ctrl.webLinkErrorUrl ) {
            return;
        }

        if ( targetURL.indexOf( window.location.hostname ) > -1 ) {
            ctrl.autoLinkCallback( targetURL, function ( res ) {
                if ( !res ) {
                    ctrl.custLinkInsertFn( 1 );
                }
            } );
        } else {
            ctrl.custLinkInsertFn( 1 );
        }
    };

    ctrl.custLinkInsertFn = function ( insertType, upldDocObj ) {
        $timeout( function () {
            $scope.$apply( function () {

                ctrl.custLinkUrlTxtSameFlg = false;
                var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
                var editorInst = tinyMCE.get( tempele );
                var targetURL = '',
                    selected_text, return_text;
                var selected_str_comment =
                    '<!--dataRTELinkContainerStart @@@linkCodeObj@@@--><!--dataRTELinkContainerEnd-->';

                if ( insertType == 1 ) {
                    targetURL = ctrl.custLinkUrl;
                    if ( targetURL !== '' && targetURL.indexOf( 'https://' ) > -1 ) {
                        //targetURL = targetURL.replace('http://', 'https://');
                    } else if ( targetURL !== '' && targetURL.indexOf( 'http://' ) < 0 ) {
                        targetURL = 'http://' + targetURL;
                    }

                    selected_text = ctrl.custLinkTxt;

                    if ( !ctrl.custLinkTxt || ctrl.custLinkTxt === '' ) {
                        selected_text = ctrl.custLinkUrl;
                    }

                    return_text = '' + selected_text + '';

                    ctrl.webLinkErrorTxt = false;
                    ctrl.webLinkErrorUrl = false;
                    //if ( !ctrl.custLinkTxt || ctrl.custLinkTxt === '' ) {
                    //  ctrl.webLinkErrorTxt = 'Please enter text to display.';
                    //}
                    //if ( !ctrl.custLinkUrl || ctrl.custLinkUrl === '' ) {
                    //  ctrl.webLinkErrorUrl = 'Please enter a URL.';
                    //}

                    //if ( ctrl.webLinkErrorTxt ) {
                    //  return;
                    //}

                    if ( ctrl.currParentNode && ctrl.currParentNode.text ) {

                        var newUrlNode = false;
                        if ( targetURL && targetURL !== '' && selected_text &&
                            selected_text !== '' ) {
                            newUrlNode = editorInst.dom.create( 'a', {
                                    href: targetURL,
                                    target: "_blank"
                                },
                                selected_text );
                        } else if ( selected_text && selected_text !== '' ) {
                            //editorInst.selection.setNode( editorInst.dom.create('span', {}, selected_text) );
                            newUrlNode = editorInst.dom.create( 'span', {}, selected_text );
                        }

                        if ( newUrlNode ) {
                            editorInst.dom.insertAfter( newUrlNode, ctrl.currParentNode );
                            editorInst.selection.select( newUrlNode );
                            editorInst.selection.collapse( false );
                            ctrl.currParentNode.remove();
                        }

                        ctrl.custLinkFn( false, true, true );
                        return;
                    }

                    if ( targetURL && targetURL !== '' &&
                        ( targetURL.indexOf( 'https://' ) > -1 || targetURL.indexOf(
                            'http://' ) > -1 ) ) {
                        return_text = '<span><a href="' + targetURL + '" target="_blank">' +
                            selected_text + '</a></span>';
                    } else if ( selected_text && selected_text !== '' && targetURL === '' ) {
                        return_text = '<span>' + selected_text + '</span>';
                    }

                    selected_str_comment = return_text;
                } else if ( ( insertType == 2 || insertType == 3 ) && ( ctrl.custLinkObj ||
                        upldDocObj ) ) {

                    var tempBuildRTELink = ctrl.custLinkObj ? ctrl.buildRTELink( ctrl.custLinkObj ) :
                        ctrl.buildRTELink( upldDocObj );

                    if ( tempBuildRTELink ) {
                        if ( ctrl.rteSelectedText && ctrl.rteSelectedText !== '' ) {
                            return_text = tempBuildRTELink;
                        } else {
                            return_text = '<span> </span>' +
                                tempBuildRTELink +
                                '<span>&nbsp; </span>';
                        }
                        ctrl.rteSelectedText = '';
                        selected_str_comment = return_text;
                    } else {
                        return;
                    }

                    if ( ctrl.currParentNode && ctrl.currParentNode.text ) {
                        ctrl.currParentNode.remove();
                    }
                }

                ctrl.custLinkFn( false, true );
                if ( ctrl.tempEditorBookMark ) {
                    editorInst.selection.moveToBookmark( ctrl.tempEditorBookMark );
                    ctrl.tempEditorBookMark = false;
                }
                editorInst.execCommand( 'mceInsertContent', false, selected_str_comment );
                if ( insertType == 1 ) {
                    ctrl.autoLinkCallback( targetURL, function ( res ) {} );
                }

            } );
        } );
    };

    ctrl.custLinkSetFn = function ( insertType, tempObj ) {
        $timeout( function () {
            $scope.$apply( function () {
                var temp_selected_text = false;

                if ( temp_selected_text = ctrl.validateLinkFn( tempObj, ctrl.selGroupObj ) ) {
                    ctrl.custLinkTxt = temp_selected_text;
                } else {
                    return;
                }
                //ctrl.custLinkTxt = tempObj.name;
                ctrl.custLinkUrl = tempObj.link;
                ctrl.custLinkObj = tempObj;
                ctrl.custLinkUrlTxtSameFlg = false;
            } );
        } );
    };

    ctrl.loadLinkData = function ( tempObjType, refFlg ) {

        if ( ctrl.localWaitingOnServer ) {
            return;
        }

        if ( !refFlg && ( angular.isDefined( tempObjType ) && angular.isDefined( ctrl.loadObjType ) &&
                tempObjType != ctrl.loadObjType ) ) {

            ctrl.loadObjType = tempObjType;
        }

        if ( ctrl.searchTxt && ctrl.searchTxt !== '' && ctrl.searchTxt.length > 2 ) {
            ctrl.loadSearchData( ctrl.searchTxt, ctrl.loadObjType, true );
        } else if ( !refFlg || !ctrl.searchTxt ) {
            ctrl.loadRecentData( ctrl.loadObjType, true );
        }

    };

    ctrl.loadRecentData = function ( tempObjType, isLinking ) {

        ctrl.linksArrToShow = [];

        var request = apiService.apiRecentData();
        if ( tempObjType ) {
            if ( tempObjType == 7 ) {
                tempObjType = 14;
            } else if ( tempObjType == 3 ) {
                tempObjType = '3,4,9';
            }
            request.params[ 'object_type' ] = tempObjType;
        }
        if ( isLinking ) {
            request.params[ 'is_linking' ] = true;
            request.params[ 'min_resource' ] = true;
            if ( ctrl.selGroupObj && ctrl.selGroupObj.group_id ) {
                request.params[ 'linking_group_id' ] = ctrl.selGroupObj.group_id;
            }
        }
        request.params[ 'limit' ] = 16;

        try {
            $timeout( function () {
                $scope.$apply( function () {
                    if ( request ) {
                        ctrl.localWaitingOnServer = true;
                        apiService.submitRequest( request ).then(
                            function ( response ) {
                                var dataResponse = ( response.data );
                                if ( dataResponse.apiResponse.status === 'success' ) {
                                    //ctrl.linksArrToShow = dataResponse.apiResponse.data;
                                    var returnedData = dataResponse.apiResponse.data;
                                    for ( var i in returnedData ) {
                                        var tempData = returnedData[ i ];
                                        var tempObjMap = ctrl.searchDDMaps[ tempData.object_type ];
                                        var tempResMap = dataResponse.apiResponse.resource_map_min[
                                            tempObjMap.objname_backend ][ tempData.object_id ];

                                        tempData[ 'id' ] = tempData.object_id;
                                        tempData[ 'resource_map_min' ] = tempResMap;
                                        ctrl.linksArrToShow.push( tempData );
                                    }
                                    ctrl.localWaitingOnServer = false;
                                } else {
                                    ctrl.localWaitingOnServer = false;
                                }
                            },
                            function ( err ) {
                                ctrl.localWaitingOnServer = false;
                            }
                        );
                    }
                } );
            } );
        } catch ( e ) {}
    };

    ctrl.loadSearchData = function ( searchVal, tempObjType, isLinking, resetFlg ) {
        if ( resetFlg ) {
            ctrl.linksArrToShow = [];
            ctrl.localWaitingOnServer = false;
        }
        if ( searchVal === '' ) {
            ctrl.linksArrToShow = [];
        }
        if ( searchVal.length > 2 && !ctrl.localWaitingOnServer ) {
            ctrl.hdrAutoSearchFn( searchVal, tempObjType, isLinking );
        }
    };

    //ctrl.searchDDMaps = apiService.appObjectTypeMaps;
    //ctrl.currentUser = apiService.getUserProfile();

    ctrl.hdrAutoSearchFn = function ( searchVal, tempObjType, isLinking ) {
        var searchRequest = searchService.searchAutoComplete();
        searchRequest.params.search_text = searchVal;
        if ( tempObjType ) {
            if ( tempObjType == 3 ) {
                tempObjType = '3,4,9';
            }
            searchRequest.params[ 'object_type' ] = tempObjType;
        }
        if ( isLinking ) {
            searchRequest.params[ 'is_linking' ] = true;
            searchRequest.params[ 'min_resource' ] = true;
            if ( ctrl.selGroupObj && ctrl.selGroupObj.group_id ) {
                searchRequest.params[ 'linking_group_id' ] = ctrl.selGroupObj.group_id;
            }
        }
        searchRequest.params[ 'limit' ] = 16;
        try {
            $timeout( function () {
                $scope.$apply( function () {
                    if ( searchRequest && !ctrl.localWaitingOnServer ) {
                        ctrl.linksArrToShow = [];
                        ctrl.searchTxtOrg = searchVal;
                        ctrl.localWaitingOnServer = true;
                        apiService.submitRequest( searchRequest ).then(
                            function ( response ) {
                                var dataResponse = apiService.processResponse( response );
                                if ( dataResponse.apiResponse.status === 'success' ) {

                                    if ( ctrl.searchTxtOrg !== ctrl.searchTxt ) {
                                        ctrl.loadSearchData( ctrl.searchTxt,
                                            tempObjType, isLinking, true );
                                    } else {
                                        var returnedData = dataResponse.apiResponse.data
                                            .results;
                                        for ( var i in returnedData ) {
                                            var tempData = returnedData[ i ];

                                            ctrl.linksArrToShow.push(
                                                buildDataTrellisLink( tempData,
                                                    dataResponse ) );

                                        }
                                        ctrl.localWaitingOnServer = false;
                                    }
                                } else {
                                    ctrl.localWaitingOnServer = false;
                                }
                            },
                            function ( err ) {
                                ctrl.localWaitingOnServer = false;
                            }
                        );
                    }
                } );
            } );
        } catch ( e ) {}

    };

    var buildDataTrellisLink = function ( tempData, dataResponse ) {
        var tempObjMap = ctrl.searchDDMaps[ tempData.object_type ];

        var tempResMap = dataResponse.apiResponse.resource_map_min[
            tempObjMap.objname_backend ][ tempData.object_id ];

        tempData[ 'image' ] = tempObjMap.dd_image;
        tempData[ 'redirectUrl' ] = '/' + tempObjMap.dd_url + '/';
        tempData[ 'link' ] = tempObjMap.dd_url + '/';
        tempData[ 'id' ] = tempData.object_id;
        tempData[ 'resource_map_min' ] = tempResMap;

        if ( tempData.object_type == '1' ) {
            tempData[ 'name' ] = tempResMap.Profile.name;
            tempData[ 'image' ] = ( tempResMap.Profile.profile_image_url &&
                    tempResMap.Profile.profile_image_url !== '' ) ?
                tempResMap.Profile.profile_image_url : tempObjMap.dd_image;
        } else if ( tempData.object_type == '2' ) {
            tempData[ 'name' ] = tempResMap.Group.name;
            tempData[ 'image' ] = ( tempResMap.Group.icon_image &&
                    tempResMap.Group.icon_image !== '' ) ?
                tempResMap.Group.icon_image : tempObjMap.dd_image;
        } else if ( tempData.object_type == '3' ) {
            tempData[ 'name' ] = tempResMap.Discussion.heading;
        } else if ( tempData.object_type == '4' ) {
            //if (ctrl.currentUser.id != tempResMap.created_by_id) {
            tempData[ 'name' ] = 'Status update by ' + tempResMap.User.Profile.name + '';
            //}
            //else{
            //tempData['name'] = 'Status update by You';
            //}
            if ( tempResMap.Group.status == '2' &&
                tempResMap.Group.name !== '' ) {
                tempData[ 'name' ] += ' in ' + tempResMap.Group.name;
            }
        } else if ( tempData.object_type == '5' ) {
            tempData[ 'name' ] = tempResMap.RepeatingEvent.title;
        } else if ( tempData.object_type == '7' ) {
            tempData[ 'name' ] = tempResMap.Metadata.title;
            tempData[ 'id' ] = tempResMap.DocumentLibrary.document_id;
            tempData[ 'groupId' ] = tempResMap.Discussion.group_id;
            tempData[ 'adhocId' ] = ( tempResMap.Discussion.type == 2 ) ? tempData[ 'groupId' ] : 0;
        } else if ( tempData.object_type == '9' ) {
            tempData[ 'name' ] = tempResMap.Discussion.heading;
        }

        tempData[ 'link' ] = tempData.link + tempData.id;
        if ( tempData.redirectUrl == '/discussions-about/' || tempData.redirectUrl ==
            '/announcement-detail/' ||
            tempData.redirectUrl == '/status/' ) {
            tempData[ 'link' ] += '/0';
        } else if ( tempData.redirectUrl == '/document-detail/' ) {
            tempData[ 'link' ] += '/' + tempData.adhocId + '/' + tempData.groupId;
        }

        return tempData;
    };

    ctrl.uploadImageFn = function ( imageData, index ) {
        var request = apiService.getImageData();
        request.data.image_data = imageData;

        apiService.submitRequest( request ).then(
            function ( response ) {
                ctrl.getImageDataResponse( response, index );
            },
            function ( err ) {
                ctrl.getImageDataResponse( err, index );
            }
        );
    };

    var errorCodeFieldsMaps = {
        'image_invalid': {
            error_code: [ '8055' ]
        },
        'image_size': {
            error_code: [ '180155' ]
        }
    };

    ctrl.getImageDataResponse = function ( response, index ) {
        apiService.setErrorCodeMap( errorCodeFieldsMaps );
        try {
            var data = apiService.processResponse( response, apiService.codesMappedToFields() );
            apiService.setMapErrors( response.data.apiResponse.errors );
            if ( data.mappedErrors ) {
                ctrl.removeLoaderImageFromRTE( index );
                ctrl.errors = response.data.apiResponse.errors;
                ctrl.removeLoaderImageFromRTE( index );
                return;
            }
            if ( !angular.isUndefined( data ) && !angular.isUndefined( data.apiResponse ) &&
                data.apiResponse.status == 'success' ) {
                var unqDate = Date.now();
                ctrl.insertImageToRTEFn( data.apiResponse.data, index, unqDate );
            } else if ( angular.isUndefined( data.apiResponse ) || angular.isUndefined( data ) ||
                ( data.apiResponse.status == 'failure' ) ) {
                ctrl.removeLoaderImageFromRTE( index );
            }
        } catch ( e ) {
            ctrl.errors = JSON.parse( e.message );
            if ( !ctrl.errors[ 0 ] ) {
                var singleError = ctrl.errors;
                ctrl.errors = [];
                ctrl.errors.push( singleError );
            }
            if ( ctrl.errors[ 0 ].error_code == "8005" ||
                ctrl.errors[ 0 ].error_code == "180155" ) {
                simpleModalAlertService.setMessage( "Error", ctrl.errors[ 0 ].error_message );
            }
            ctrl.removeLoaderImageFromRTE( index );
        }
    };

    ctrl.removeLoaderImageFromRTE = function ( index ) {
        var tempeleRem = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
        var editorInstRem = tinyMCE.get( tempeleRem );
        editorInstRem.dom.remove( '@IMG@' + index );
    };

    ctrl.autoLinkCallback = function ( url, cb, urlTxt ) {
        if ( url.indexOf( window.location.hostname ) > -1 ) {

            /*if (ctrl.custLinkTxt && ctrl.custLinkTxt.length > 0 && ctrl.custLinkTxt != url) {
                cb(false);
                return;
            }*/
            var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
            var editorInst = tinyMCE.get( tempele );

            var tmpEditorBookMark = editorInst.selection.getBookmark( 0, true );

            editorInst.insertContent(
                '<span class="loader" id="tmcLoaderID"><img src="assets/images/loader-aaas.gif"></span>',
                ctrl.currParentNode );

            var request = apiService.checkTrellisLink();

            request.params[ 'trellis_url' ] = url;
            ctrl.calSelectedGroupFn( true );
            if ( ctrl.selGroupObj && ctrl.selGroupObj.group_id ) {
                request.params[ 'group_id' ] = ctrl.selGroupObj.group_id;
            }

            apiService.submitRequest( request ).then(
                function ( response ) {
                    var dataResponse = apiService.processResponse( response );

                    if ( dataResponse.apiResponse.status === 'success' ) {

                        editorInst.dom.remove( 'tmcLoaderID' );

                        if ( tmpEditorBookMark ) {
                            editorInst.selection.moveToBookmark( tmpEditorBookMark );
                            tmpEditorBookMark = false;
                        }

                        var returnedData = dataResponse.apiResponse.data;

                        if ( returnedData.is_linkable ) {
                            if ( ctrl.custLinkTxtChangeFlg ) {
                                ctrl.rteSelectedText = ctrl.custLinkTxt;
                                ctrl.custLinkTxtChangeFlg = false;
                            }
                            ctrl.custLinkSetFn( 2, buildDataTrellisLink( returnedData, dataResponse ) );

                            ctrl.custLinkInsertFn( 2 );
                            cb( true );
                        } else {
                            var finalUrl = '<span><a href="' + url + '" target="_blank">' +
                                            urlTxt + '</a></span>';

                            editorInst.execCommand( 'mceInsertContent', false, finalUrl );
                            cb( true );
                        }

                    } else {
                        cb( false );
                    }
                },
                function ( err ) {}
            );
        } else {
            cb( false );
            if ( ctrl.annoFlg ) {
                return;
            }
            ctrl.insertNonTrellisPreview( url );
        }
    };

    ctrl.insertNonTrellisPreview = function ( url ) {
        if ( url.indexOf( window.location.hostname ) > -1 ) {
            return;
        }
        var ext = url.substring( url.lastIndexOf( '.' ) + 1 ).toLowerCase();
        if ( ext === "gif" || ext === "jpg" || ext === "png" || ext === "bmp" || ext === "jpeg" ) {
            ctrl.getMeta( url );
        } else {
            ctrl.extractUrl2( url );
        }
    };

    ctrl.focusOnEndFn = function () {
        var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
        var editorInst = tinyMCE.get( tempele );
        editorInst.focus();
        editorInst.selection.select( editorInst.getBody(), true );
        editorInst.selection.collapse( false );
    };

    ctrl.initTMCE = function () {

        var toolbarOptions =
            "style-h1 | style-h2 | bold | italic | bullist | numlist | outdent | indent | customLink | uploadDoc | media | image | customImgUpld | forecolor | emoji | annotationButton";
        if ( ctrl.annoFlg ) {
            toolbarOptions =
                "style-h1 | style-h2 | bold | italic | bullist | numlist | outdent | indent | customLink | uploadDoc | forecolor | emoji | annotationButton";
        }
        if ( ctrl.disableCustomLink ) {
            toolbarOptions = toolbarOptions.replace( '| customLink', '| link', '| uploadDoc' );
        }
        if ( !ctrl.hidePreviewFlg ) {
            toolbarOptions = toolbarOptions + " | customPrv ";
        }
        var validFont = '';
        if ( ctrl.newToolbar ) {
            //ctrl.inlineFlg = true;
            if ( $scope.annoFlg ) {
                toolbarOptions = "insertButton | annotationButton | emoji";
            } else {
                //insertButton | 
                toolbarOptions =
                    "customfontsize | bold | italic | bullist | numlist | outdent | indent | emoji | preview";
            }
        }

        var pluginArr = [ "autoresize autolink link image lists charmap preview hr anchor pagebreak",
            "visualblocks visualchars code media nonbreaking stylebuttons",
            "save table  paste textcolor noneditable" ];

        if ( ctrl.hideToolbar ) {
            pluginArr = [ "autolink" ];
            toolbarOptions = false;
        }

        // if ( !ctrl.showAddAttachment ) {
        //     toolbarOptions = toolbarOptions.replace('| uploadDoc');
        // }

        //var tempele = $('.'+ctrl.objId+'class').attr('id');
        //var editorInst = tinyMCE.get(tempele);
        //if(editorInst !== null){
        //tinymce.execCommand('mceRemoveControl', true, ''+tempele+'');
        //tinymce.execCommand("mceRemoveEditor", true, ''+tempele+'');
        //$('#'+tempele+'').tinymce().remove();
        //$('#'+tempele+'').tinymce('remove');
        //}
        tinyMCE.PluginManager.add( 'stylebuttons', function ( editor, url ) {
            [ 'pre', 'p', 'code', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ].forEach( function ( name ) {
                editor.addButton( "style-" + name, {
                    tooltip: name,
                    text: name.toUpperCase(),
                    onClick: function () {
                        editor.execCommand( 'mceToggleFormat',
                            false, name );
                    },
                    onPostRender: function () {
                        var self = this,
                            setup = function () {
                                editor.formatter.formatChanged( name, function (
                                    state ) {
                                    self.active( state );
                                } );
                            };
                        return editor.formatter ? setup() : editor.on( 'init',
                            setup );
                    }
                } );
            } );
        } );
        tinymce.init( {
            selector: '.' + ctrl.objId + 'class',
            body_class: ctrl.objId + 'class' + ( ( ctrl.annoFlg ) ? ' annotation-rte ' : '' ),
            theme: "modern",
            ui_container: (apiService.isMobile())?'#anotationBlock':'',
            skin: 'trellis',
            skin_url: 'https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/assets/rte/skins/trellis',
            menubar: false,
            statusbar: false,
            resize: false,
            inline: ctrl.inlineFlg,
            //fixed_toolbar_container: "#mytoolbar",
            content_css: "https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/assets/css/style.css, "+ 
                "https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/assets/css/popup.css, "+ 
                "https://cloud.webtype.com/css/60a0fc32-0816-4858-9fb8-6ae4f6c1aa0a.css, "+ 
                "https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/assets/css/style.css, "+ 
                "https://gitcdn.link/repo/vineet-atlogys/plugins/dev/extended-rte/assets/css/stylesheets/aaas.css",
            /*plugins: [
               "autoresize advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
               "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
               "save table contextmenu directionality emoticons template paste textcolor stylebuttons"
            ],*/
            plugins: pluginArr,
            toolbar: toolbarOptions,
            style_formats: [
                { title: 'Bold text', inline: 'b' },
                { title: 'Red text', inline: 'span', styles: { color: '#ff0000' } },
                { title: 'Red header', block: 'h1', styles: { color: '#ff0000' } },
                { title: 'Example 1', inline: 'span', classes: 'example1' },
                { title: 'Example 2', inline: 'span', classes: 'example2' },
                { title: 'Table styles' },
                { title: 'Table row 1', selector: 'tr', classes: 'tablerow1' }
            ],
            target_list: false,
            link_title: false,
            auto_resize: true,
            object_resizing: false,
            media_dimensions: false,
            media_poster: false,
            media_alt_source: false,
            image_dimensions: false,
            image_description: false,
            valid_elements: 'blockquote,iframe,div[*],span[*],p[*],b,strong,i,em,ul,li,ol,h4',
            //valid_elements : "*[*]",
            extended_valid_elements: "a[href|target=_blank],img[*]",
            paste_data_images: true,
            paste_preprocess: function ( plugin, args ) {
                args.content = args.content.replace( /\sng-\w+[-\w]*?=\"((.|[\r\n]|\s)*?)\"/ig,
                    ' ' );
                args.content = args.content.replace( /\sstyle=\"((.|[\r\n]|\s)*?)\"/ig, ' ' );
                args.content = args.content.replace( /\sclass=\"((.|[\r\n]|\s)*?)\"/ig, ' ' );
                args.content = args.content.replace( /\sid=\"(.*?)\"/ig, ' ' );
                args.content = args.content.replace( /(<iframe.*?>.*?(<\/iframe>)*)/g, "" );
                var dataArg = args.content;

                var matchPattern = /data:image\/([a-zA-Z0-9!@#\$%\^\&*)\]\[(+=._-].*)=/g;
                if ( matchPattern.test( dataArg ) ) {
                    args.content = '';
                    var intLinkRTEImgArr = dataArg.match( matchPattern );
                    var unqDateIndex = Date.now() + Math.floor( ( Math.random() * 100 ) + 1 );
                    ctrl.loaderImageFn( unqDateIndex );
                    ctrl.uploadImageFn( intLinkRTEImgArr[ 0 ], unqDateIndex );
                }

                var matchPatternHREF = /<a.+?\s*href\s*=\s*"(.*?)"/g; ///<a.*?href\s*=\s*"(.*?)".*?<\//g;
                if ( matchPatternHREF.test( dataArg ) ) {
                    var intLinkRTEHrefArr = dataArg.match( matchPatternHREF );
                    for ( var index = 0; index < intLinkRTEHrefArr.length; index++ ) {
                        var tmp1 = intLinkRTEHrefArr[ index ].replace( "<a", " " );
                        var tmp2 = tmp1.replace( "href=", " " );
                        tmp2 = tmp2.replace( '"', " " );
                        tmp2 = tmp2.replace( '"', " " );
                        tmp2 = tmp2.trim();
                        ctrl.insertNonTrellisPreview( tmp2 );
                    }
                }
            },
            cleanup: true,
            //force_br_newlines : true,
            //force_p_newlines : false,
            //forced_root_block : false,
            //forced_root_block_attrs: {
            //'class': 'myclass',
            //'data-something': 'my data'
            //},
            keep_styles: false,
            browser_spellcheck: true,
            allow_conditional_comments: true,
            //contextmenu: "link image inserttable | cell row column deletetable",
            //maxCharacters : 50,
            //width: 600,
            //height: 200,
            convert_urls: false,
            //urlconverter_callback : "myCustomURLConverter",
            relative_urls: false,
            remove_script_host: false,
            trellis_auto_link_callback: ctrl.autoLinkCallback,
            //document_base_url: 'http://www.tinymce.com/tryit/',
            //auto_focus : ctrl.objId,
            setup: function ( editor ) {
                //editor.on('PreInit', function(e) { console.log('--PreInit event--'); });
                editor.on( 'init', function ( args ) {

                    if ( ctrl.getModelVal() === "" && ctrl.placeHolder !== "" ) {
                        editor.setContent( ctrl.placeHolder );
                    } else {
                        editor.setContent( ctrl.getModelVal() );
                    }

                    if ( ctrl.hidemenubarFlg ) {
                        ctrl.hidemenubarFlgCls = 'border-onepx hide-menu-bar-on-blur';
                        ctrl.showSaveBtnHiddenMenu = false;
                        $timeout( function doFocus() {
                            $( ".rte-loader-wraper" ).removeClass(
                                'rte-loader-wraper' );
                        } );
                    }

                    editor.save();
                    ctrl.getFullModelValData = ctrl.getFullModelVal();

                    if ( ctrl.focusFlg ) {

                        var UA = apiService.getUserAgent();
                        if ( $scope.scrollFlg ) {
                            apiService.scrollToEleView( '#RTEMainID_' +$scope.ediId, UA );
                        }

                        if ( UA.isSafari ) {
                            ctrl.focusOnEndFn();
                        }
                        else {
                        setTimeout( function doFocus() {
                            ctrl.focusOnEndFn();
                        }, 333 );
                    }
                    }

                    //ctrl.calDisableFn();
                    ctrl.initLoadFlg = true;

                    if ( !angular.isUndefined( ctrl.docObjMap ) && ctrl.docObjMap ) {
                        $timeout( function () {
                            setDocResMapData();
                        } );
                    }

                    if ( ctrl.newToolbar ) {
                        var tempDiv = ctrl.objId + 'contdiv';
                        var toolbar = $( args.target.editorContainer ).find( '>.' +
                            tempDiv + ' >.mce-container-body >.mce-toolbar-grp' );
                        var ed = $( args.target.editorContainer ).find( '>.' + tempDiv +
                            ' >.mce-container-body >.mce-edit-area' );

                        // switch the order of the elements
                        toolbar.detach().insertAfter( ed );
                    }
                } );

                editor.on( 'change', function ( e ) {
                    editor.save();
                    //ctrl.updateModelVal(editor.getContent());
                    if ( !ctrl.placeHolderFlg ) {
                        var tempEdiData = editor.getContent();
                        ctrl.updateModelValMod( tempEdiData );
                        var tempDirtyFlgCB = dirtyFormService.getDirtyFormFlg();
                        if ( ctrl.reportDirtyFlg &&
                            ( !tempDirtyFlgCB ||
                                ( ctrl.dirtyFrmIncFlg && !$scope.reportdirtyactive ) ) &&
                            ( tempEdiData && tempEdiData.length ) ) {
                            if ( !ctrl.updateByWatch ) {
                                $scope.reportdirtyactive = true;
                                dirtyFormService.setDirtyFormFlg( true, ctrl.dirtyFrmIncFlg );
                            } else {
                                ctrl.updateByWatch = false;
                            }
                        }
                    }
                } );
                editor.on( 'keyup', function ( e ) {
                    editor.save();
                    ctrl.updateModelValMod( editor.getContent() );
                } );
                editor.on( 'focus', function ( e ) {

                    ctrl.focusActive = true;

                    ctrl.focusDone = true;
                    ctrl.hasFocus = 'hasFocus';
                    if ( ctrl.hidemenubarFlg ) {
                        ctrl.hidemenubarFlgCls = 'border-onepx show-menu-bar-on-focus';
                        ctrl.showSaveBtnHiddenMenu = true;
                    }

                    if ( ctrl.getModelVal() === "" && ctrl.placeHolder !== "" ) {
                        editor.setContent( ctrl.getModelVal() );
                        ctrl.placeHolderFlg = false;
                    }
                    if ( ctrl.fieldName && ctrl.resetFieldFn ) {
                        ctrl.resetFieldFn( ctrl.fieldName, true );
                    }
                    editor.save();
                    //ctrl.focusFn();
                } );
                editor.on( 'blur', function ( e ) {

                    ctrl.focusActive = false;

                    if ( ctrl.getModelVal() === "" && ctrl.placeHolder !== "" ) {
                        ctrl.placeHolderFlg = true;
                        editor.setContent( ctrl.placeHolder );
                    }

                    ctrl.hasFocus = '';
                    editor.save();
                    /*if( ctrl.hideonblurflg ){
                        ctrl.showEditorflg = false;
                    }*/

                    /*var eventTargetID = $(e.target).attr('id');
                    console.log(e.target,'eventTargetIs',eventTargetID,'ctrl.objId',ctrl.objId);
                    if( $("#"+eventTargetID).hasClass(ctrl.objId+'class')){
                        ctrl.emojiClick = true;
                        console.log('clicked in nnn ookkk');
                    }*/

                    if ( ctrl.emojiClick ) {
                        ctrl.emojiClick = false;
                    } else {
                        if ( ctrl.hidemenubarFlg ) {
                            if ( $( ".show-menu-bar-on-focus" ).hasClass(
                                    'emoji-clicked' ) === false ) {
                                ctrl.hidemenubarFlgCls =
                                    'border-onepx hide-menu-bar-on-blur';
                                ctrl.showSaveBtnHiddenMenu = false;
                            }
                            //ctrl.hidemenubarFlgCls = 'border-onepx hide-menu-bar-on-blur';
                        }
                        var tempv = ctrl.blurFn();
                    }

                    //editor.convertURL();
                } );
                editor.addButton( 'insertButton', {
                    title: 'Insert',
                    type: 'menubutton',
                    icon: 'Icon-Close',
                    classes: 'buttonstyle insertButton',
                    onclick: function () {
                        if ( $scope.annoFlg ) {
                            if ( ctrl.objId === 'addAnnottID1' ) {
                                var menu_id = this.menu._id;
                                $( "#" + menu_id ).addClass(
                                    'fixed-mce-menu-has-icons' );
                                var topPosition = $( ".mce-insertButton" )[ 0 ].getBoundingClientRect()
                                    .top;
                                var subMenuHei = parseInt( $( "#" + menu_id ).css(
                                    'height' ), 10 );
                                topPosition = ( topPosition - subMenuHei );
                                $( "#" + menu_id ).css( 'top', topPosition );
                            }
                        }
                    },
                    menu: [
                        {
                            text: 'Insert...',
                            classes: 'disableanchor insert-alignment'
                        },
                        {
                            text: 'Trellis Link',
                            icon: 'trellis-link',
                            onclick: function () {
                                if ( ctrl.custLinkFlg != 2 ) {
                                    ctrl.custLinkFlg = false;
                                }
                                ctrl.custLinkFn( 2, true );
                            }
                        },
                        {
                            text: 'Web Link',
                            icon: 'web-link',
                            onclick: function () {
                                if ( ctrl.custLinkFlg != 1 ) {
                                    ctrl.custLinkFlg = false;
                                }
                                ctrl.custLinkFn( 1, true );
                            }
                        },
                        {
                            text: 'File',
                            icon: 'file-icon',
                            onclick: function () {
                                ctrl.calSelectedGroupFn( true );
                                ctrl.uploadDocument();
                            }
                        },
                        {
                            text: 'Image',
                            icon: 'rte-image',
                            onclick: function () {
                                tinymce.execCommand( 'mceFocus', false );
                                ctrl.custImgUpload( true );
                            }
                        }
                    ]
                } );
                editor.addButton( 'customfontsize', {
                    title: 'Font Format',
                    type: 'menubutton',
                    //text: 'Font Format',
                    icon: 'removeformat',
                    menu: [
                        {
                            text: 'Small',
                            classes: 'rte-small',
                            onclick: function () {
                                tinymce.execCommand( "fontSize", false, "14px" );
                            }
                        },
                        {
                            text: 'Normal',
                            classes: 'rte-normal',
                            onclick: function () {
                                tinymce.execCommand( "fontSize", false, "16px" );
                            }
                        },
                        {
                            text: 'Large',
                            classes: 'rte-large',
                            onclick: function () {
                                tinymce.execCommand( "fontSize", false, "24px" );
                            }
                        }
                        /*,
                        {
                        text: 'h1',
                        onclick: function() {
                            tinymce.execCommand('FormatBlock', false, 'h1');
                        }}*/
                    ]
                } );
                editor.addButton( 'customPrv', {
                    title: 'Custom Preview Button',
                    //image : 'img/example.gif',
                    onclick: function () {
                        if ( ctrl.getModelVal() !== "" ) {
                            ctrl.getFullModelValData = ctrl.getFullModelVal();
                            ctrl.updatePrvMode( true );
                        }
                    }
                } );
                editor.addButton( 'customImgUpld', {
                    title: 'Custom Image Upload',
                    onclick: function () {
                        tinymce.execCommand( 'mceFocus', false );
                        ctrl.custImgUpload( true );
                    }
                } );
                editor.addCommand( 'updateEditorVal', function ( tempv ) {
                    //editor.setContent( tempv );
                } );
                editor.addButton( 'customLink', {
                    title: 'Custom Link',
                    icon: 'link',
                    onclick: function () {
                        //tinymce.execCommand('mceFocus',false);
                        ctrl.custLinkFn( 1, true );
                    }
                } );
                //editor.on('NodeChange', function(e) {
                //  console.log('NodeChange event', e, e.element.nodeName.toLowerCase(), e.element.origin, e.element.attributes, e.element.attributes['href'].value);
                //});
                editor.addButton( 'uploadDoc', {
                    title: 'Add an Attachment',
                    classes: 'widget btn first last uploadDoc',
                    onclick: function () {
                        ctrl.calSelectedGroupFn( true );
                        ctrl.uploadDocument();
                    }
                } );
                editor.addButton( 'emoji', {
                    title: 'Add Emoji',
                    icon: 'emoticons',
                    classes: 'emojionepicker-picker',
                    onclick: function () {

                        $(this).focus();
                        ctrl.emojiClick = true;

                        var id = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
                        var containerId = 'emojionepicker_' + id;

                        $( ".emojiOneWrapper" ).each( function () {
                            if ( $( this ).children().attr( 'id' ) !==
                                containerId ) {
                                $( this ).removeClass( 'active' );
                            }
                        } );

                        $( "#" + containerId ).parent().toggleClass( 'active' );

                        if($( "#" + containerId ).parent().hasClass('active')){
                            $( "#" + containerId ).css('display','block');
                        }

                        ctrl.emojiButtonId = this._id;
                    },
                    onpostrender: function () {
                        var btn = this;
                        editor.on( 'init', function () {
                            var id = $( '.' + ctrl.objId + 'class' ).attr(
                                'id' );
                            //$( ".mce-i-emoji" ).addClass('emojionepicker-picker');
                            $( "#" + id ).emojionePicker( {}, editor, id, ctrl.afterEmojiInsertFn );
                        } );
                    }
                } );

                editor.addButton( 'annotationButton', {
                    title: 'Font Format',
                    type: 'menubutton',
                    icon: 'Icon-text',
                    classes: 'buttonstyle annotationButton',
                    onclick: function () {

                        if ( $scope.annoFlg ) {
                            if ( ctrl.objId === 'addAnnottID1' ) {
                                var menu_id = this.menu._id;
                                $( "#" + menu_id ).addClass(
                                    'fixed-mce-menu-has-icons' );
                                var topPosition = $( ".mce-annotationButton" )[ 0 ]
                                    .getBoundingClientRect().top;
                                var subMenuHei = parseInt( $( "#" + menu_id ).css(
                                    'height' ), 10 );
                                topPosition = ( topPosition - subMenuHei );
                                $( "#" + menu_id ).css( 'top', topPosition );
                            }
                        }
                    },
                    menu: [
                        {
                            text: 'Bold',
                            icon: 'bold',
                            onClick: function () {
                                editor.execCommand( 'Bold' );
                            }
                        },
                        {
                            text: 'Italic',
                            icon: 'italic',
                            onClick: function () {
                                editor.execCommand( 'Italic' );
                            }
                        },
                        {
                            text: 'Bullist',
                            icon: 'bullist',
                            onClick: function () {
                                editor.execCommand( 'InsertUnorderedList' );
                            }
                        },
                        {
                            text: 'Numlist',
                            icon: 'numlist',
                            onClick: function () {
                                editor.execCommand( 'InsertOrderedList' );
                            }
                        }
                    ]
                } );

                editor.on( 'click', function ( e ) {

                    var partString = 'unqDivClickImg_';
                    var str = e.target.id;
                    var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
                    var editorInst = tinyMCE.get( tempele );

                    if ( ctrl.hidemenubarFlg ) {
                        $scope.$apply( function () {
                            ctrl.hidemenubarFlgCls =
                                'border-onepx show-menu-bar-on-focus';
                            ctrl.showSaveBtnHiddenMenu = true;
                        } );
                    }

                    if ( str.indexOf( partString ) > -1 ) {
                        var id = str.substring( 15 );
                        var uniqImageId = 'unqimg_' + id;
                        var divId = 'IMG_' + id;
                        var uniqDivClickId = 'unqDivClickImg_' + id;
                        var uniqDivDelId = 'uniqDivDelId' + id;
                        var tmpDivToAdd = '';
                        var tempStr = '';

                        for ( var i = 0; i < ctrl.imageFileList.length; i++ ) {

                            if ( ctrl.imageFileList[ i ].expand &&
                                id == ctrl.imageFileList[ i ].timestamp ) {

                                editorInst.dom.remove( 'unqimg_' + id );
                                tmpDivToAdd = '<span id=' + uniqDivClickId +
                                    ' class="button-expand Icon-FullImage mceNonEditable"></span>';
                                tempStr = '<img id=' + uniqImageId +
                                    ' class="RTECustom-image-class" src="' + ctrl.imageFileList[
                                        i ].publicPath + '"' + ' data-mce-src="' + ctrl
                                    .imageFileList[ i ].publicPath + '"' + ' />' +
                                    tmpDivToAdd;
                                editorInst.dom.setHTML( divId, tempStr );
                                ctrl.imageFileList[ i ].expand = false;

                            } else if ( !ctrl.imageFileList[ i ].expand &&
                                id == ctrl.imageFileList[ i ].timestamp ) {

                                editorInst.dom.remove( 'unqimg_' + id );
                                tmpDivToAdd = '<span id=' + uniqDivClickId +
                                    ' class="button-collapse Icon-HalfImage mceNonEditable"></span>';
                                tempStr = '<img id=' + uniqImageId +
                                    ' class="RTECustom-image-class img-100" src="' +
                                    ctrl.imageFileList[ i ].publicBigFilePath + '"' +
                                    ' data-mce-src="' + ctrl.imageFileList[ i ].publicBigFilePath +
                                    '"' + ' />' + tmpDivToAdd;
                                editorInst.dom.setHTML( divId, tempStr );
                                ctrl.imageFileList[ i ].expand = true;

                            }
                        }
                    }

                    var parseYoutubeStr = 'YOUTUBEIMG_';
                    if ( str.indexOf( parseYoutubeStr ) > -1 ) {
                        var youtid = str.substring( 11 );
                        var youtiduniqImageId = 'unqDivParent_' + youtid;
                        editorInst.dom.remove( youtiduniqImageId );
                    }

                    var parseOtherUrl = 'OTHERIMG_';
                    if ( str.indexOf( parseOtherUrl ) > -1 ) {
                        var othid = str.substring( 9 );
                        var othImageId = 'unqDivClickOtherImg_' + othid;
                        editorInst.dom.remove( othImageId );
                    }

                    var parseOthImageStr = 'uniqDivDelOthId';
                    if ( str.indexOf( parseOthImageStr ) > -1 ) {
                        var delOthId = str.substring( 15 );
                        var delOthImageId = 'uniqDivDelOtherId' + delOthId;
                        editorInst.dom.remove( delOthImageId );
                    }

                } );
            }
        } );

    };

    ctrl.afterEmojiInsertFn = function(data) {        
        $('#'+ctrl.emojiButtonId+'-button').focus();
    };

    ctrl.uploadDocument = function () {
        if ( ctrl.selGroupObj ) {
            apiService.setAddDocPopupVal( true );
            var tempObj = {
                "callBackFn": ctrl.getDocuments,
                "groupObj": ctrl.selGroupObj
            };
            apiService.setLinkInsertCallBack( tempObj );
        } else {
            simpleModalAlertService.setMessage( "Add an Attachment",
                "Add an attachment is not enabled for non group content." );
        }
    };

    ctrl.getDocuments = function () {
        var tempReqParams = 'params';
        var request = libraryService.getUploadedDocs();

        request[ tempReqParams ][ 'upload_session' ] = apiService.getUploadSession();
        request[ tempReqParams ][ 'rte_upload' ] = 1;

        apiService.submitRequest( request ).then(
            function ( response ) {
                ctrl.getDocumentsResponse( response );
            },
            function ( err ) {

            }
        );
    };

    var docIdArr = [];
    ctrl.getDocumentsResponse = function ( response ) {
        apiService.setUploadSession( false );
        var dataResponse = apiService.processResponse( response );
        if ( dataResponse.apiResponse.status == 'success' ) {

            var urlPath = $location.path();
            if ( urlPath.indexOf( '/group-pinned-content' ) > -1 ||
                urlPath.indexOf( '/announcement-detail' ) > -1 ||
                urlPath.indexOf( '/group-announcement' ) > -1 ) {
                if ( ctrl.objId ) {
                    apiService.setTempAnnRTEId( ctrl.objId );
                }
            }

            var returnedData = dataResponse.apiResponse.data.DocumentLibrary;

            if ( returnedData ) {
                editorInstFn().execCommand( 'mceInsertContent', false, '<span>&nbsp;</span>' );
            }

            for ( var i in returnedData ) {
                var tempData = {};
                tempData[ 'object_id' ] = returnedData[ i ];
                tempData[ 'object_type' ] = 7;
                var tempObjMap = ctrl.searchDDMaps[ '7' ];
                var tempResMap = dataResponse.apiResponse.resource_map_min[
                    tempObjMap.objname_backend ][ tempData.object_id ];

                tempData[ 'image' ] = tempObjMap.dd_image;
                tempData[ 'redirectUrl' ] = '/' + tempObjMap.dd_url + '/';
                tempData[ 'link' ] = tempObjMap.dd_url + '/';
                tempData[ 'id' ] = tempData.object_id;
                tempData[ 'resource_map_min' ] = tempResMap;

                tempData[ 'name' ] =
                    tempResMap.Metadata.title.toString().toLowerCase() === 'untitled' ?
                    tempResMap.Metadata.documentName : tempResMap.Metadata.title;

                tempData[ 'id' ] = tempResMap.DocumentLibrary.document_id;
                tempData[ 'groupId' ] = tempResMap.Discussion.group_id;
                tempData[ 'adhocId' ] = ( tempResMap.Discussion.type == 2 ) ? tempData[ 'groupId' ] : 0;

                tempData[ 'link' ] = tempData.link + tempData.id;
                if ( tempData.redirectUrl == '/document-detail/' ) {
                    tempData[ 'link' ] += '/' + tempData.adhocId + '/' + tempData.groupId;
                }

                tempData[ 'link' ] = ctrl.windowHref + '#/' + tempData[ 'link' ];

                if ( urlPath.indexOf( '/group-pinned-content' ) > -1 ||
                    urlPath.indexOf( '/announcement-detail' ) > -1 ||
                    urlPath.indexOf( '/group-announcement' ) > -1 ) {
                    apiService.setDocIdsArr( tempResMap.DocumentLibrary.document_id );
                } else {
                    docIdArr.push( tempResMap.DocumentLibrary.document_id );
                }

                apiService.setCommentsRTEId(
                    ctrl.objId,
                    true,
                    tempResMap.DocumentLibrary.document_id
                );

                ctrl.custLinkInsertFn( 3, tempData );
            }
        }
    };

    var editorInstFn = function () {
        var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
        return tinyMCE.get( tempele );
    };

    ctrl.deleteDocumentFn = function () {
        var urlPath = $location.path();
        if ( urlPath.indexOf( '/group-pinned-content' ) > -1 ||
            urlPath.indexOf( '/announcement-detail' ) > -1 ||
            urlPath.indexOf( '/group-announcement' ) > -1 ) {
            docIdArr = [];
            docIdArr = apiService.getDocIdsArr();
        }

        if ( docIdArr && docIdArr.length > 0 ) {
            var request = libraryService.deleteDocumentById();

            request.data.document_ids = docIdArr.toString();
            request.data.type = '1';

            apiService.submitRequest( request ).then(
                function ( response ) {
                    apiService.processResponse( response );
                    ctrl.redirectFn( true );
                },
                function ( err ) {
                    apiService.processResponse( err );
                    ctrl.redirectFn( false );
                }
            );
        }
    };

    ctrl.redirectFn = function ( actionRef ) {
        apiService.setTempAnnRTEId( false );
        apiService.setDocIdsArr( false );
        redirectUrl( actionRef );
        apiService.setLinkInsertCallBack( false );
        ctrl.deleteDocPopup = 'css-hide';
    };

    var deleteUploadedRTEDocFn = function ( redirectFnRef ) {

        ctrl.rejectedRTELinksUploaded = [];
        if ( ctrl.objId ) {
            var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
            var editorInst = tinyMCE.get( tempele );
            if ( editorInst ) {
                ctrl.tempContentRTE = editorInst.getContent();
                if ( ctrl.tempContentRTE && ctrl.tempContentRTE !== '' ) {

                    var urlPath = $location.path();
                    if ( urlPath.indexOf( '/group-pinned-content' ) > -1 ||
                        urlPath.indexOf( '/announcement-detail' ) > -1 ||
                        urlPath.indexOf( '/group-announcement' ) > -1 ) {
                        docIdArr = [];
                        docIdArr = apiService.getDocIdsArr();
                        var tempRTEIdAnn = apiService.getTempAnnRTEId();
                        if ( tempRTEIdAnn ) {
                            ctrl.tempContentRTE = '';
                            for ( var rteId in tempRTEIdAnn ) {
                                var tempeleAnn = $( '.' + rteId + 'class' ).attr( 'id' );
                                var editorInstAnn = tinyMCE.get( tempeleAnn );
                                if ( editorInstAnn ) {
                                    ctrl.tempContentRTE = ctrl.tempContentRTE + editorInstAnn.getContent();
                                }
                            }
                        }
                    }

                    var matchPattern = /<span class=\"rteIntLinkClass(.*?)<\/span>/g;
                    if ( matchPattern.test( ctrl.tempContentRTE ) ) {

                        var intLinkRTEArr = ctrl.tempContentRTE.match( matchPattern );
                        for ( var i in intLinkRTEArr ) {

                            var tempLink = intLinkRTEArr[ i ];

                            var tempLinkAttrObj = {};
                            tempLinkAttrObj[ 'link_str' ] = tempLink;

                            for ( var j in docIdArr ) {
                                var tempSubLink = docIdArr[ j ];
                                if ( tempSubLink.length > 1 ) {
                                    var tempIndx = tempLink.indexOf( tempSubLink );
                                    if ( tempIndx > -1 ) {
                                        ctrl.rejectedRTELinksUploaded.push( tempLinkAttrObj );
                                    }
                                }
                            }
                        }

                        ctrl.tempRejLinkStr = '';
                        for ( var k in ctrl.rejectedRTELinksUploaded ) {
                            var tempRejLink = ctrl.rejectedRTELinksUploaded[ k ];
                            if ( tempRejLink.link_str && tempRejLink.link_str !== '' ) {
                                ctrl.tempRejLinkStr = ctrl.tempRejLinkStr + tempRejLink.link_str + '<br/>';
                            }
                        }

                        ctrl.deleteDocPopup = '';
                        if ( !redirectFnRef ) {
                            redirectUrl = deleteUploadedDocsFn;
                        } else {
                            redirectUrl = redirectFnRef;
                        }
                    }
                }
            }
        }

    };

    var deleteUploadedDocsFn = function ( actionRef ) {
        if ( actionRef && ctrl.rejectedRTELinksUploaded.length &&
            ctrl.tempContentRTE && ctrl.tempContentRTE !== '' ) {
            for ( var k in ctrl.rejectedRTELinksUploaded ) {
                var tempRejLink = ctrl.rejectedRTELinksUploaded[ k ];
                if ( tempRejLink.link_str && tempRejLink.link_str !== '' ) {
                    ctrl.tempContentRTE = ctrl.tempContentRTE.replace( tempRejLink.link_str, '' );
                }
            }
            $timeout( function () {
                $scope.$apply( function () {
                    ctrl.modelDataRTEVal = ctrl.tempContentRTE;
                    if ( ctrl.objId ) {
                        var tempele = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
                        var editorInst = tinyMCE.get( tempele );
                        editorInst.setContent( ctrl.tempContentRTE );
                        editorInst.execCommand( 'mceFocus', false );
                    }
                    ctrl.calSelectedGroupFn( undefined, true );
                } );
            } );
        } else {
            ctrl.calSelectedGroupFn( undefined, true );
        }
    };

    ctrl.retrievedLink = '';
    ctrl.changeValueFn = function ( dataRTEVal ) {
        dataRTEVal = dataRTEVal.replace( /<span class=\"rteIntLinkClass(.*?)<\/span>/g, '' );
        var matchPattern = /href="(\b(https?|http|ftp|file):\/\/[^"]*)/i;
        if ( matchPattern.test( dataRTEVal ) ) {
            var getHref = dataRTEVal.match( matchPattern )[ 1 ];
            if ( ctrl.retrievedLink !== getHref ) {
                ctrl.retrievedLink = getHref;
                //ctrl.extractUrl2(getHref);
            } else {
                if ( ctrl.rmeSupportFlg ) {
                    $scope.ediModel = ctrl.buildFullModelRMELinkVal();
                }
            }
        } else {
            ctrl.retrievedLink = '';
            //ctrl.extractUrlData = '';
            ctrl.setModelRMEVal( '' );
            ctrl.extractApiResponse = false;
            if ( ctrl.rmeSupportFlg ) {
                $scope.ediModel = ctrl.buildFullModelRMELinkVal();
            }
        }
    };

    ctrl.extractUrl2 = function ( srcUrl ) {
        if ( srcUrl !== '' ) {
            ctrl.rmeUrl = '';
            ctrl.rmeUrl = srcUrl;
            //$scope.ediModel = ctrl.buildFullModelVal();
            ctrl.acceptRequest( 'MODMETA', apiService.extractURL(), srcUrl, false );
        }
    };

    ctrl.extractUrlData = '';
    ctrl.tempAPICALL = '';
    ctrl.acceptRequest = function ( APICALL, requestObj, objectId, requestData ) {

        var request = requestObj;
        if ( objectId ) {
            request.url = request.url.replace( "@id", objectId );
        }
        if ( requestData ) {
            request.data = requestData;
        }
        ctrl.tempAPICALL = APICALL;
        apiService.submitRequest( request ).then(
            function ( response ) {
                ctrl.requestActionResponse( response, objectId );
            },
            function ( err ) {
                ctrl.requestActionResponse( err );
            }
        );
    };

    ctrl.extractApiResponse = false;
    ctrl.requestActionResponse = function ( response, objectId ) {
        try {
            var myResponse = {};
            myResponse.data = {};
            myResponse.data.apiResponse = response;
            myResponse.status = 200;
            var dataResponse = apiService.processResponse( myResponse );
            dataResponse = dataResponse.apiResponse;
            if ( dataResponse.data ) {
                ctrl.extractApiResponse = dataResponse.data;
                if ( !( angular.isUndefined( dataResponse.data.description ) ) && ( dataResponse.data.description !==
                        '' ) ) {
                    /*var tempv1 = '', tempv2 = '';
                    if( !ctrl.rmeUrl || (ctrl.rmeUrl && ctrl.rmeUrl === '') ) { 
                        if ( !(angular.isUndefined(dataResponse.data.url)) && (dataResponse.data.url !== '') ){
                            ctrl.rmeUrl = dataResponse.data.url;
                        }
                        else if ( !(angular.isUndefined(dataResponse.data.author_url)) && (dataResponse.data.author_url !== '') ){
                            ctrl.rmeUrl = dataResponse.data.author_url;
                        }
                    }
                    if( !(angular.isUndefined(dataResponse.data.thumbnail_url)) && (dataResponse.data.thumbnail_url !== '') ){
                        tempv1 += "<!--valRMEImgStart-->" +"<img src=\""+(dataResponse.data.thumbnail_url)+"\" />" +"<!--valRMEImgEnd-->";
                    }
                    tempv2 += "<!--valRMEDataStart-->";
                    if( !(angular.isUndefined(dataResponse.data.provider_url)) && (dataResponse.data.provider_url !== '') ){
                        var provider_url = dataResponse.data.provider_url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
                        tempv2 += "<!--valRMETitleStart--><span class='display-block'>"+ provider_url +"</span><!--valRMETitleEnd-->";
                    }
                    if( !(angular.isUndefined(dataResponse.data.title)) && (dataResponse.data.title !== '') ){
                        tempv2 += "<!--valRMETitleStart--><h2>"+ dataResponse.data.title +"</h2><!--valRMETitleEnd-->";
                    }
                    if( !angular.isUndefined(dataResponse.data.description) && response.data.description !== '' ){
                        tempv2 += (dataResponse.data.description);
                    }
                    else if( !angular.isUndefined(dataResponse.data.html) && response.data.html !== '' ){
                        tempv2 += (dataResponse.data.html);
                    }
                    //if( !(angular.isUndefined(dataResponse.data.provider_url)) && (dataResponse.data.provider_url !== '') ){
                    //    tempv2 += "<!--valRMEUrlStart--><span class=\"rmeLink\"><br/><br/>"+ dataResponse.data.provider_url +"</span><!--valRMEUrlEnd-->";
                    //}
                    tempv2 = tempv2.replace( new RegExp("<iframe.*?<\/iframe>","igm"), '' );
                    tempv2 += "<!--valRMEDataEnd-->";
                    ctrl.modelDataRMEImg = tempv1;
                    ctrl.modelDataRMEData = tempv2;
                    ctrl.setModelRMEVal(tempv1 + tempv2);
                    ctrl.updateModelValRME();*/
                    if ( !( angular.isUndefined( dataResponse.data.provider_name ) ) &&
                        dataResponse.data.provider_name !== '' ) {
                        ctrl.makeLinkPreview( dataResponse.data, objectId );
                    }

                } else {
                    //ctrl.updateModelValRME();
                }
            }
        } catch ( e ) {
            var error = JSON.parse( e.message );
            if ( error[ 0 ] ) {
                error = error[ 0 ];
            }
        }
    };

    ctrl.makeLinkPreview = function ( embedlyData, srcUrl ) {

        if ( embedlyData.provider_name.toLowerCase() == 'youtube' ) {
            ctrl.makeYoutubeLinkPreview( embedlyData, srcUrl );
        } else {
            // ctrl.makeOtherUrlLinkPreview( embedlyData, srcUrl );
            ctrl.makeOtherLinkPreview( embedlyData );
        }
    };

    ctrl.makeOtherLinkPreview = function( embedlyData ) {
        var descStr = '<div class="display-initial"><p class="blue-text">' + embedlyData.provider_url +
            '</p>' +
            '<h4>' + embedlyData.title + '</h4>' + '<p>' + embedlyData.description + '</p></div>' +
            '<div class="clearfix"></div>';

        var tempStr = '';

        if ( embedlyData.thumbnail_url && !angular.isUndefined( embedlyData.thumbnail_url ) ) {
            tempStr = '<div class="float-left tinymcd-img" title="' +
                embedlyData.url + '@@IMG-PATH-END">' +
                '<img class="rem-preview" src="' + embedlyData.thumbnail_url + '" /></div>';
        }
        var data = {'image' : tempStr,
                    'data' : descStr};

        ctrl.setModelRMELinkVal(data);
    };

    ctrl.makeYoutubeLinkPreview = function ( embedlyData ) {

        var unqDate = Date.now();
        var uniqId = 'YOUTUBEIMG_' + unqDate;
        var uniqDivParentId = 'unqDivParent_' + unqDate;

        var uniqDivClickId = 'unqDivClickYouTubeImg_' + unqDate;
        var tmpDivToAdd = '<div id=' + uniqDivClickId + ' class="delete-frame"><div id=' + uniqId +
            ' class="delete-icon-rte"></div>';

        var dataUrl = embedlyData.url;
        var code = dataUrl.substring( dataUrl.lastIndexOf( '=' ) + 1 );

        var embededString = '//www.youtube.com/embed/' + code;

        var tempStr = '<img class="mce-object mce-object-iframe" width="425" height="350" src="' +
            embedlyData.thumbnail_url + '" data-mce-p-src="' + embededString +
            '" data-mce-selected="1" data-mce-object="iframe">';
        var descStr = '<div class="thick-border"><p class="blue-text">' + embedlyData.provider_name +
            '</p>' +
            '<h4>' + embedlyData.title + '</h4>';

        var overlayZoomBtn = tmpDivToAdd + descStr + '<div class="full-width-video" title="' + embedlyData.url +
            '@@IMG-PATH-END">' + tempStr;

        overlayZoomBtn = overlayZoomBtn + '</div></div></div>';

        var tempeleRem = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
        var editorInst = tinyMCE.get( tempeleRem );
        var finalHtml =
            '<!--rte-preview-start-youtube--><div id="' + uniqDivParentId + '" class="mceNonEditable" style="min-height:300px;">' +
            overlayZoomBtn + '</div>' +
            '<div>&nbsp;</div><!--rte-preview-end-youtube-->&nbsp;';
        //editorInst.selection.setContent(finalHtml);
        editorInst.insertContent( finalHtml, false );
    };

    ctrl.makeOtherUrlLinkPreview = function ( embedlyData ) {
        var unqDate = Date.now();
        var uniqId = 'OTHERIMG_' + unqDate;
        var uniqDivDelId = 'uniqDivDelOthId' + unqDate;
        var delImageId = 'uniqDivDelOtherId' + unqDate;

        var uniqDivClickId = 'unqDivClickOtherImg_' + unqDate;
        var uniqDivParentId = 'unqDivParent_' + unqDate;
        var tmpDivToAdd = '<div id=' + uniqDivClickId + ' class="delete-frame"><div id=' + uniqId +
            ' class="delete-icon-rte"></div>';

        var descStr = '<div class="display-initial"><p class="blue-text">' + embedlyData.provider_url +
            '</p>' +
            '<h4>' + embedlyData.title + '</h4>' + '<p>' + embedlyData.description + '</p></div>' +
            '<div class="clearfix"></div>';

        var tempStr = '';

        if ( embedlyData.thumbnail_url && !angular.isUndefined( embedlyData.thumbnail_url ) ) {
            tempStr = '<div id=' + delImageId + ' class="float-left tinymcd-img" title="' +
                embedlyData.url + '@@IMG-PATH-END">' +
                // '<div class="delete-icon-rte prview-delete" id=' + uniqDivDelId + '></div>' +
                '<img class="rem-preview" src="' + embedlyData.thumbnail_url + '" /></div>';
        }

        var overlayZoomBtn = tmpDivToAdd + '<div class="thick-border">' + tempStr + descStr;

        overlayZoomBtn = overlayZoomBtn + '</div></div>';

        var tempeleRem = $( '.' + ctrl.objId + 'class' ).attr( 'id' );
        var editorInst = tinyMCE.get( tempeleRem );
        var finalHtml = '<!--rte-preview-start-link-->' + embedlyData + '<!--rte-preview-end-link-->';

        var data = {'image' : tempStr,
                    'data' : descStr};

        ctrl.setModelRMELinkVal(data);
        ctrl.updateModelRMELinkVal();

        var parId = '#' + uniqDivParentId;
        angular.element( parId ).focus();
        editorInst.dom.remove( uniqDivParentId );
    };

    ctrl.updateModelRMELinkVal = function () {
        if( ctrl.rmeSupportFlg ) {
            $scope.ediModel = ctrl.buildFullModelRMELinkVal();
        }
    };

    ctrl.buildFullModelRMELinkVal = function () {
        var tempv = "";
        if( ctrl.getModelVal() !== '' ) {
                
                tempv += "<!--dataMainContainerStart--><!--dataRTEContainerStart-->" + 
                        ctrl.getModelVal() + "<!--dataRTEContainerEnd--><!--dataRMELinkContainerStart-->";
                
                if( ctrl.getModelRMELinkVal() !== null && ctrl.getModelRMELinkVal().length) {
                        for(var i in ctrl.getModelRMELinkVal() ) {
                            var tempImage = ctrl.getModelRMELinkVal()[i].image;

                            tempv +=
                            "<!--rte-preview-start-link--><div class=\"delete-frame margin-20\">"+
                                "<div class=\"thick-border\">";

                            if(angular.isDefined(tempImage) && tempImage !== "") {
                                tempv +=  "<!--rte-start-link-image-->" + tempImage + "<!--rte-end-link-image-->";                                
                            }

                            tempv += "<!--rte-start-link-data-->" + ctrl.getModelRMELinkVal()[i].data + "<!--rte-end-link-data-->"+
                                "</div>"+
                            "</div><!--rte-preview-end-link-->";
                        }
                }

                tempv += "<!--dataRMELinkContainerEnd--><!--dataMainContainerEnd-->";
                tempv = ctrl.replaceIfmToImg( tempv );
                tempv = ctrl.replacePadToBlkqts( tempv );
        }
        ctrl.getFullModelValData = tempv;
        return tempv;
    };

    ctrl.removeModelRMELink = function( index, removeImage ) {
        $timeout( function () {
            $scope.$apply( function () {
        var reversePosition = ctrl.modelRMELinkVal.length - 1 - index;
        if( removeImage ) {
            delete ctrl.modelRMELinkVal[reversePosition].image;

        } else {
            ctrl.modelRMELinkVal.splice(reversePosition, 1);
        }
        
        ctrl.updateModelRMELinkVal();
            });
        });
    };

    ctrl.modelRMELinkVal = [];
    ctrl.setModelRMELinkVal = function( dataRME ) {
        $timeout( function () {
            $scope.$apply( function () {
                dataRME.timestamp = new Date().getTime();
        ctrl.modelRMELinkVal.push(dataRME);
                ctrl.updateModelRMELinkVal();
            });
        });
    };

    ctrl.getModelRMELinkVal = function() {
        return ctrl.modelRMELinkVal;
    };

    ctrl.updateModelVal = function ( modelVal ) {
        $scope.$apply( function () {
            if ( ctrl.rmeSupportFlg ) {
                //$scope.ediModel = modelVal;
                ctrl.modelDataRTEVal = modelVal;
                ctrl.changeValueFn( modelVal );
            } else {
                $scope.ediModel = modelVal;
                ctrl.modelDataRTEVal = modelVal;
            }
        } );
    };

    ctrl.updateModelValMod = function ( modelVal ) {
        $timeout( function () {
            if ( ctrl.rmeSupportFlg ) {
                //$scope.ediModel = modelVal;
                ctrl.modelDataRTEVal = modelVal;
                ctrl.changeValueFn( modelVal );
            } else {
                var tempv = modelVal;
                tempv = ctrl.replaceIfmToImg( tempv );
                tempv = ctrl.replacePadToBlkqts( tempv );
                ctrl.getFullModelValData = tempv;
                $scope.ediModel = tempv;
                ctrl.modelDataRTEVal = tempv;
            }
        } );
    };

    ctrl.updateModelValRME = function () {
        if ( ctrl.rmeSupportFlg ) {
            $scope.ediModel = ctrl.buildFullModelVal();
        }
    };

    ctrl.buildFullModelVal = function () {
        var tempv = "";
        if ( ctrl.getModelVal() !== '' ) {
            tempv += "<!--dataMainContainerStart--><!--dataRTEContainerStart-->" + ctrl.getModelVal() +
                "<!--dataRTEContainerEnd-->";
            if ( ctrl.getModelRMEVal() !== '' && ctrl.getModelRMEVal() !== null ) {
                tempv += "<!--dataRMEContainerStart--><div class=\"rmePreview\"><a href=\"" + ctrl.rmeUrl +
                    "\" target=\"_blank\"></a>" + ctrl.getModelRMEVal() +
                    "</div><!--dataRMEContainerEnd-->";
            }
            tempv += "<!--dataMainContainerEnd-->";
            tempv = ctrl.replaceIfmToImg( tempv );
            tempv = ctrl.replacePadToBlkqts( tempv );
        }
        ctrl.getFullModelValData = tempv;
        return tempv;
    };

    ctrl.replaceIfmToImg = function ( tempv ) {

        // Converting Iframe to Img for `ta-bind` to work.
        var matchPatternIfrm = /<iframe .*?src=\"(.*?)\".*?<\/iframe>/ig;
        matchesArrIfrm = tempv.match( matchPatternIfrm );
        if ( matchesArrIfrm !== null ) {
            for ( i = 0; i < matchesArrIfrm.length; i++ ) {
                var tempMatch = matchesArrIfrm[ i ];
                tempMatchArr = tempMatch.match( /<iframe .*?src=\"(.*?)\".*?<\/iframe>/i );
                if ( tempMatchArr !== null ) {
                    var tempv1 =
                        '<img class="ta-insert-video" ta-insert-video="@#@ResouceUrl@#@" src="" allowfullscreen="true" width="300" frameborder="0" height="250">';

                    // As per TRCS-655 wmode attribute added for Iframes
                    var urlLink = tempMatchArr[ 1 ];
                    var wmodeVar = "wmode=transparent";
                    if ( urlLink.indexOf( '?' ) > -1 ) {
                        var getQString = urlLink.split( '?' );
                        var oldString = getQString[ 1 ];
                        var newString = getQString[ 0 ];
                        urlLink = newString + '?' + wmodeVar + '&' + oldString;
                    } else {
                        urlLink = urlLink + '?' + wmodeVar;
                    }

                    //tempv1 = tempv1.replace('@#@ResouceUrl@#@', tempMatchArr[1]);
                    tempv1 = tempv1.replace( '@#@ResouceUrl@#@', urlLink );
                    tempv = tempv.replace( tempMatchArr[ 0 ], tempv1 );
                }
            }
        }

        var tempHtmlContent = tempv;
        var matchPattern = /<img .*?src=\"(.*?)\".*?\/>/ig;
        if ( matchPattern.test( tempv ) ) {
            var intLinkRTEArr = tempv.match( matchPattern );
            for ( var i in intLinkRTEArr ) {
                var tempImgHtml = intLinkRTEArr[ i ];
                if ( tempImgHtml.indexOf( 'RTECustom-image-class' ) < 0 &&
                    tempImgHtml.indexOf( 'RTE-image-class' ) < 0 &&
                    tempImgHtml.indexOf( 'emojione' ) < 0 &&
                    tempImgHtml.indexOf( 'rem-preview' ) < 0 &&
                    tempImgHtml.indexOf( 'tinymce/plugins/emoticons/img/' ) < 0 ) {
                    tempMatchArr = tempImgHtml.match( /src="(.*?)"/i );
                    if ( tempMatchArr[ 1 ] && tempMatchArr[ 1 ] !== '' ) {
                        var finalStr = '&nbsp;<span class="RTE-expand-image mceNonEditable" title="' +
                            tempMatchArr[ 1 ] + '@@IMG-PATH-END">' +
                            tempImgHtml.replace( 'alt=', ' class="RTE-image-class" alt=' ) +
                            '</span>&nbsp;';
                        tempv = tempv.replace( tempImgHtml, finalStr );
                    }
                }
            }
        }

        return tempv;
    };

    ctrl.replacePadToBlkqts = function ( tempv ) {
        // Converting padding-left to BlockQoutes for `ta-bind` to work.
        var matchPatternPad1 = /<(\w*?) style="padding-left:.*?">/ig;
        matchesArrPad1 = tempv.match( matchPatternPad1 );
        if ( matchesArrPad1 != null ) {
            for ( k = 0; k < matchesArrPad1.length; k++ ) {
                var tempMatch11 = matchesArrPad1[ k ];
                var matchPatternPad2 = /<(\w*?) style="padding-left:.*?">/i;
                matchesArrPad2 = tempMatch11.match( matchPatternPad2 );
                var matchesElePad22 = matchesArrPad2[ 1 ]; {
                    //var matchPatternPad = /<(\w*?) style="padding-left:.*?">(.*?)<\/(\w*?)>/ig;
                    //matchesArrPad = tempv.match(matchPatternPad);
                    matchesArrPad = tempv.match( new RegExp( '<' + matchesElePad22 +
                        ' style="padding-left:.*?">(.*?)<\\/' + matchesElePad22 + '>', 'gi' ) );
                    if ( matchesArrPad !== null ) {
                        for ( i = 0; i < matchesArrPad.length; i++ ) {
                            var tempMatch2 = matchesArrPad[ i ];
                            //tempMatchArr2 = tempMatch2.match(/<(\w*?) style="padding-left: (\d*)px;">(.*?)<\/(\w*?)>/i);
                            tempMatchArr2 = tempMatch2.match( new RegExp( '<' + matchesElePad22 +
                                ' style="padding-left: (\\d*)px;">(.*?)<\\/' + matchesElePad22 +
                                '>', 'i' ) );
                            if ( tempMatchArr2 !== null ) {
                                //var matchesElePad1 = tempMatchArr2[1];
                                var tempv2 = '@#@ResouceDataSt1@#@<' + matchesElePad22 +
                                    '>@#@ResouceDataMain@#@</' + matchesElePad22 + '>@#@ResouceDataEn2@#@';
                                var padCount = parseInt( tempMatchArr2[ 1 ], 10 );
                                var padCountVar = padCount / 30;
                                if ( padCountVar ) {
                                    for ( j = 1; j <= padCountVar; j++ ) {
                                        if ( j == padCountVar ) {
                                            tempv2 = tempv2.replace( '@#@ResouceDataSt1@#@', '<blockquote>' );
                                            tempv2 = tempv2.replace( '@#@ResouceDataEn2@#@',
                                                '</blockquote>' );
                                        } else {
                                            tempv2 = tempv2.replace( '@#@ResouceDataSt1@#@',
                                                '<blockquote>@#@ResouceDataSt1@#@' );
                                            tempv2 = tempv2.replace( '@#@ResouceDataEn2@#@',
                                                '@#@ResouceDataEn2@#@</blockquote>' );
                                        }
                                    }
                                }
                                tempv2 = tempv2.replace( '@#@ResouceDataMain@#@', tempMatchArr2[ 2 ] );
                                tempv = tempv.replace( tempMatchArr2[ 0 ], tempv2 );
                            }
                        }
                    }
                }
            }
        }
        return tempv;
    };

    ctrl.resetRMEImg = function () {
        ctrl.setModelRMEVal( ctrl.getModelRMEVal().replace( ctrl.modelDataRMEImg, '' ) );
        ctrl.modelDataRMEImg = '';
        ctrl.updateModelValRME();
    };

    ctrl.resetRMEData = function () {
        ctrl.setModelRMEVal( '' );
        ctrl.modelDataRMEImg = '';
        ctrl.modelDataRMEData = '';
        ctrl.updateModelValRME();
    };

} )
// Advanced RTE TinyMCE End..


;

}());