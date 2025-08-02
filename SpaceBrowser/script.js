document.addEventListener('DOMContentLoaded', function() {
    // The API key is now completely removed from the frontend code.

    // Updated fetchData to use our secure serverless function proxy
    async function fetchData(nasaApiUrl) {
        try {
            // We pass the target NASA URL to our proxy function
            const proxyUrl = `/.netlify/functions/nasa-proxy?nasaApiUrl=${encodeURIComponent(nasaApiUrl)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`Proxy error! Status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch data via proxy:", error);
            return null;
        }
    }

    async function getAPOD() {
        // Notice we REMOVE the &api_key= part from the URL
        const url = `https://api.nasa.gov/planetary/apod?count=1`;
        const data = await fetchData(url);
        const apodContent = document.getElementById('apod-content');
        if (data && Array.isArray(data) && data.length > 0) {
            const randomApod = data[0];
            const mediaHtml = randomApod.media_type === 'image'
                ? `<img src="${randomApod.url}" alt="${randomApod.title}">`
                : `<iframe src="${randomApod.url}" frameborder="0" allowfullscreen></iframe>`;
            apodContent.innerHTML = `${mediaHtml}<h3>${randomApod.title}</h3><p>${randomApod.explanation}</p>`;
        } else {
            apodContent.innerHTML = `<p>Could not load a random Picture of the Day.</p>`;
        }
    }

    async function getApolloMissionData() {
        const moonContent = document.getElementById('moon-content');
        const apolloMissions = [
            { name: "Apollo 11", crew: "Armstrong, Aldrin, Collins", site: "Sea of Tranquility" },
            { name: "Apollo 12", crew: "Conrad, Gordon, Bean", site: "Ocean of Storms" },
            { name: "Apollo 14", crew: "Shepard, Roosa, Mitchell", site: "Fra Mauro formation" },
            { name: "Apollo 15", crew: "Scott, Worden, Irwin", site: "Hadley Rille" },
            { name: "Apollo 16", crew: "Young, Mattingly, Duke", site: "Descartes Highlands" },
            { name: "Apollo 17", crew: "Cernan, Evans, Schmitt", site: "Taurus-Littrow valley" }
        ];
        const mission = apolloMissions[Math.floor(Math.random() * apolloMissions.length)];
        // The images API doesn't require a key, so we can call it directly
        const url = `https://images-api.nasa.gov/search?q=${mission.name} lunar surface&media_type=image&keywords=lunar,moon,-astronaut,-portrait`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data && data.collection && data.collection.items.length > 0) {
                const item = data.collection.items[Math.floor(Math.random() * data.collection.items.length)];
                const imageUrl = item.links[0].href;
                moonContent.innerHTML = `<img src="${imageUrl}" alt="A photo from the ${mission.name} mission."><p><strong>Mission:</strong><span>${mission.name}</span></p><p><strong>Crew:</strong><span>${mission.crew}</span></p><p><strong>Landing Site:</strong><span>${mission.site}</span></p>`;
            } else {
                moonContent.innerHTML = `<p>Could not retrieve Apollo mission data.</p>`;
            }
        } catch(e) {
             moonContent.innerHTML = `<p>Could not retrieve Apollo mission data.</p>`;
        }
    }
    
    async function getEPICImage() {
        const url = `https://api.nasa.gov/EPIC/api/natural/images?`; // Key removed
        const data = await fetchData(url);
        const epicContainer = document.getElementById('epic-image-container');
        if (data && data.length > 0) {
            const latestImage = data[0];
            const date = new Date(latestImage.date);
            const dateString = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
            // We need to use the proxy for the final image URL as well
            const imageUrl = `/.netlify/functions/nasa-proxy?nasaApiUrl=${encodeURIComponent(`https://api.nasa.gov/EPIC/archive/natural/${dateString}/png/${latestImage.image}.png?`)}`;
            const spaceFacts = [ "Earth is the only planet in our solar system not named after a god.", "The Earth's rotation is gradually slowing down, making days longer.", "A powerful magnetic field protects Earth from the effects of solar wind.", "Earth is the densest planet in the Solar System.", "The highest point on Earth is Mount Everest, and the lowest is the Mariana Trench.", "Our planet is about 4.54 billion years old.", "Earth's axial tilt of 23.5 degrees is what causes our seasons.", "About 71% of the Earth's surface is water-covered.", "A day on Venus is longer than a year on Venus.", "The Sun accounts for 99.86% of the mass in our solar system.", "Footprints left by Apollo astronauts on the Moon will stay there for millions of years.", "There are more trees on Earth than there are stars in the Milky Way galaxy.", "A sunset on Mars appears blue to human observers.", "Neutron stars are so dense, a spoonful would weigh more than a mountain.", "You could fit all other planets in our solar system between the Earth and the Moon.", "The Voyager 1 spacecraft is the most distant human-made object from Earth." ];
            const randomFact = spaceFacts[Math.floor(Math.random() * spaceFacts.length)];
            epicContainer.innerHTML = `<img src="${imageUrl}" alt="Latest image of Earth from the DSCOVR satellite"><p class="image-caption">${randomFact}</p>`;
        } else {
            epicContainer.innerHTML = `<p>Could not load the latest image of Earth.</p>`;
        }
    }

    async function getMarsRoverPhoto(roverName) {
        const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/latest_photos?`; // Key removed
        const photoContainer = document.getElementById('mars-photo-content');
        photoContainer.innerHTML = `<p class="loading">Fetching latest photo from ${roverName}...</p>`;
        const data = await fetchData(url);
        if (data && data.latest_photos && data.latest_photos.length > 0) {
            const photo = data.latest_photos[Math.floor(Math.random() * data.latest_photos.length)];
            photoContainer.innerHTML = `<img src="${photo.img_src}" alt="Photo by ${roverName} on Sol ${photo.sol}"><p class="image-caption"><strong>Sol:</strong> ${photo.sol} | <strong>Camera:</strong> ${photo.camera.full_name}</p>`;
        } else {
            photoContainer.innerHTML = `<p>Could not retrieve a photo from ${roverName}.</p>`;
        }
    }
    
    function setupRoverButtons() {
        const buttons = document.querySelectorAll('.rover-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function() {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                const roverName = this.getAttribute('data-rover');
                getMarsRoverPhoto(roverName);
            });
        });
    }

    getAPOD();
    getApolloMissionData();
    getEPICImage();
    getMarsRoverPhoto('curiosity');
    setupRoverButtons();
});