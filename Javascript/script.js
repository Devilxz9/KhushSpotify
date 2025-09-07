let currentsong = new Audio();
let songs;
let crrFolder;
// song time fucntion to play time during song
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  // pad with leading zero if < 10
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(secs).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}



async function getsongs(folder) {
  crrFolder = folder;
  let a = await fetch(`${folder}/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }
    // return songs

  }
  let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
  songul.innerHTML = ""
  for (const song of songs) {
    songul.innerHTML = songul.innerHTML + `<li> <img class="invert" src="icons/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>

                                <img class="invert" src="icons/playbutton.svg" alt="">
                            </div> </li>`;

  }

  // play the first song
  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

    })

  });
  return songs
}

const playmusic = (track, pause = false) => {
  //   let audio = new Audio("/songs/" + track)
  currentsong.src = `${crrFolder}/` + track
  if (!pause) {
    currentsong.play()
    play.src = "icons/pause.svg"

  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track)
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}


async function displayalbums() {
  let a = await fetch(`/songs/`)
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a")
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-2)[0];

      // get the metadata of the folder
      let a = await fetch(`/songs/${folder}/info.json`)
      let response = await a.json();
      console.log(response);
      document.querySelector(".card-container").innerHTML = document.querySelector(".card-container").innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <div>
                                <svg viewBox="0 0 512 512">
                                    <!-- Green background -->
                                    <circle class="bg" cx="256" cy="256" r="245" />
                                    <!-- Play button -->
                                    <path class="button"
                                        d="M354.2 247.4l-135.1-92.4c-4.2-3.1-15.4-3.1-16.3 8.6v184.8c1 11.7 12.4 11.9 16.3 8.6l135.1-92.4c3.5-2.1 8.3-10.7 0-17.2zm-130.5 81.3v-145.4l106.1 72.7-106.1 72.7z" />
                                </svg>
                            </div>


                        </div>
                        <img src="songs/${folder}/cover.jpg"alt="">
                        <h2>${response.Title}</h2>
                        <p>${response.description}</p>
                        </div> `


    }

  }

  // load an playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async (item) => {
      // console.log(item, item.currentTarget.dataset);
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)

    }
    )
  })

}
console.log("hey");

// get the list of all songs
async function main() {
  await getsongs("songs/Anime")
  playmusic(songs[0], true)

  // display all the albums on the page

  displayalbums();

  // eventlinser to play previous next
  play.addEventListener("click", () => {
    if (currentsong.paused) {
      currentsong.play()
      play.src = "icons/pause.svg"
    }
    else {
      currentsong.pause()
      play.src = "icons/playbutton.svg"
    }
  })


  // listen for timeupdate fucntion

  currentsong.addEventListener("timeupdate", () => {
    // console.log(currentsong.currentTime, currentsong.duration);
    document.querySelector(".songtime").innerHTML = `${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`
    document.querySelector(".circle").style.left = currentsong.currentTime / currentsong.duration * 100 + "%"

  })

  // seek bar jumping
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    // console.log(e.offsetX);

  }
  )

  // adding an seekbar circle moveablke
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentsong.currentTime = ((currentsong.duration) * percent) / 100
  }
  )
  // add an event listner to haburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  }
  )
  // add an event listner to hamburger2
  document.querySelector(".hamburger2").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  }
  )

  // add an eventlisner for previous and 
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playmusic(songs[index - 1])

    }

  })
  // add an eventlisner next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playmusic(songs[index + 1])

    }
  })

  // add an event to volume range
  range.addEventListener("change", (e) => {
    // console.log(e, e.target, e.target.value);
    currentsong.volume = parseInt(e.target.value) / 100
  })

  // mute when volume button is clicked

  document.querySelector(".volume").addEventListener("click", (e) => {
    console.log(e.target);
    if (e.target.src.includes("icons/volume.svg")) {
      e.target.src = e.target.src.replace("icons/volume.svg", "icons/mute.svg");
      currentsong.volume = 0;
      range.value = 0
      
    }else{
      e.target.src = e.target.src.replace("icons/mute.svg", "icons/volume.svg") 
      currentsong.volume = 0.1
      range.value = 10
    }
    
    
  }
  )


}
main()


