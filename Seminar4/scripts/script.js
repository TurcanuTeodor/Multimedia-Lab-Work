window.onload = function () {
    const albumContainer = document.getElementById("albumContainer");
    const modalTitle = document.getElementById("exampleModalLabel");
    const modalBody = document.querySelector("#exampleModal .modal-body");
    const spotifyButton = document.getElementById("spotifyButton");
    let albumsData = [];

    // 1) fetch json
    fetch('assets/data/library.json')
        .then((response) => {
            if (!response.ok) {
                throw new Error("Could not load library.json");
            }
            return response.json();
        })
        .then((albums) => {
            // 2) albums is an array of album objects
            albumsData = albums;
            renderAlbums(albumsData);
        })
        .catch((err) => {
            console.error(err);
            albumContainer.innerHTML = `<div class="alert alert-danger">Error loading album library.</div>`;
        });

    // 3) generate cards dynamically
    function renderAlbums(albums) {
        albumContainer.innerHTML = '';

        albums.forEach((album, index) => {
            const col = document.createElement('div');
            col.className = "col-xl-2 col-md-3 col-sm-6 col-12 mb-4";

            col.innerHTML =
                `<div class="card h-100">
                <img src="assets/img/${album.thumbnail}" class="card-img-top" alt="Album cover">
                <div class="card-body">
                    <h5 class="card-title">${album.artist}</h5>
                    <p class="card-text">${album.album}</p>
                </div>
                <div class="card-footer bg-transparent border-0">
                    <button
                    type="button"
                    class="btn btn-primary w-100 view-tracklist-btn"
                    data-index="${index}"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal">
                    View Tracklist
                    </button>
                </div>
                </div>`;

            albumContainer.appendChild(col);
        });
    }

    // 4) handle "View Tracklist" button clicks (event delegation)
    albumContainer.addEventListener('click', function (e) {
        const btn = e.target.closest('.view-tracklist-btn');
        if (!btn) return;

        const index = btn.getAttribute('data-index');
        const album = albumsData[index];
        if (!album) return;

        // 5) populate modal
        modalTitle.textContent = `${album.artist} – ${album.album}`;

        let tracklistHTML =
            `<p><strong>Total tracks:</strong> ${album.tracklist.length}</p>
             <ol class="list-group list-group-numbered">`;

        album.tracklist.forEach(track => {
            tracklistHTML += `
                <li class="list-group-item">
                    <a href="${track.url}" target="_blank" class="link-success">
                        ${track.title}
                    </a>
                    <span class="text-muted"> (${track.trackLength})</span>
                </li>
            `;
        });

        tracklistHTML += '</ol>';
        modalBody.innerHTML = tracklistHTML;

        // spotify button -- 1st song
        spotifyButton.href = album.tracklist[0]?.url || '#';
    });
}