const getInput = async () => {
    const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    const lon = await new Promise((resolve) => {
        readline.question("Provide a longitude: ", (answer) => {
            resolve(answer);
        });
    });
    const lat = await new Promise((resolve) => {
        readline.question("Provide a latitude: ", (answer) => {
            resolve(answer);
        });
    });
    const dis = await new Promise((resolve) => {
        readline.question("Provide the maximum distance: ", (answer) => {
            resolve(answer);
        });
    });
    readline.close();

    return {lon, lat, dis};
};

const getHubs = async (lon, lat, dis) => {
    const baseURL = "https://mikerhodes.cloudant.com/airportdb/_design/view1/_search/geo";
    const lonConf = `lon:[${lon} TO ${+lon + +dis}]`;
    const latConf = `lat:[${lat} TO ${+lat + +dis}]`;

    const response = await fetch(baseURL + '?query=' + lonConf + ' AND ' + latConf);
    const hubs = await response.json();

    let locations = [];
    let distance = 0;
    for(let row of hubs.rows){
        distance = Math.sqrt(Math.abs(+row.fields.lon - +lon) ** 2 + Math.abs(+row.fields.lat - +lat) ** 2);

        locations.push({
            name: row.fields.name,
            lon: row.fields.lon,
            lat: row.fields.lat,
            dis: distance,
            lonDis: Math.abs(row.fields.lon - lon),
            latDis: Math.abs(row.fields.lat - lat)
        });

        locations.sort((a,b) => a.dis - b.dis)
    }

    return {lon, lat, locations};
};

const displayOutput = (lon, lat, locations) => {
    console.log('------------------------------\nTransport hubs available:');

    for(let location of locations) {
        console.log(
`~~~~~~~~~~
${location.name}
Longitude: ${location.lon}
Latitude: ${location.lat}
Straight-line distance: ${location.dis}
Distance in longitude: ${location.lonDis}
Distance in latitude: ${location.latDis}`
        );
    }

    console.log('------------------------------');
}

getInput()
.then((input) => getHubs(input.lon, input.lat, input.dis))
.then((hubData) => displayOutput(hubData.lon, hubData.lat, hubData.locations));
