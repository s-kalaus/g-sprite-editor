gSprite.

directive('gsFileOpen', ['$timeout', 'utilService', function ($timeout, utilService) {
    return {
        restrict: 'AE',
        template: '<input type="file" accept=".json" onchange="gsFileOpened(event)" id="gs-file-open">',
        link: function($scope, element, attrs, ctrls) {

            window.gsFileOpened = function(event) {

                var input = event.target;

                if (!input.files.length) {
                    return;
                }

                var reader = new FileReader();

                reader.onload = function(){
                    $scope.$emit('gs-file-opened', reader.result);
                };

                reader.readAsText(input.files[0]);
            };
        }
    };
}]);