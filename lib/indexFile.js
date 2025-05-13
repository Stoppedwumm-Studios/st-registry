module.exports = {
    generateIndexFile: function (modules) {
        modules = modules || [];
        if (modules.length === 0) {
            return '';
        }
        const processedModules = modules.map(m => {
            return {
                name: m.name,
                path: m.path,
                url: "https://stoppedwumm-studios.github.io/st-registry/" + m.path + ".json"
            };
        })
        return JSON.stringify({
            modules: processedModules,
            documentation: "https://github.com/Stoppedwumm-Studios/st-registry"
        }, null, 2);
    }
}