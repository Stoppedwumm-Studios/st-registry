const request = require('sync-request');

module.exports = function(repoIdentifier, executable = false, execType = "none", fileTypeNeeded = "") {
    const parts = repoIdentifier.split('/');
    // We still extract the repoName for the registry metadata
    const repoName = parts.length > 1 ? parts[1] : repoIdentifier;

    const jsonUrl = `https://messdiener.stoppedwumm.net/downloads/version.json`;
    const downloadBaseUrl = `https://messdiener.stoppedwumm.net/downloads/`;

    let registryData = {
        name: repoName,
        path: `g/${repoName}`,
        url: [],
        origin: repoIdentifier
    };

    try {
        const response = request('GET', jsonUrl, {
            headers: { 'User-Agent': 'NodeJS-Update-Module' }
        });

        if (response.statusCode === 200) {
            const data = JSON.parse(response.getBody('utf8'));
            
            // Logic to handle if JSON is a direct array ["1.0.0", ...] 
            // or an object with a versions property { "versions": ["1.0.0"] }
            const versions = Array.isArray(data) ? data : (data.versions || []);

            registryData.url = versions.map(version => {
                // Construct the zip URL as per your example
                const downloadUrl = `${downloadBaseUrl}${version}.zip`;

                // Since these are explicitly .zip files based on your example:
                const extension = "zip";
                
                // Logic: If a fileTypeNeeded is provided, check if 'zip' matches.
                // Otherwise, use the global executable boolean.
                const isExecutable = (fileTypeNeeded !== "") 
                    ? (extension === fileTypeNeeded.toLowerCase()) 
                    : executable;

                return {
                    versionRule: version, // The version string from the JSON
                    url: downloadUrl,
                    executable: isExecutable,
                    execType: execType
                };
            });
        }
    } catch (error) {
        console.error(`[Update] Error fetching versions from ${jsonUrl}:`, error.message);
    }

    return registryData;
};
