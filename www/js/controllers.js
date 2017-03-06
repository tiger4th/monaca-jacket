'use strict';

var genreNames = {
    '001001':    'マンガ',
    '001001001': '少年マンガ',
    '001001002': '少女マンガ',
    '001001003': '青年マンガ',
    '001001004': 'レディースコミック',
    '001001006': '漫画文庫',
    '001001012': 'その他マンガ',
    '001017':    'ライトノベル',
    '001017005': '少年ライトノベル',
    '001017006': '少女ライトノベル',
    '001017004': 'その他ライトノベル',
    '007618':    'マンガ雑誌',
    '007619':    'ゲーム雑誌',
    '003215007': 'アニメ',
    '002108':    'アニメソング',
    '006':       'ゲーム'
}

var genreObjects = new Array();
$.each(genreNames, function(i, val) {
    genreObjects.push({id: i, name: val});
});

var browserDefault     = '0';
var detailSiteDefault  = '0';
// var detailSiteDefault  = '2'; // for iOS
var defaultPageDefault = '001001';

mediaApp.controller('MainCtrl', function($scope, $stateParams, $ionicSideMenuDelegate, SettingsService) {
    // Menu button
    $scope.leftButtons = [{
        type: 'button-icon button-clear ion-navicon',
        tap: function(e) {
            $ionicSideMenuDelegate.toggleLeft($scope.$$childHead);
        }
    }];

    ionic.Platform.ready(function(){
    });

    if ($scope.sideMenuController !=null)
        $scope.sideMenuController.toggleLeft();
})

mediaApp.controller('HomeCtrl', function ($scope, $stateParams, SettingsService) {
    if ($scope.sideMenuController.isOpen())
        $scope.sideMenuController.toggleLeft();
        
    $scope.params = $stateParams;

    var browser = localStorage.getItem('browser');
    if (browser == null) {
        browser = browserDefault;
    }
    
    var detailSite = localStorage.getItem('detailSite');
    if (detailSite == null) {
        detailSite = detailSiteDefault;
    }
    // detailSite = detailSiteDefault; // for iOS
        
    if ($scope.params.id == undefined ){
        var defaultPage = localStorage.getItem('defaultPage');
        if (defaultPage != null) {
            $scope.params.id = defaultPage;
        } else {
            $scope.params.id = defaultPageDefault;
        }
    }
    
    if ($scope.params.sort == undefined ){
        $scope.params.sort = '0';
    }
    
    if ($scope.params.sort == '0') {
        $scope.rightButtons =  [{
            type: 'button-icon button-clear fa fa-trophy',
            tap: function() {
                location.href = '#/menu/home/' + $scope.params.id + '/1';
            }
        }];
    } else {
        $scope.rightButtons =  [{
            type: 'button-icon button-clear fa fa-star',
            tap: function() {
                location.href = '#/menu/home/' + $scope.params.id + '/0';
            }
        }];  
    }
    
    if ($scope.params.sort == 0) {
        var sort = '-releaseDate';
        var sortLabel = ' [新刊]';
    } else {
        var sort = 'sales';
        var sortLabel = ' [ベストセラー]';
    }
    
    var genreLabel = genreNames[$scope.params.id];
    $('.bar-subheader .title').text(genreLabel + sortLabel);
    
    $scope.items = [];
    var page = 1;
    var loading = false;
    load();

    $scope.more = function more(name) {
        page++;
        load();
    }

    function load() {
        if (page > 100 || loading == true) {
            return;
        }
        
        var applicationIds = [
            "1005737165543437327",
            "1071642255181037197",
            "1013970214276062244",
            "1056906258497350149",
            "1047629405938669859"
        ];
        
        var affiliateId_r = '13efd072.29187a8c.13efd073.0c4e5a0e';
        var affiliateId_a = 'tiger4thj-22'
        var sid = '3261763';
        var pid = '883743327';
  
        var l = applicationIds.length;
        var r = Math.floor(Math.random()*l);
        var applicationId = applicationIds[r];
    
        $.ajax({
            type: "POST",
            url: "https://app.rakuten.co.jp/services/api/BooksTotal/Search/20130522",
            data: {
                format: "json",
                formatVersion: "2",
                applicationId: applicationId,
                affiliateId: affiliateId_r,
                booksGenreId: $scope.params.id,
                sort: sort,
                page: page
            }
        }).done(function( data ) {
            loading = true;
            var dataLength = 0;
            
            $.each(data.Items, function(i, item) {
                if (item.largeImageUrl.indexOf('noimage') == -1) {
                    dataLength++;
                    
                    // 楽天ブックス
                    var itemUrl = item.affiliateUrl;
                    
                    if (detailSite == '1') {
                        // Amazon
                        if (item.isbn != '' && item.isbn.length == 13) {
                            var asin = isbn2asin(item.isbn);
                            itemUrl = 'http://www.amazon.co.jp/dp/' + asin + '?tag=' + affiliateId_a;
                        } else if (item.jan != '') {
                            itemUrl = 'http://www.amazon.co.jp/s/?field-keywords=' + item.jan + '&tag=' + affiliateId_a;
                        }
                    } else if (detailSite == '2') {
                        // Yahoo!ショッピング
                        if (item.isbn != '') {
                            var vcUrl = 'http://search.shopping.yahoo.co.jp/search?p=' + item.isbn;
                            itemUrl = 'http://ck.jp.ap.valuecommerce.com/servlet/referral?sid=' + sid +'&pid=' + pid + '&vc_url=' + encodeURIComponent(vcUrl);
                        } else if (item.jan != '') {
                            var vcUrl = 'http://search.shopping.yahoo.co.jp/search?p=' + item.jan;
                            itemUrl = 'http://ck.jp.ap.valuecommerce.com/servlet/referral?sid=' + sid +'&pid=' + pid + '&vc_url=' + encodeURIComponent(vcUrl);
                        }
                    }
                    
                    var itemData = {
                        'image': item.largeImageUrl,
                        'title': item.title,
                        'url': itemUrl
                    }
                    $scope.items.push(itemData);
                }
            });
            
            loading = false;
            
            if ($scope.items.length < 12 || dataLength < 6) {
                setTimeout(function(){
                    page++;
                    load();
                }, 100);
            }
    
            $scope.$apply();
        }).fail(function( data ) {
        });
    };
    
    function isbn2asin(isbn13) {
        var asin = isbn13.substr(3,9);
        var ck = 0;
        for (var i = 0; i < 9; i++) {
            ck += asin.substr(i,1) * (10 - i);
        }
        ck = (11 - ck % 11) % 11;
        asin = asin + ((ck == 10) ? 'X' : ck);
        return asin;
    }

    $scope.onclick = function(url) {
        if (browser == '1') {
            // アプリ内ブラウザ
            window.open(url, '_blank');
            e.preventDefault();
        } else {
            // 外部ブラウザ
            window.open(url, '_system');
            e.preventDefault();
        }
    };
})

mediaApp.controller('SettingsCtrl', function ($scope,SettingsService,$window) {
    $scope.navTitle = "設定";

    $scope.leftButtons = [{
        type: 'button-icon button-clear ion-ios7-arrow-back',
        tap: function(e) {
            $window.history.back();
        }
    }];
    if ($scope.sideMenuController.isOpen())
        $scope.sideMenuController.toggleLeft();

    // アプリ内ブラウザ設定
    var browser = localStorage.getItem('browser');
    if (browser == null) {
        browser = browserDefault;
    }
    
    if (browser == '1') {
        browser = true;
    } else {
        browser = false;
    }
    
    $scope.toggleList = [
        { text: "アプリ内ブラウザで詳細を見る", key: 'browser', checked: browser }
    ];

    $scope.setBrowser = function(index) {
        if ($scope.toggleList[index].checked) {
            browser = '0';
        } else {
            browser = '1';
        }
        localStorage.setItem($scope.toggleList[index].key, browser);
    };
  
    // 詳細を見るサイト
    $scope.detailSite = [
    　{ id: '0', name: '楽天ブックス'},
    　{ id: '1', name: 'Amazon'},
    　{ id: '2', name: 'Yahoo!ショッピング'}
    ];

    var detailSite = localStorage.getItem('detailSite');
    if (detailSite != null) {
        $scope.selectedDetailSite = detailSite;
    } else {
        $scope.selectedDetailSite = detailSiteDefault;
    }
    
    $scope.setDetailSite = function(id) {
        localStorage.setItem('detailSite', id);
    };
    
    // 最初に開くページ
    $scope.genreObjects = genreObjects;
            
    var defaultPage = localStorage.getItem('defaultPage');
    if (defaultPage != null) {
        $scope.selectedDefaultPage = defaultPage;
    } else {
        $scope.selectedDefaultPage = defaultPageDefault;
    }
    
    $scope.setDefaultPage = function(id) {
        localStorage.setItem('defaultPage', id);
    };
    
    // コピーライト
    $scope.onclick = function(url) {
        window.open(url, '_system');
    };
    
    // ライセンス
    $scope.groups = [
        {
            name: 'AngularJS',
            items: [
                'AngularJS v1.2.12 (c) 2010-2014 Google, Inc. http://angularjs.org License: MIT'
            ]
        },
        {
            name: 'AngularJS Masonry Directive',
            items: [
                'angular-masonry 0.8.1 Pascal Hartig, weluse GmbH, http://weluse.de/ License: MIT'
            ]
        },
        {
            name: 'AngularUI',
            items: [
                'State-based routing for AngularJS @version v0.2.7 @link http://angular-ui.github.com/ @license MIT License, http://www.opensource.org/licenses/MIT'
            ]
        },
        {
            name: 'Font Awesome',
            items: [
                'Font Awesome 4.3.0 by @davegandy - http://fontawesome.io - @fontawesome License - http://fontawesome.io/license (Font: SIL OFL 1.1, CSS: MIT License)'
            ]
        },
        {
            name: 'imagesLoaded',
            items: [
                'imagesLoaded PACKAGED v3.1.5 JavaScript is all like "You images are done yet or what?" MIT License'
            ]
        },
        {
            name: 'Ionic',
            items: [
                'Copyright 2014 Drifty Co. http://drifty.com/ Ionic, v0.9.26 A powerful HTML5 mobile app framework. http://ionicframework.com/ By @maxlynch, @helloimben, @adamdbradley <3 Licensed under the MIT license. Please see LICENSE for more information.'
            ]
        },
        {
            name: 'jQuery',
            items: [
                'jQuery v1.11.1 (c) 2005, 2014 jQuery Foundation, Inc. jquery.org/license'
            ]
        },
        {
            name: 'Masonry',
            items: [
                'Masonry PACKAGED v3.1.5 Cascading grid layout library http://masonry.desandro.com MIT License by David DeSandro'
            ]
        }
    ];

    $scope.toggleGroup = function(group) {
      if ($scope.isGroupShown(group)) {
        $scope.shownGroup = null;
      } else {
        $scope.shownGroup = group;
      }
    };
    
    $scope.isGroupShown = function(group) {
      return $scope.shownGroup === group;
    };        
    
    $scope.showLicense = function() {
        $('.show-license').hide();
        $('.licenses').show();
    };
})
