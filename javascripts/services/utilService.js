gSprite.

factory('utilService', ['$timeout', function($timeout) {

    var debounceTimer = {};

    function debounce(callback, id, deplay) {

        $timeout.cancel(debounceTimer[id]);

        debounceTimer[id] = $timeout(callback, deplay);
    }

    return {
        debounce: debounce
    };
}]);