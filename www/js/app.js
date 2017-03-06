'use strict';

/* App Module */
var mediaApp = angular.module('mediaApp', ['ionic','ngResource','wu.masonry'])

mediaApp.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
        .state('menu', {
            url: "/menu",
            abstract: true,
            templateUrl: "menu.html"
        })
        .state('menu.home', {
            url: "/home",
            views: {
                'menuContent' :{
                    templateUrl: "views/home.html",
                    controller: "HomeCtrl"
                }
            }
        })
        .state('menu.home2', {
            url: "/home/:id/:sort",
            views: {
                'menuContent' :{
                    templateUrl: "views/home.html",
                    controller: "HomeCtrl"
                }
            }
        })
        .state('menu.settings', {
            url: "/settings",
            views: {
                'menuContent' :{
                    templateUrl: "views/settings.html",
                    controller: "SettingsCtrl"
                }
            }
        });

    $urlRouterProvider.otherwise("/menu/home");
})