///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
    './ConfigManager',
    './LayoutManager',
    './DataManager',
    './WidgetManager',
    './FeatureActionManager',
    './SelectionManager',
    './DataSourceManager',
    './FilterManager',
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/on',
    'dojo/mouse',
    'dojo/topic',
    'dojo/cookie',
    'dojo/Deferred',
    'dojo/promise/all',
    'dojo/io-query',
    'esri/config',
    'esri/request',
    'esri/urlUtils',
    'esri/IdentityManager',
    'jimu/portalUrlUtils',
    './utils',
    'require',
    'dojo/i18n',
    'dojo/i18n!./nls/main',
    'esri/main'
  ],
  function(ConfigManager, LayoutManager, DataManager, WidgetManager, FeatureActionManager, SelectionManager,
    DataSourceManager, FilterManager, html, lang, array, on, mouse,
    topic, cookie, Deferred, all, ioquery, esriConfig, esriRequest, urlUitls, IdentityManager,
    portalUrlUtils, jimuUtils, require, i18n, mainBundle, esriMain) {
    /* global jimuConfig:true */
    var mo = {}, appConfig;

    window.topic = topic;

    //set the default timeout to 3 minutes
    esriConfig.defaults.io.timeout = 60000 * 3;

    window.layerIdPrefix = "eaLyrNum_";
    window.layerIdBndrPrefix = "eaLyrBndrNum_";
    window.layerIdPBSPrefix = "eaLyrPBSNum_";
    window.layerIdTiledPrefix = "tiledNum_";
    window.addedLayerIdPrefix = "added_";
    window.topLayerID = "";
    window.timeSliderLayerId = "TimeSliderLayer";
    window.timeSliderPause = false;
    window.addedLayerIndex = 0;
    window.uploadedFeatLayerIdPrefix = "uploaded_";
    window.timeSeriesLayerId = "ScenarioDataLayer";
    window.widthOfInfoWindow = 0;
    window.heightOfInfoWindow = 0;
    window.toggleOnHucNavigation = false;
    window.toggleOnRainDrop = false;
    window.toggleOnElevation = false;
    window.removeAllMessage = "removeAll";
    window.chkTopicPrefix = "ckTopic_";
    window.chkTopicPBSPrefix = "ckTopicPBS_";
    window.chkSelectableLayer = "ck";
    window.layerTitlePrefix = "layerTitle_";
    window.idCommuBoundaryPoint = "Boundary_Point";
    window.timeSeriesDisclaim = false;
    
    window.filterForSelectOpened = false;
    window.filterForSelectFirstCreated = true;
    window.dataFactSheet = "https://enviroatlas.epa.gov/enviroatlas/DataFactSheets/pdf/";
    //window.matadata = "https://edg.epa.gov/metadata/catalog/search/resource/details.page?uuid=%7BBDF514A6-05A8-400D-BF3D-030645461334%7D";
	window.matadata = "https://edg.epa.gov/metadata/catalog/search/resource/details.page";//?uuid=%7BBDF514A6-05A8-400D-BF3D-030645461334%7D";
    
    window.bFirstLoadFilterWidget = true;
    window.allLayerNumber = [];
    window.featureLyrNumber = [];
    window.nationalLayerNumber = [];
    window.communityLayerNumber =  [];
    window.dynamicLayerNumber = [];
    window.tiledLayerNumber = [];
    window.imageLayerNumber = [];
    window.layerID_Portal_WebMap = [];
    window.onlineDataTobeAdded = [];
    window.onlineDataAlreadyAdded = [];
    window.uploadedFileColl = [];
    window.categoryDic = {};
    window.categoryDic["Clean Air"] = "cair";
    window.categoryDic["Clean and Plentiful Water"] = "cpw";
    window.categoryDic["Climate Stabilization"] = "clim";
    window.categoryDic["Natural Hazard Mitigation"] = "nhm";
    window.categoryDic["Recreation, Culture, and Aesthetics"] = "rca";
    window.categoryDic["Food, Fuel, and Materials"] ="ffm";
    window.categoryDic["Biodiversity Conservation"] = "biod";
    //window.categoryDic["People and Built Spaces"] = "pbs";
    //window.categoryDic["Supplemental"] = "sup";
    window.categoryClassSupply = "Supply";
    window.categoryClassDemand = "Demand";
    window.categoryClassDriver = "Driver";
    window.categoryClassSpatialExplicit = "Spatially Explicit";
    
	window.categoryTabDic = {};
	window.categoryTabDic ["ESB"] = "ESB"; //Ecosystems and Biodiversity
	window.categoryTabDic ["PBS"] = "PBS"; //People and Built Spaces
	window.categoryTabDic ["BNF"] = "BNF"; //Boundaries and Natural Features (or Supplemental)
	
    window.topicDicESB = {};
    window.topicDicESB["Carbon Storage"] = "CS";
    window.topicDicESB["Crop Productivity"] = "CP";
    window.topicDicESB["Ecosystem Markets"] = "EM";    
    window.topicDicESB["Energy Potential"] = "EP";
    window.topicDicESB["Engagement with Outdoors"] = "EwO";
    window.topicDicESB["Health and Economic Outcomes"] = "HaEO";
    window.topicDicESB["Impaired Waters"] = "IW";
    window.topicDicESB["Land Cover: Near-Water"] = "LCNW";
    window.topicDicESB["Land Cover: Type"] = "LCT";
    window.topicDicESB["Landscape Pattern"] = "LP";
    window.topicDicESB["Near-Road Environments"] = "NRE";    
    
    window.topicDicESB["Pollutant Reduction: Air"] = "PRA"; //This is newly added Mar 2017    
    window.topicDicESB["Pollutant Reduction: Water"] = "PRW"; //This is newly added Mar 2017      
     
    window.topicDicESB["Pollutants: Nutrients"] = "PN"; 
    window.topicDicESB["Pollutants: Other"] = "PO";    
    
    window.topicDicESB["Protected Lands"] = "PL";
    window.topicDicESB["Species: At-Risk and Priority"] = "SARaP";
    window.topicDicESB["Species: Other"] = "SO";
    window.topicDicESB["Water Supply, Runoff, and Flow"] = "WSRaF"; //This is newly added Mar 2017     
    
    window.topicDicESB["Water Use"] = "WU";
    window.topicDicESB["Weather and Climate"] = "WaC"; //This is newly added Mar 2017 
    window.topicDicESB["Wetlands and Lowlands"] = "WaL";
    
    
	window.topicDicPBS = {};
    window.topicDicPBS["Housing and Schools"] = "HaF";
    window.topicDicPBS["Community Demographics"] = "CD";
    window.topicDicPBS["Employment"] = "E";
    window.topicDicPBS["National Demographics"] = "ND";
    window.topicDicPBS["Commuting and Walkability"] = "CaW";
    window.topicDicPBS["Quality of Life"] = "QoL";
    window.topicDicPBS["EPA Regulated Facilities"] = "RF";
    window.topicDicBNF = {};
    window.topicDicBNF["Ecological Boundaries"] = "EB";
    window.topicDicBNF["Hydrologic Features"] = "HF";
    window.topicDicBNF["Political Boundaries"] = "PB";

    
    window.strAllCommunity = "AllCommunity";	
    window.communityDic = {};
  	window.communityDic["ATX"] = "Austin, TX";
    window.communityDic["BirAL"]= "Birmingham, AL";
    window.communityDic["BMD"]= "Baltimore, MD";
    window.communityDic["BTX"]= "Brownsville, TX";
    window.communityDic["CIL"]= "Chicago, IL";
  	window.communityDic["CleOH"] = "Cleveland, OH";
  	window.communityDic["DMIA"] = "Des Moines, IA";
    window.communityDic["DNC"]= "Durham, NC";
    window.communityDic["FCA"] = "Fresno, CA";
    window.communityDic["GBWI"] = "Green Bay, WI";
    window.communityDic["MTN"] = "Memphis, TN";
    window.communityDic["MWI"] = "Milwaukee, WI";
    //window.communityDic["MSPMN"] = "Minneapolis/St. Paul, MN";
    window.communityDic["MSPMN"] = "Minneapolis-St.Paul, MN";
    window.communityDic["NBMA"] = "New Bedford, MA";
    window.communityDic["NHCT"] = "New Haven, CT";
    window.communityDic["NYNY"] = "New York, NY";
    window.communityDic["PNJ"] = "Paterson, NJ";
    window.communityDic["PAZ"] = "Phoenix, AZ";
    window.communityDic["PitPA"] = "Pittsburgh, PA";
    window.communityDic["PME"] = "Portland, ME"
    window.communityDic["POR"] = "Portland, OR"
    window.communityDic["TFL"] = "Tampa, FL";
    window.communityDic["VBWVA"] = "Virginia Beach - Williamsburg, VA";
    window.communityDic["WIA"] = "Woodbine, IA";
    
    window.communitySelected = window.strAllCommunity;
    window.nationalMetadataDic = {};
    window.attributeByOneCommu = false;
    
    window.communitySelectedByTheOtherFrame = window.strAllCommunity;
    //variables that are used for synchronize map
    window.changedExtentByOtherFrameXmin = null;
    window.changedExtentByOtherFrameXmax = null;   
    window.changedExtentByOtherFrameYmin = null;
    window.changedExtentByOtherFrameYmax = null;   
    window.frameBeClicked = 1;
    window.communityMetadataDic = {};
    window.faildedEALayerDictionary = {};
    window.faildedOutsideLayerDictionary = {};
    window.successLayerDictionary = {};
    window.communityExtentDic = {};
    window.hashAttribute = {};
    window.hashPopup = {};
    window.hashURL = {};
    window.hashTopic = {};
    window.hashTopicPBS = {};
    window.hashFieldsAddedFeatureLayer = {};
    window.hashVisibleLayersForDynamic = {};
    window.hashTitleToEAID = {};
    window.hashGeometryTypeAddedFeatLyr = {};
    window.hashInfoTemplate = {};
	window.hashRenderer = {};
	window.hashAddedURLToType = {};
	window.hashAddedURLToId = {};
	window.hashIDtoTileURL = {};
	window.hashIDtoCacheLevelNat = {};
	window.allLayersTurnedOn = {};
                
    //patch for JS API 3.10
    var hasMethod = typeof cookie.getAll === 'function';
    if (!hasMethod) {
      cookie.getAll = function(e) {
        var result = [];
        var v = cookie(e);
        if (v) {
          result.push(v);
        }
        return result;
      };
    }

    //jimu nls
    window.jimuNls = mainBundle;
    window.apiNls = esriMain.bundle;

    IdentityManager.setProtocolErrorHandler(function() {
      return true;
    });

    var ancestorWindow = jimuUtils.getAncestorWindow();
    var parentHttps = false;

    try {
      parentHttps = ancestorWindow.location.href.indexOf("https://") === 0;
    } catch (err) {
      console.log(err);
      parentHttps = window.location.protocol === "https:";
    }

    esriRequest.setRequestPreCallback(function(ioArgs) {
      if (ioArgs.content && ioArgs.content.printFlag) { // printTask
        ioArgs.timeout = 300000;
      }

      //use https protocol
      if (parentHttps) {
        var patt = /^http(s?):\/\//gi;
        ioArgs.url = ioArgs.url.replace(patt, '//');
      }

      //working around an arcgis server feature service bug.
      //Requests to queryRelatedRecords operation fail with feature service 10.
      //Detect if request conatins the queryRelatedRecords operation
      //and then change the source url for that request to the corresponding mapservice.
      if (ioArgs.url.indexOf("/queryRelatedRecords?") !== -1) {
        var serviceUrl = ioArgs.url;
        var proxyUrl = esriConfig.defaults.io.proxyUrl;
        if(proxyUrl && ioArgs.url.indexOf(proxyUrl + "?") === 0){
          //This request uses proxy.
          //We should remove proxyUrl to get the real service url to detect if it is a hosted service or not.
          serviceUrl = ioArgs.url.replace(proxyUrl + "?", "");
        }
        if (!jimuUtils.isHostedService(serviceUrl)) { // hosted service doesn't depend on MapServer
          ioArgs.url = ioArgs.url.replace("FeatureServer", "MapServer");
        }
      }

      //For getJobStatus of gp service running in safari.
      //The url of requests sent to getJobStatus is the same. In safari, the requests will be blocked except
      //the first one. Here a preventCache tag is added for this kind of request.
      var reg = /GPServer\/.+\/jobs/;
      if (reg.test(ioArgs.url)) {
        ioArgs.preventCache = new Date().getTime();
      }

      // Use proxies to replace the premium content
      if(!window.isBuilder && appConfig &&
          !appConfig.mode &&
          appConfig.appProxies &&
          appConfig.appProxies.length > 0) {
        array.some(appConfig.appProxies, function(proxyItem) {
          if(ioArgs.url.indexOf(proxyItem.sourceUrl) >= 0) {
            ioArgs.url = ioArgs.url.replace(proxyItem.sourceUrl, proxyItem.proxyUrl);
            return true;
          }
        });
      }

      return ioArgs;
    });


    // disable middle mouse button scroll
    on(window, 'mousedown', function(evt) {
      if (!mouse.isMiddle(evt)) {
        return;
      }

      evt.preventDefault();
      evt.stopPropagation();
      evt.returnValue = false;
      return false;
    });

    String.prototype.startWith = function(str) {
      if (this.substr(0, str.length) === str) {
        return true;
      } else {
        return false;
      }
    };

    String.prototype.endWith = function(str) {
      if (this.substr(this.length - str.length, str.length) === str) {
        return true;
      } else {
        return false;
      }
    };

    /*jshint unused: false*/
    if (typeof jimuConfig === 'undefined') {
      jimuConfig = {};
    }
    jimuConfig = lang.mixin({
      loadingId: 'main-loading',
      loadingImageId: 'app-loading',
      loadingGifId: 'loading-gif',
      layoutId: 'jimu-layout-manager',
      mapId: 'map',
      mainPageId: 'main-page',
      timeout: 5000,
      breakPoints: [600, 1280]
    }, jimuConfig);

    window.wabVersion = '2.5';
    // window.productVersion = 'Online 5.2';
    window.productVersion = 'Web AppBuilder for ArcGIS (Developer Edition) 2.5';
    // window.productVersion = 'Portal for ArcGIS 10.5.1';

    function initApp() {
      var urlParams, configManager, layoutManager;
      console.log('jimu.js init...');
      urlParams = getUrlParams();

      if(urlParams.mobileBreakPoint){
        try{
          var bp = parseInt(urlParams.mobileBreakPoint, 10);
          jimuConfig.breakPoints[0] = bp;
        }catch(err){
          console.error('mobileBreakPoint URL parameter must be a number.', err);
        }
      }

      if(urlParams.mode){
        html.setStyle(jimuConfig.loadingId, 'display', 'none');
        html.setStyle(jimuConfig.mainPageId, 'display', 'block');
      }
      //the order of initialize these managers does mater because this will affect the order of event listener.
      DataManager.getInstance(WidgetManager.getInstance());
      FeatureActionManager.getInstance();
      SelectionManager.getInstance();
      DataSourceManager.getInstance();
      FilterManager.getInstance();

      layoutManager = LayoutManager.getInstance({
        mapId: jimuConfig.mapId,
        urlParams: urlParams
      }, jimuConfig.layoutId);
      configManager = ConfigManager.getInstance(urlParams);

      layoutManager.startup();
      configManager.loadConfig();
      //load this module here to make load modules and load app parallelly
      require(['dynamic-modules/preload']);
    }

    function getUrlParams() {
      var s = window.location.search,
        p;
      if (s === '') {
        return {};
      }

      p = ioquery.queryToObject(s.substr(1));

      for(var k in p){
        p[k] = jimuUtils.sanitizeHTML(p[k]);
      }
      return p;
    }

    if(window.isBuilder){
      topic.subscribe("app/appConfigLoaded", onAppConfigChanged);
      topic.subscribe("app/appConfigChanged", onAppConfigChanged);
    }else{
      topic.subscribe("appConfigLoaded", onAppConfigChanged);
      topic.subscribe("appConfigChanged", onAppConfigChanged);
    }

    function onAppConfigChanged(_appConfig){
      appConfig = _appConfig;

      html.setStyle(jimuConfig.loadingId, 'display', 'none');
      html.setStyle(jimuConfig.mainPageId, 'display', 'block');
    }

    mo.initApp = initApp;
    return mo;
  });