//Historique pour archivr les meilleures moments pour faire du kiteSurf Pas encore fait

/*************** *
*
* information pour la PWA déploiemnt : disponible à cette adresse gitHUB: dayaYuta19.github.io
*
*
**************/

// Fonction pour convertir km/h en nœuds
function convertKmHToKnots(kmh) {
    return kmh / 1.85; // Conversion basée sur 1 nœud = 1,85 km/h
}

// Tableau des tailles de voiles en fonction du poids
const kiteSizes = [
    { minWeight: 50, maxWeight: 60, size: [9] },
    { minWeight: 60, maxWeight: 65, size: [9, 10] },
    { minWeight: 65, maxWeight: 70, size: [10, 11] },
    { minWeight: 70, maxWeight: 75, size: [12] },
    { minWeight: 75, maxWeight: 80, size: [13] },
    { minWeight: 80, maxWeight: 90, size: [14] },
    { minWeight: 90, maxWeight: Infinity, size: [15] }
];

// Récupère la taille de voile adaptée en fonction du poids
function getKiteSize(weight) {
    for (let i = 0; i < kiteSizes.length; i++) {
        if (weight >= kiteSizes[i].minWeight && weight <= kiteSizes[i].maxWeight) {
            return kiteSizes[i].size;
        }
    }
    return null; // Poids non pris en charge
}

// Condition pour faire du kiteSurf
function getKiteConditions(weight, windSpeedKmH, windDirection) {
    const windSpeedKnots = convertKmHToKnots(windSpeedKmH); // Conversion km/h en nœuds
    const sizes = getKiteSize(weight);
    
    if (!sizes) {
        return "Poids non pris en charge.";
    }

    // Vérification de la direction du vent (off-shore)
    if (windDirection >= 0 && windDirection <= 180) {
        return "Le vent souffle vers le large (off-shore). C'est dangereux pour le kitesurf, car vous pourriez être emporté au large.";
    }

    // Vérification des plages de vent pour chaque taille de voile
    for (let i = 0; i < sizes.length; i++) {
        const size = sizes[i];
        let minWind, maxWind;
        if (size === 9) {
            minWind = 16; maxWind = 22;
        } else if (size === 10) {
            minWind = 14; maxWind = 20;
        } else if (size === 11) {
            minWind = 14; maxWind = 20;
        } else if (size === 12) {
            minWind = 12; maxWind = 18;
        } else if (size === 13) {
            minWind = 12; maxWind = 18;
        } else if (size === 14) {
            minWind = 10; maxWind = 16;
        } else if (size === 15) {
            minWind = 8; maxWind = 14;
        } else {
            return "Pas de plage de vent définie pour cette taille de voile.";
        }

        // Si le vent est dans la plage idéale
        if (windSpeedKnots >= minWind && windSpeedKnots <= maxWind) {
            return `Conditions idéales pour une aile de ${size}m². Le vent est entre ${minWind} et ${maxWind} nœuds.`;
        }
        // Si le vent est trop faible
        if (windSpeedKnots < minWind) {
            return `Le vent est trop faible pour une aile de ${size}m². La vitesse du vent est de ${windSpeedKnots.toFixed(2)} nœuds, mais elle devrait être au moins de ${minWind} nœuds.`;
        }
        // Si le vent est trop fort
        if (windSpeedKnots > maxWind) {
            return `Le vent est trop fort pour une aile de ${size}m². La vitesse du vent est de ${windSpeedKnots.toFixed(2)} nœuds, mais elle ne devrait pas dépasser ${maxWind} nœuds.`;
        }
    }

    // Si aucune condition n'est remplie
    return "Conditions de vent non adaptées.";
}

// Affiche le résultat pour l'utilisateur
function calculateKiteSize() {
    const weightInput = document.getElementById('weightInput');
    const weight = parseFloat(weightInput.value);
    
    if (isNaN(weight)) {
        document.getElementById('result').innerHTML = '<div class="alert alert-warning">Veuillez entrer un poids valide.</div>';
        return;
    }

    // Obtenir les données météo actuelles
    fetchMeteoData().then(meteo => {
        const result = getKiteConditions(weight, meteo.value, meteo.wind_direction);
        document.getElementById('result').innerHTML = `<div class="alert alert-info">${result}</div>`;
    });
}

// Récupère les données météo depuis l'API
async function fetchMeteoData() {
    try {
        const response = await fetch("https://data.geo.admin.ch/ch.meteoschweiz.messwerte-windgeschwindigkeit-kmh-10min/ch.meteoschweiz.messwerte-windgeschwindigkeit-kmh-10min_en.json");
        const data = await response.json();
        const features = data.features;
        
        for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            if (feature.id === "GVE") { // Station de Genève Cointrin
                return {
                    value: feature.properties.value, // Vitesse du vent
                    wind_direction: feature.properties.wind_direction, // Direction du vent
                };
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données météo:', error);
    }
    return { value: 0, wind_direction: 0 }; // Valeurs par défaut en cas d'erreur
}

// Affiche les données météo à l'utilisateur
function showMeteo(meteoData) {
    const meteoDisplay = document.getElementById('meteoDisplay');
    
    if (meteoDisplay) { // Vérifie si l'élément existe
        if (meteoData) {
            const { value, wind_direction } = meteoData;
            meteoDisplay.innerHTML = `
                <p>Vitesse du vent: ${value} km/h (${convertKmHToKnots(value).toFixed(2)} nœuds)</p>
                <p>Direction du vent: ${wind_direction}°</p>
            `;
        } else {
            meteoDisplay.innerHTML = '<p>Aucune donnée météo disponible.</p>';
        }
    } else {
        console.error('L\'élément avec l\'ID "meteoDisplay" est introuvable.');
    }
}

// Initialisation des données météo
function initializeMeteo() {
    fetchMeteoData().then(meteoData => {
        showMeteo(meteoData);
    });
}

// Rafraîchit les données météo toutes les 10 minutes (600 000 ms)
function refreshMeteoData() {
    fetchMeteoData().then(meteoData => {
        showMeteo(meteoData);
    });
    setInterval(refreshMeteoData, 600000); // 10 minutes
}

// Initialiser les données météo lorsque le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    initializeMeteo();
    refreshMeteoData(); // Démarre le rafraîchissement des données
});
