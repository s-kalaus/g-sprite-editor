gSprite.

controller('indexController', ['$scope', '$mdSidenav', '$mdToast', '$timeout', 'Fabric', 'FabricCanvas', function($scope, $mdSidenav, $mdToast, $timeout, Fabric, FabricCanvas) {

    $scope.vm = {
        frames: [],
        currentFrame: null,
        dropzone: {
            instance: null,
            handlers: {
                thumbnail: function(file, dataUrl) {

                    var $s = angular.element(this.element).scope();

                    $s.frame.data = $s.frame.dataOriginal = dataUrl;

                    $scope.$apply();

                    $scope.vm.fabric.addImage($s.frame.data);

                    var canvas = FabricCanvas.getCanvas();

                    $timeout(function() {

                        var objects = canvas.getObjects();

                        var last = objects[objects.length - 1];

                        last.originalLeft = 0;
                        last.left = 0;

                        last.originalTop = 0;
                        last.top = 0;

                        canvas.renderAll();
                        canvas.calcOffset();
                    });

                    this.removeAllFiles();
                }
            },
            config: {
                url: function() {
                    return 'about:blank';
                },
                autoProcessQueue: false,
                clickable: '.gs-upload'
            }
        },
        settings: {
            width: 32,
            height: 32,
            fps: 25
        },
        preview: {
            currentFrame: 0
        },
        const: {
            anker: {
                allowed: ['upperLeft', 'upperMiddle', 'upperRight', 'centerLeft', 'centerMiddle', 'centerRight', 'buttomLeft', 'bottomMiddle', 'bottomRight'],
                ankerDefault: 'upperLeft'
            },
            frame: {
                minWidth: 8,
                minHeight: 8,
                maxWidth: 100,
                maxHeight: 100,
                defaultWidth: 32,
                defaultHeight: 32
            },
            fps: {
                minFps: 1,
                maxFps: 60,
                defaultFps: 25
            },
            canvasInitDelay: 500
        },
        fabric: {},
        fabricHelper: {},
        openJSON: openJSON,
        saveJSON: saveJSON,
        savePNG: savePNG,
        openSidenav: openSidenav,
        addFrame: addFrame,
        removeFrame: removeFrame,
        selectFrame: selectFrame,
        processing: false,
        inited: false
    };

    function render() {
        $scope.vm.currentFrame.data = $scope.vm.fabric.getCanvasData();
    }

    function init() {

        addFrame();

        updatePreview();

        $scope.vm.inited = true;
    }

    function openJSON() {
        $('#gs-file-open').click();
    }

    function open(content) {

        var data = null;
        var error = null;

        try {
            data = JSON.parse(content);
        }
        catch (e) {}

        if (!data || !data.spritsize || !data.framesize || !data.anker) {
            error = 'Error parsing JSON file';
        } else if (!data.data || !String(data.data).match(/base64/gi)) {
            error = 'Sprite data invalid';
        } else if (data.spritsize.width < $scope.vm.const.frame.minWidth) {
            error = 'Sprite width should be greater than ' + $scope.vm.const.frame.minWidth + 'px';
        } else if (data.spritsize.height < $scope.vm.const.frame.minHeight) {
            error = 'Sprite height should be greater than ' + $scope.vm.const.frame.minHeight + 'px';
        } else if (data.spritsize.height > $scope.vm.const.frame.maxHeight) {
            error = 'Sprite height should be less than ' + $scope.vm.const.frame.maxHeight + 'px';
        } else if (data.framesize.width < $scope.vm.const.frame.minWidth) {
            error = 'Frame width should be greater than ' + $scope.vm.const.frame.minWidth + 'px';
        } else if (data.framesize.height < $scope.vm.const.frame.minHeight) {
            error = 'Frame height should be greater than ' + $scope.vm.const.frame.minHeight + 'px';
        } else if (data.framesize.width > $scope.vm.const.frame.maxWidth) {
            error = 'Frame width should be less than ' + $scope.vm.const.frame.maxWidth + 'px';
        } else if (data.framesize.height > $scope.vm.const.frame.maxHeight) {
            error = 'Frame height should be less than ' + $scope.vm.const.frame.maxHeight + 'px';
        } else if (data.framesize.height !== data.spritsize.height) {
            error = 'framesize.height and spritesize.height differ';
        } else if ($scope.vm.const.anker.allowed.indexOf(data.anker) === -1) {
            error = 'Anker invalid';
        }

        var spriteWidth = 0;
        var spriteHeight = 0;

        return async.series([
            function(next) {

                if (error) {
                    return next(error);
                }

                var i = new Image();

                i.onload = function() {

                    spriteWidth = this.width;
                    spriteHeight = this.height;

                    if (spriteWidth !== data.spritsize.width) {
                        return next('Image width and spritesize.width differ');
                    }

                    if (spriteHeight !== data.spritsize.height) {
                        return next('Image height and spritesize.height differ');
                    }

                    return next();
                };

                i.error = function() {
                    return next('Error loading sprite image');
                };

                i.src = data.data;
            },
            function(next) {

                $scope.vm.frames = [];

                $scope.vm.settings.width = data.framesize.width;
                $scope.vm.settings.height = data.framesize.height;

                $scope.vm.processing = true;

                return $timeout(next, $scope.vm.const.canvasInitDelay);
            },
            function(next) {

                $scope.vm.fabricHelper = new Fabric({
                    imageDefaults: {
                        hasBorders: false,
                        hasControls: false
                    },
                    downloadMultipler: 1,
                    json: {
                        width: spriteWidth,
                        height: spriteHeight
                    }
                });

                return fabric.Image.fromURL(data.data, function(object) {

                    $scope.vm.fabricHelper.addObjectToCanvas(object);

                    return $timeout(next);
                }, $scope.vm.fabricHelper.imageDefaults);
            },
            function(next) {

                var canvas = FabricCanvas.getCanvas();

                for (var i = 0; i < spriteWidth; i += data.framesize.width) {

                    var frameData = canvas.toDataURL({
                        width: data.framesize.width,
                        height: data.framesize.height,
                        left: i,
                        top: 0
                    });

                    addFrame(frameData);
                }

                canvas.renderAll();
                canvas.calcOffset();

                return $timeout(next);
            },
            function(next) {

                $scope.vm.processing = false;

                return $timeout(next, $scope.vm.const.canvasInitDelay);
            }
        ], function(err) {

            if (err) {

                return $mdToast.show(
                    $mdToast.simple()
                        .textContent(err)
                        .hideDelay(4000)
                );
            }

            $scope.vm.currentFrame = null;

            selectFrame($scope.vm.frames[0]);
        });
    }

    function saveJSON() {

        return generateSprite(function(fabric) {

            var text = JSON.stringify({
                data: fabric.getCanvasData(),
                spritsize: {
                    width: $scope.vm.settings.width * $scope.vm.frames.length,
                    height: $scope.vm.settings.height
                },
                framesize: {
                    width: $scope.vm.settings.width,
                    height: $scope.vm.settings.height
                },
                anker: 'upperLeft'
            });

            var element = document.createElement('a');

            element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', 'filename.json');
            element.target = '_blank';

            element.style.position = 'absolute';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        });
    }

    function savePNG() {

        return generateSprite(function(fabric) {

            var element = document.createElement('a');

            element.setAttribute('href', fabric.getCanvasData());
            element.setAttribute('download', 'filename.png');
            element.target = '_blank';

            element.style.position = 'absolute';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        });
    }

    function generateSprite(action) {

        return async.series([
            function(next) {

                $scope.vm.processing = true;

                return $timeout(next, $scope.vm.const.canvasInitDelay);
            },
            function(next) {

                $scope.vm.fabricHelper = new Fabric({
                    imageDefaults: {
                        hasBorders: false,
                        hasControls: false
                    },
                    downloadMultipler: 1,
                    json: {
                        width: $scope.vm.settings.width * $scope.vm.frames.length,
                        height: $scope.vm.settings.height
                    }
                });

                return async.eachSeries($scope.vm.frames, function(frame, _next) {

                    return fabric.Image.fromURL(frame.data, function(object) {

                        $scope.vm.fabricHelper.addObjectToCanvas(object);

                        return _next();
                    }, $scope.vm.fabricHelper.imageDefaults);
                }, next);
            },
            function(next) {

                var canvas = FabricCanvas.getCanvas();

                canvas.getObjects().forEach(function(object, index) {

                    object.originalLeft = index * $scope.vm.settings.width;
                    object.left = index * $scope.vm.settings.width;
                });

                canvas.renderAll();
                canvas.calcOffset();

                return $timeout(next);
            },
            function(next) {

                $scope.vm.processing = false;

                return $timeout(next, $scope.vm.const.canvasInitDelay);
            }
        ], function() {

            $scope.vm.currentFrame = null;

            selectFrame($scope.vm.frames[0]);

            return action($scope.vm.fabricHelper);
        });
    }

    function updatePreview() {

        var next = $scope.vm.preview.currentFrame + 1;

        if (next >= $scope.vm.frames.length) {
            next = 0;
        }

        $scope.vm.preview.currentFrame = next;

        return $timeout(updatePreview, 1000 / $scope.vm.settings.fps);
    }

    function openSidenav(id) {
        return $mdSidenav(id).toggle(true);
    }

    function addFrame(data) {

        var frame = {
            num: $scope.vm.frames.length + 1,
            data: data || null,
            dataOriginal: null || null
        };

        $scope.vm.frames.push(frame);

        selectFrame(frame);
    }

    function selectFrame(frame) {

        if ($scope.vm.currentFrame === frame) {
            return;
        }

        $scope.vm.currentFrame = frame;

        if ($scope.vm.fabric && $scope.vm.fabric.clearCanvas) {

            $scope.vm.fabric.clearCanvas();

            $scope.vm.fabric.addImage(frame.data);
        }
    }

    function removeFrame($index) {

        if ($scope.vm.frames.length === 1) {

            return $mdToast.show(
                $mdToast.simple()
                    .textContent('You can not delete last frame')
                    .hideDelay(4000)
            );
        }

        $scope.vm.frames.splice($index, 1);

        selectFrame($scope.vm.frames[0]);
    }

    $scope.$on('gs-canvas-changed', render);

    $scope.$on('gs-file-opened', function(event, data) {
        return open(data);
    });

    return init();
}]);
