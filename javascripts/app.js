var gSprite = angular.module('gSprite', [
    'ngMaterial',
    'common.fabric',
    'common.fabric.utilities',
	'common.fabric.constants'
]).config(function () {

    gSprite.env = '%env%';
});