gSprite.

directive('gsFabric', ['Fabric', 'FabricCanvas', '$timeout', 'utilService', function (Fabric, FabricCanvas, $timeout, utilService) {
    return {
        restrict: 'AE',
        template: '<canvas fabric="gsFabric"></canvas>',
        scope: {
            gsFabric: '=',
            gsSettings: '='
        },
        link: function($scope, element, attrs, ctrls) {

            var canvas = null;

            function init() {

                $scope.gsFabric = new Fabric({
                    imageDefaults: {
                        selectable: false,
                        hasBorders: false,
                        hasControls: false
                    },
                    downloadMultipler: 1,
                    json: {
                        width: $scope.gsSettings.width,
                        height: $scope.gsSettings.height
                    }
                });

                canvas = FabricCanvas.getCanvas();

                FabricCanvas.element.imageSmoothingEnabled = false;
                FabricCanvas.element.mozImageSmoothingEnabled = false;
                FabricCanvas.element.oImageSmoothingEnabled = false;
                FabricCanvas.element.webkitImageSmoothingEnabled = false;
                FabricCanvas.element.msImageSmoothingEnabled = false;

                canvas.on('object:added', function() {
                    $scope.$emit('gs-canvas-changed');
                });

                canvas.on('object:modified', function() {
                    $scope.$emit('gs-canvas-changed');
                });

                canvas.on('object:removed', function() {
                    $scope.$emit('gs-canvas-changed');
                });
            }

            $scope.$watch('gsSettings.width', function() {

                if (!$scope.gsFabric || !$scope.gsFabric.setCanvasWidth || !$scope.gsSettings.width) {
                    return;
                }

                $scope.gsFabric.setCanvasWidth($scope.gsSettings.width);
            });

            $scope.$watch('gsSettings.height', function() {

                if (!$scope.gsFabric || !$scope.gsFabric.setCanvasHeight || !$scope.gsSettings.height) {
                    return;
                }

                $scope.gsFabric.setCanvasHeight($scope.gsSettings.height);
            });

            $timeout(init, 100);
        }
    };
}]);