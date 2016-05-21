gSprite.

factory('configService', function() {

    var data = {
        get: function(key) {
            return data[key];
        }
    };

    _.assign(data, window.config, window.config[gSprite.env]);

    delete data.envs;

    return data;
});