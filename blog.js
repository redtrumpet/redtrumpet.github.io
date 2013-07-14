/*global window, document, XMLHttpRequest, console, angular, Markdown*/

function NavCtrl($scope) {
    'use strict';
    $scope.nav_items = [{
        text: 'Blog',
        classes: ['active', 'asdf'],
        url: '#'
    }, {
        text: 'Über mich',
        classes: [],
        url: '#/singlePage/ich.md'
    }, {
        text: 'Meine Einsatzstelle',
        classes: [],
        url: '#/singlePage/casadomenor.md'
    }];
    $scope.clicked = function (clicked_item) {
        var i, item;
        for (i = 0; i < $scope.nav_items.length; i += 1) {
            item = $scope.nav_items[i];
            item.classes.splice(item.classes.indexOf('active'), 1);
        }
        if (clicked_item.classes.indexOf('active') === -1) {
            clicked_item.classes.push('active');
        }
    };
}
function BlogCtrl($scope, MDConverter) {
    'use strict';
    $scope.articles = [];
    var httpRequest,
        articleProto = {
            timestamp: 0,
            getDate: function () {
                return new Date(this.timestamp);
            }
        };
    $scope.predicate = '-timestamp';
    function processEntry(entry, event) {
        var proto = '__proto__';
        entry.html = MDConverter.makeHtml(event.target.responseText);
        entry[proto] = articleProto;
        $scope.$apply(function () {
            $scope.articles.push(entry);
        });
    }
    function processEntries(event) {
        var entries = JSON.parse(event.target.responseText),
            i,
            httpRequest;
        for (i = 0; i < entries.length; i += 1) {
            httpRequest = new XMLHttpRequest();
            httpRequest.addEventListener('load', processEntry.bind({}, entries[i]));
            httpRequest.open('GET', 'entries/' + entries[i].file);
            httpRequest.send(null);
        }
    }
    httpRequest = new XMLHttpRequest();
    httpRequest.addEventListener('load', processEntries);
    httpRequest.open('GET', 'entries/entries.json');
    httpRequest.send(null);
}

function SingleCtrl($scope, MDConverter, $routeParams) {
    'use strict';
    var httpRequest;
    $scope.article = {};
    function processPage(event) {
        var md = event.target.responseText;
        $scope.$apply(function () {
            $scope.article.html = MDConverter.makeHtml(md);
        });
    }
    httpRequest = new XMLHttpRequest();
    httpRequest.addEventListener('load', processPage);
    httpRequest.open('GET', 'singlePages/' + $routeParams.pageName);
    httpRequest.send(null);
}
angular.module('blog', []).
    factory('MDConverter', function () {
        'use strict';
        return new Markdown.Converter();
    }).
    config(function ($routeProvider) {
        'use strict';
        $routeProvider.when('/', {controller: BlogCtrl, templateUrl: 'articles.html'})
            .when('/singlePage/:pageName', {controller: SingleCtrl, templateUrl: 'single.html'});
    });
    
/*Navbar scrolling*/
window.addEventListener('DOMContentLoaded', function () {
    'use strict';
    window.addEventListener('scroll', function (evt) {
        var nav_well = document.getElementById('nav_well');
        if (window.pageYOffset >= 130) {
            nav_well.style.top = window.pageYOffset - 130 + 'px';
        } else if (nav_well.style.top !== '0px') {
            nav_well.style.top = '0px';
        }
    });
});
