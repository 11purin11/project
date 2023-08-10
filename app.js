const fileInput = document.getElementById("fileInput");
const fileTable = document.getElementById("fileTable").getElementsByTagName("tbody")[0];
const addButton = document.getElementById('addButton');
const nextButton = document.getElementById('nextButton');
const backButton = document.getElementById('backButton');
const loopButton = document.getElementById('loopButton');

const audioPlayer = document.getElementById("audioPlayer");
const audioSource = document.getElementById("audioSource");

const slider = document.getElementById("sliderContainer");
const playnow = document.getElementById("playnow");

let playlist = [];
let namelist = [];
let currentmusic=0;

let startlist = [];
let endlist = [];
let loop = false;

addButton.addEventListener('click', () => {
  const file = fileInput.files[0];
  if(file){
    const tmp = file.name;
    const fileName = tmp.substr(0,tmp.length-4);
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = function(e) {
        const newRow = fileTable.insertRow();
        const nameCell = newRow.insertCell(0);
        const Time = newRow.insertCell(1);
        const action = newRow.insertCell(2);

        startlist[startlist.length]=0.0;
        endlist[endlist.length]=audio.duration;

        nameCell.innerHTML = fileName;
        Time.innerHTML = showTime(startlist.length-1);
        action.innerHTML = '<button onclick="customButton(this)">カスタム</button> <button onclick="deleteButton(this)">削除</button>';

        playlist[playlist.length]=audio;
        namelist[namelist.length]=fileName;
        if(playlist.length==1){
          audioSource.src = audio.src;
          audioPlayer.load();
        }
    };
    reader.readAsText(file);
    fileInput.value="";
  }else {
    alert('ファイルを選択してください。');
  }
});

function createName(fileName){
  const truncatedFilename = fileName.length > 30 ? fileName.substring(0, 30) : fileName;
  const paddingLength = 30 - truncatedFilename.length;
  return ' '.repeat(paddingLength) + truncatedFilename;
}
function stringTime(str){
  if(str.length==1) return "0"+str;
  else return str;
}
function convertSecToMin(second){
  let min = Math.floor(second/60);
  let sec = Math.floor(second%60);
  return stringTime(String(min))+":"+stringTime(String(sec));
}
function showTime(index){
  return convertSecToMin(startlist[index])+" - " + convertSecToMin(endlist[index]);
}

nextButton.addEventListener('click', () => {
  setMusic(currentmusic+1);
});
backButton.addEventListener('click', () => {
  setMusic(currentmusic-1);
});
loopButton.addEventListener('click', () => {
  const mode = document.getElementById("mode").value;
  if(mode==="off"){
    loop=false;
  }else{
    loop=true;
  }
});

function customButton(button){
  const row = button.parentNode.parentNode;
  const fileName = row.cells[0].textContent;
  const index = namelist.indexOf(fileName);
  if (slider.style.display === "none") {
    slider.style.display = "block";
    let st=startlist[index];
    let end=endlist[index];
    noUiSlider.create(slider, {
      start: [st, end],                   //スライダーバーの初期位置を指定
      range: {
        'min': 0.0,                       //スライダーバーの最小値
        'max': playlist[index].duration   //スライダーバーの最大値
      }
    });
  } else {
    let objSlide1 = $('.noUi-handle')[0];
    let objSlide2 = $('.noUi-handle')[1];
    startlist[index] = objSlide1.getAttribute('aria-valuenow');
    endlist[index] = objSlide2.getAttribute('aria-valuenow');

    row.cells[1].innerHTML = showTime(index);
    slider.style.display = "none";
  }
}

function deleteButton(button){
  const row = button.parentNode.parentNode;
  const table = row.parentNode;
  const fileName = row.cells[0].textContent;
  const index = namelist.indexOf(fileName);
  if(playlist.length>1 && audioSource.src===playlist[index].src){
    setMusic(currentmusic+1);
  }else{
    audioSource.src=undefined;
  }
  playlist.splice(index,1);
  namelist.splice(index,1);
  startlist.splice(index,1);
  endlist.splice(index,1);
  table.removeChild(row);
}

function setMusic(index){
  if(index<0) index=playlist.length-1;
  currentmusic = index%playlist.length;
  const tmp = audioPlayer.paused;
  audioSource.src = playlist[currentmusic].src;
  audioPlayer.load();
  audioPlayer.currentTime = startlist[currentmusic];
  if(!tmp) audioPlayer.play();
}

audioPlayer.addEventListener('ended', () => {
  if(playlist.length>0){
    if(!loop) setMusic(currentmusic+1);
    else setMusic(currentmusic);
    audioPlayer.play();
  }
});

audioPlayer.addEventListener('timeupdate', () => {
  if(audioPlayer.currentTime <= startlist[currentmusic]) {
    audioPlayer.currentTime = startlist[currentmusic];
  }
  if(audioPlayer.currentTime >= endlist[currentmusic]) {
      if(!loop) setMusic(currentmusic+1);
      else setMusic(currentmusic);
      audioPlayer.play();
  }
});

audioPlayer.addEventListener('pause', () => {
  playnow.innerHTML = "停止中";
})
audioPlayer.addEventListener('play', () => {
  playnow.innerHTML = "再生中：" + namelist[currentmusic];
})