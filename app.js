"use strict";
const fileInput = document.getElementById("fileInput");
const fileTable = document.getElementById("fileTable").getElementsByTagName("tbody")[0];
const addButton = document.getElementById('addButton');
const nextButton = document.getElementById('nextButton');
const backButton = document.getElementById('backButton');
const loopButton = document.getElementById('loopButton');

const audioPlayer = document.getElementById("audioPlayer");
const audioSource = document.getElementById("audioSource");
audioPlayer.volume=0.5;

const sliderName = document.getElementById("sliderName");
const slider = document.getElementById("sliderContainer");
const playnow = document.getElementById("playnow");

let playlist = [];
let namelist = [];
let currentmusic=0;

let startlist = [];
let endlist = [];
let loop = false;

noUiSlider.create(slider, {
  start: [0, 120],                   //スライダーバーの初期位置を指定
  connect:true,
  step: 1,
  range: {
    'min': 0,                       //スライダーバーの最小値
    'max': 120   //スライダーバーの最大値
  },
  tooltips: true,
  pips: {
    mode: 'values',
    values: [60],
    format: {
      to: function(value){
        return customFormat(value);
      },
      from: function(value){
        return value;
      }
    }
  },
  format: {
    to: function(value){
      return convertSecToMin(value);
    },
    from: function(value){
      return value;
    }
  }
});

addButton.addEventListener('click', () => {
  const file = fileInput.files[0];
  if(file){
    const tmp = file.name;
    const fileName = tmp.substr(0,tmp.length-4);
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.load();
    audio.addEventListener('canplaythrough', () => {
      console.log("duration:",audio.duration);
    })
    const reader = new FileReader();
    reader.onload = function(e) {
        const newRow = fileTable.insertRow();
        const nameCell = newRow.insertCell(0);
        const Time = newRow.insertCell(1);
        const action = newRow.insertCell(2);

        startlist[startlist.length]=0.0;
        endlist[endlist.length]=audio.duration;
        playlist[playlist.length]=audio;
        namelist[namelist.length]=fileName+"("+convertSecToMin(audio.duration)+") ";

        nameCell.innerHTML = namelist[namelist.length-1];
        Time.innerHTML = showTime(startlist.length-1);
        action.innerHTML = '<button onclick="customButton(this)">カスタム</button> <button onclick="deleteButton(this)">削除</button>';

        if(playlist.length==1){
          audioSource.src = audio.src;
          audioPlayer.load();
        }
    };
    reader.readAsText(file);
    fileInput.value="";
    if(audioSource.src===undefined){
      audioSource.src=audio.src;
    }
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
function customFormat(value){
  if(value===0){
    return 'Start';
  }else if(playlist.length!=0 && value===playlist[currentmusic].duration){
    return 'End';
  }else{
    return convertSecToMin(value);
  }
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

function setValues(range){
  let result = [];
  const size = 10;
  let scope = 30;
  while(range>=size*scope){
    if(scope>300) break;
    scope*=2;
  }
  for(let i=scope;i<range;i+=scope){
    result[result.length]=i;
  }
  return result;
}

function setSlider(index){
  sliderName.style.display = "block";
  slider.style.display = "block";
  sliderName.innerHTML = "再生区間の調整曲： " + namelist[index];
  let st=startlist[index];
  let end=endlist[index];
  let range = setValues(playlist[index].duration);
  slider.noUiSlider.updateOptions({
    start:[st,end],
    range:{
      'min': 0.0,
      'max': playlist[index].duration
    },
    pips: {
      mode: 'values',
      values: range,
      format: {
        to: function(value){
          return customFormat(value);
        },
        from: function(value){
          return value;
        }
      }
    },
});
}

function offSlider(row,index){
  let objSlide1 = $('.noUi-handle')[0];
  let objSlide2 = $('.noUi-handle')[1];
  startlist[index] = objSlide1.getAttribute('aria-valuenow');
  endlist[index] = objSlide2.getAttribute('aria-valuenow');
  row.cells[1].innerHTML = showTime(index);
}

function customButton(button){
  const row = button.parentNode.parentNode;
  const fileName = row.cells[0].textContent;
  const index = namelist.indexOf(fileName);
  if (slider.style.display === "none") {
    setSlider(index);
  }else {
    offSlider(row,index);
    sliderName.style.display = "none";
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
  }else if(playlist.length===1){
    audioSource.src=undefined;
    audioPlayer.load();
  }
  playlist.splice(index,1);
  namelist.splice(index,1);
  startlist.splice(index,1);
  endlist.splice(index,1);
  table.removeChild(row);
  sliderName.style.display = "none";
  slider.style.display = "none";
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
  playnow.innerHTML = "";
});
audioPlayer.addEventListener('play', () => {
  playnow.innerHTML = "再生中：" + namelist[currentmusic];
});

