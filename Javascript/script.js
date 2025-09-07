let currentsong = new Audio();
let songs;
let crrFolder;

// song time function
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(secs).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

// ✅ fixed: now uses info.json
async function getsongs(folder) {
  crrFolder = folder;

  let response = await fetch(`${folder}/info.json`);
  let data = await response.json();

  songs = data.songs;

  let songul = document.querySelector(".songlist ul");
  songul.innerHTML = "";

  for (const song of songs) {
    songul.innerHTML += `<li> 
        <img class="invert" src="icons/music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>Artist</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" src="icons/playbutton.svg" alt="">
        </div> 
      </li>`;
  }

  // click event for each song
  Array.from(document.querySelectorAll(".songlist li")).forEach(e => {
    e.addEventListener("click", () => {
      playmusic(e.querySelector(".info div").innerHTML.trim());
    });
  });

  return songs;
}

const playmusic = (track, pause = false) => {
  currentsong.src = `${crrFolder}/` + track;
  if (!pause) {
    currentsong.play();
    play.src = "icons/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// ✅ fixed: no folder fetch, use pre-listed albums
async function displayalbums() {
  // here you can hardcode album folders
  const albums = ["Anime", "english"]; // add more: ["Anime","Rock","Pop"]

  for (let folder of albums) {
    let response = await fetch(`songs/${folder}/info.json`);
    let data = await response.json();

    document.querySelector(".card-container").innerHTML += `
      <div data-folder="${folder}" class="card">
        <div class="play">
          <div>
            <svg viewBox="0 0 512 512">
              <circle class="bg" cx="256" cy="256" r="245" />
              <path class="button"
                d="M354.2 247.4l-135.1-92.4c-4.2-3.1-15.4-3.1-16.3 8.6v184.8c1 11.7 12.4 11.9 16.3 8.6l135.1-92.4c3.5-2.1 8.3-10.7 0-17.2zm-130.5 81.3v-145.4l106.1 72.7-106.1 72.7z" />
            </svg>
          </div>
        </div>
        <img src="songs/${folder}/cover.jpg" alt="">
        <h2>${data.Title}</h2>
        <p>${data.description}</p>
      </div>`;
  }

  // click album card → load playlist
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async (item) => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

console.log("hey");

// main app
async function main() {
  await getsongs("songs/Anime");
  playmusic(songs[0], true);

  displayalbums();

  // elements
  let play = document.getElementById("play");
  let previous = document.getElementById("previous");
  let next = document.getElementById("next");
  let range = document.getElementById("range");

  // play/pause
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play();
      play.src = "icons/pause.svg";
    } else {
      currentsong.pause();
      play.src = "icons/playbutton.svg";
    }
  });

  // update time & seekbar
  currentsong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentsong.currentTime / currentsong.duration) * 100 + "%";
  });

  // seekbar jump
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = (currentsong.duration * percent) / 100;
  });

  // hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".hamburger2").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // prev/next
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) playmusic(songs[index - 1]);
  });
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) playmusic(songs[index + 1]);
  });

  // volume control
  range.addEventListener("change", (e) => {
    currentsong.volume = parseInt(e.target.value) / 100;
  });

  document.querySelector(".volume").addEventListener("click", (e) => {
    if (e.target.src.includes("icons/volume.svg")) {
      e.target.src = e.target.src.replace("icons/volume.svg", "icons/mute.svg");
      currentsong.volume = 0;
      range.value = 0;
    } else {
      e.target.src = e.target.src.replace("icons/mute.svg", "icons/volume.svg");
      currentsong.volume = 0.1;
      range.value = 10;
    }
  });
}
main();

