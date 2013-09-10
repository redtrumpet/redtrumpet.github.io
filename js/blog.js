/*global window, document, XMLHttpRequest, console, angular, Markdown*/
var x;
function NavCtrl($scope, $location) {
    'use strict';
    $scope.template = {};
    $scope.template.url = '';
    x = $location;
    $scope.nav_items = [{
        text: 'Blog',
        classes: ['active'],
        url: '#/',
        regex: '\\d*$'
    }, {
        text: 'Über mich',
        classes: [],
        url: '#/single/page/ich.md',
        regex: ''
    }, {
        text: 'Meine Einsatzstelle',
        classes: [],
        url: '#/single/page/casadomenor.md',
        regex: ''
    }];
    $scope.articles = [];
    $scope.clicked = function (clicked_item) {
        var i, item;
        for (i = 0; i < $scope.nav_items.length; i += 1) {
            item = $scope.nav_items[i];
            item.classes.splice(item.classes.indexOf('active'), 1);
        }
        clicked_item.classes.push((clicked_item.classes.indexOf('active') === -1) ? 'active' : undefined);
    };
    $scope.isActive = function (item) {
        var regexp = new RegExp('^' + item.url.substr(1) + item.regex);
        return regexp.test($location.url());
    };
    $scope.getClasses = function (item) {
        if (item.url.substr(1) === $location.url()) {
            return 'active';
        } else {
            return '';
        }
    };
    $scope.isNew = function (article) {
        return (article.tags.indexOf('new') !== -1) ? true : false;
    };
}
function BlogCtrl($scope, $routeParams, $http, MDConverter) {
    'use strict';
    var httpRequest,
        articleProto = {
            timestamp: 0,
            getDate: function () {
                return new Date(this.timestamp);
            }
        };
    $scope.predicate = '-timestamp';
    $scope.page = parseInt($routeParams.pageNum, 10) || 0;
    $scope.page_length = 3;
    $scope.page_count = 0;
    $scope.getNumArray = function (number) {
        var arr = [], i;
        for (i = 0; i < number; i += 1) {
            arr.push(i);
        }
        return arr;
    };
    $scope.isPage = function (pag) {
        var bool = $scope.page === pag;
        return bool;
    };
    $scope.getLinkNum = function (order) {
        if (order === 'prev') {
            if ($scope.page === 0) {
                return $scope.page;
            } else {
                return $scope.page - 1;
            }
        } else if (order === 'next') {
            if ($scope.page === $scope.page_count - 1) {
                return $scope.page;
            } else {
                return $scope.page + 1;
            }
        }
    };
    
    function processEntry(entry, data, status, headers, config) {
        var proto = '__proto__';
        entry.html = MDConverter.makeHtml(data);
        entry[proto] = articleProto;
        $scope.articles.push(entry);
    }
    function processEntries(data, status, headers, config) {
        var entries = data,
            i,
            httpRequest;
        $scope.page_count = entries.length / $scope.page_length;
        if (Math.floor($scope.page_count) !== $scope.page_count) {
            $scope.page_count = Math.floor($scope.page_count) + 1;
        }
        if ($scope.articles.length === 0) {
            for (i = 0; i < entries.length; i += 1) {
                $http.get('entries/' + entries[i].file).success(processEntry.bind({}, entries[i]));
            }
        }
    }
    $http.get('entries/entries.json').success(processEntries);
}

function SingleCtrl($scope, MDConverter, $routeParams) {
    'use strict';
    var httpRequest, dir;
    $scope.article = {};
    $scope.second_thing = "<h3>Hallo</h3>";
    if ($routeParams.type === 'blog') {
        dir = 'entries';
    } else if ($routeParams.type === 'page') {
        dir = 'singlePages';
    }
    function processPage(event) {
        var md = event.target.responseText;
        $scope.$apply(function () {
            $scope.article.html = MDConverter.makeHtml(md);
        });
    }
    httpRequest = new XMLHttpRequest();
    httpRequest.addEventListener('load', processPage);
    httpRequest.open('GET', dir + '/' + $routeParams.entry);
    httpRequest.send(null);
}

                                    /*Module*/
angular.module('blog', []).
    factory('MDConverter', function () {
        'use strict';
        return new Markdown.Converter();
    }).
    config(function ($routeProvider) {
        'use strict';
        $routeProvider.
            when('/', {controller: BlogCtrl, templateUrl: 'articles.html'}).
            when('/blog/', {controller: BlogCtrl, templateUrl: 'articles.html'}).
            when('/:pageNum', {controller: BlogCtrl, templateUrl: 'articles.html'}).
            when('/blog/:pageNum', {controller: BlogCtrl, templateUrl: 'articles.html'}).
            when('/single/:type/:entry', {controller: SingleCtrl, templateUrl: 'single.html'});
    }).
    filter('extractPage', function () {
        'use strict';
        return function (input, page, length) {
            if (typeof length === 'undefined') {
                length = 3;
            }
            return input.slice(page * length, page * length + length);
        };
    });