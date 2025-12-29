window.onload = function () {
    const albumContainer = document.getElementById("albumContainer");
    const modalTitle = document.getElementById("exampleModalLabel");
    const modalBody = document.querySelector("#exampleModal .modal-body");
    const spotifyButton = document.getElementById("spotifyButton");
    let albumsData = [];

    // fetch json
    fetch('assets/data/library.json')
        .then(res => res.json())
        .then(data => {
            albumsData = data;
            renderAlbums(albumsData);
        });

    // generate cards dynamically
    function renderAlbums(albums) {
        albumContainer.innerHTML = '';

        albums.forEach((album, index) => {
            const col = document.createElement('div');
            col.className = "col-xl-2 col-md-3 col-sm-6 col-12 mb-4";

            col.innerHTML =
                `<div class="card h-100">
                    <img src="assets/img/${album.thumbnail}" class="card-img-top">
                    <div class="card-body">
                        <h5>${album.artist}</h5>
                        <p>${album.album}</p>
                    </div>
                    <div class="card-footer bg-transparent border-0">
                        <button class="btn btn-primary w-100 view-tracklist-btn"
                            data-index="${index}"
                            data-bs-toggle="modal"
                            data-bs-target="#exampleModal">
                            View Tracklist
                        </button>
                    </div>
                </div>`;

            albumContainer.appendChild(col);
        });

        window.scrollTo({top:0, behavior: 'smooth'});
    }

    // handle View Tracklist button clicks (event delegation)
    albumContainer.addEventListener('click', e=> {
        const btn = e.target.closest('.view-tracklist-btn');
        if (!btn) return;

        const album= albumsData[btn.dataset.index];
        if (!album) return;

        // populate modal
        modalTitle.textContent = `${album.artist} – ${album.album}`;

        //stats
        const lengths= album.tracklist.map(t =>{
            const [m, s]= t.trackLength.split(':').map(Number);
            return m*60+s;
        });

        const total= lengths.reduce((a,b) => a+b, 0);
        const avg = Math.round(total/lengths.length);
        const max= Math.max(...lengths);
        const min= Math.min(...lengths);

        const toTime= sec=> `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;

        let HTML =
           `<p>
                <strong>Total tracks:</strong> ${lengths.length}<br>
                <strong>Total:</strong> ${toTime(total)}<br>
                <strong>Average:</strong> ${toTime(avg)}<br>
                <strong>Longest:</strong> ${toTime(max)}<br>
                <strong>Shortest:</strong> ${toTime(min)}            
            </p>
            <ol class="list-group list-group-numbered">`;

        album.tracklist.forEach(track => {
            HTML += `
                <li class="list-group-item">
                    <a href="${track.url}" target="_blank" class="link-success">
                        ${track.title}
                    </a>
                    (${track.trackLength})
                </li>
            `;
        });

        HTML += '</ol>';
        modalBody.innerHTML = HTML;

        // spotify button -- 1st song
        spotifyButton.href = album.tracklist[0]?.url || '#';

    });

    //search/filter albums
    const searchInput= document.getElementById('searchInput');

    searchInput.addEventListener('input', function(){
        const query=searchInput.value.toLowerCase().trim(); //normalise text

        if(!query){
            renderAlbums(albumsData);
        }
        else{
            const filteredAlbums= albumsData.filter((album)=> 
                album.artist.toLowerCase().includes(query) ||
                album.album.toLowerCase().includes(query));
            renderAlbums(filteredAlbums);
        };
    });

    //sort 
    const sortSelect = document.getElementById('sortSelect');

    if(sortSelect)
    {
        sortSelect.addEventListener('change', ()=>{
            const sorted= [...albumsData];
            if(sortSelect.value==='artist'){
                sorted.sort((a,b)=> a.artist.localeCompare(b.artist));
            }
            if(sortSelect.value==='album'){
                sorted.sort((a,b)=> a.album.localeCompare(b.album));
            }
            if(sortSelect.value==='trackAsc'){
                sorted.sort((a,b)=>a.tracklist.length-b.tracklist.length);
            }
            if(sortSelect.value==='trackDesc'){
                sorted.sort((a,b)=>b.tracklist.length-a.tracklist.length);
            }

            renderAlbums(sorted);

         });
    }
}