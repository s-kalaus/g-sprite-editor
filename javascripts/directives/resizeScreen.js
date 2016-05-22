gSprite.

directive('gsResizeScreen', ['$timeout', 'utilService', function ($timeout, utilService) {
    return {
        restrict: 'AE',
        scope: {
            gsSettings: '='
        },
        link: function($scope, element, attrs, ctrls) {

            var parent = element.parent();


            function resize() {

                var width = parent.width();

                if (!width) {
                    return;
                }

                var height = Math.floor((width * $scope.gsSettings.height) / $scope.gsSettings.width);

                element.width(width).height(height);

                $(document.body).removeClass('gs-resizing');
            }

            $scope.$watch(function(){
                return parent.width();
            }, function() {

                $(document.body).addClass('gs-resizing');

                return utilService.debounce(resize, attrs.gsResizeScreen, 100);
            });

            $scope.$watch('gsSettings.width', function() {
                return resize();
            });

            $scope.$watch('gsSettings.height', function() {
                return resize();
            });

            $timeout(resize, 100);
        }
    };
}]);