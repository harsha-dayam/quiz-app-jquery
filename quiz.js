var topNo;
var qno;
var qVar;
var answers = [];
var timeLeft = [];
var temp="";

var minute = 0;
// minute=-(2*Math.PI/70);
/* Timer */

var timeLimit = 60000;
var timer;

var quiz = null;
$.ajax({
  type:'GET',
  async: false, 
  url: 'js/object.json',
  dataType: 'json',
  success: function(data) {
    quiz = data;
    console.log(data);
    init();
  }
});

function init() {
  topNo = sessionStorage.getItem('topicNo');
  qno = 0;
  if(sessionStorage.getItem("qno"+topNo)) qno = parseInt(sessionStorage.getItem("qno"+topNo));
  qVar = quiz.topics[topNo];
  if(sessionStorage.getItem(qVar.name)) answers=sessionStorage.getItem(qVar.name).split(",");
  if(sessionStorage.getItem("timeLeft"+topNo)) timeLeft=sessionStorage.getItem("timeLeft"+topNo).split(",");
  //timeLeft[qno]=timeLimit;
  if(timeLeft[qno]) 
    timeLimit = timeLeft[qno];
  //timeLeft[qno]=timeLimit;
  timerStart();
  document.getElementById("topic").innerHTML = qVar.name;
  renderQ();
}

function timerStart() {  
  timer = setInterval(function(){
    drawHand();
    timeLimit -= 1000;    
    timeLeft[qno]=timeLimit;
    var minutes = Math.floor((timeLimit % (1000 * 60 * 60)) / (1000 * 60));
    minutes = ("0" + minutes).slice(-2);
    var seconds = Math.floor((timeLimit % (1000 * 60)) / 1000);
    seconds = ("0" + seconds).slice(-2);
    document.getElementById("time").innerHTML = minutes + ":" + seconds;
    //document.getElementById("time").style.display = "inline-block";
    if (timeLimit < 0) {
      timeLeft[qno] = -0;
      if(timeOut()==true){        
        document.getElementById("topModal").style.display = "block";
        clearInterval(timer);
        document.getElementById("time").innerHTML = "00:00";
        minute = (2*Math.PI);
        drawhand();
      }
      else{
        document.getElementById("time").innerHTML = "01:00";
        nextQ();
        timeLimit=60000;
      }
    }
  },1000);
}


function nextQ(){
  if(qno<qVar.questions.length-1){
    qno++;    
    renderQ();    
  }
  else{
    qno=0;
    renderQ();
  }
}
function prevQ(){
  if(qno>0){
    qno--;
    renderQ();
  }
  else if(qno==0 && answers.length>1){
    qno=answers.length-1;
    renderQ();
  }
}
function renderQ(){
  /*rendering question and answers*/
  temp = '<div class="well"><h2 class="text-center">'+qVar.questions[qno].q+'</h2></div><div class="row">';
  for (var i = 0; i < qVar.questions[qno].options.length; i++) {
    temp+='<div class="col-sm-6"><p class="text-center"><label class="btn btn-default btn-lg options-'+qno+'"><input type="radio" value="'+qVar.questions[qno].options[i]+'" name="options" onChange="selectOption(this)"> '+qVar.questions[qno].options[i]+'</input></label></p></div>';    
  }
  temp+="</div>";
  document.getElementById("question").innerHTML=temp;
  
  if(timeLeft[qno]){timeLimit=timeLeft[qno]; minute = ((60000-timeLeft[qno])/1000)*((2*Math.PI)/60)}
  else {timeLimit=60000; document.getElementById("time").innerHTML = "01:00"; minute = 0;};
  clearInterval(timer);
  timerStart();
   //getElementById("time").style.display="inline-block";

   /*disabling skip button*/
   if(answers[qno]!==undefined){document.getElementById("skip").disabled = true;}
   /*disabling/enabling next button*/
   document.getElementById("next").disabled = true;
  //else{document.getElementById("next").disabled = false;}
  /*disabling/enabling previous, skip, next & submit*/
  if(qno == 0 && answers.length < 2) {
    document.getElementById("previous").disabled = true;
  }
  else if (answers.length==qVar.questions.length && allAnswered()==true){
    document.getElementsByClassName("next")[0].style.display = "none";
    document.getElementById("submit").style.display = "block";
    document.getElementById("skip").disabled = true;
  }
  else {
    document.getElementsByClassName("next")[0].style.display = "block";
    document.getElementById("submit").style.display = "none";
    document.getElementById("previous").disabled = false;
    document.getElementById("skip").disabled = false;
  }
  //focus on selected answer
  // if(answers[qno]!==undefined){
  //   document.querySelectorAll('[value="'+answers[qno]+'"]')[0].parentNode.classList.add("active");
  // }
}

function selectOption(obj){
  answers[qno] = obj.value;
  //skip button
  if(answers[qno]!==undefined){document.getElementById("skip").disabled = true; document.getElementById("next").disabled = false;}
  else{document.getElementById("skip").disabled = false; document.getElementById("next").disabled = true;}
  //next button
  if (answers.length>0){document.getElementById("next").disabled = false;}
  //submit button
  if((answers.length==qVar.questions.length && allAnswered()==true) || timeOut()==true){
    document.getElementsByClassName("next")[0].style.display = "none";
    document.getElementById("submit").style.display = "block";
  }
  var opt=document.getElementsByClassName('options-'+qno+'');
  for(var i=0; i<opt.length; i++){
    opt[i].classList.remove("active");
  }
  obj.parentNode.classList.add("active");
}

function allAnswered(){
  var count = 0;
  for (var i=0; i<answers.length; i++){
    if (answers[i] === undefined){count++;}
  }
  if (count>0){return false;}
  else {return true;}
}

function timeOut(){
  var count = 0;
  for (var i=0; i<qVar.questions.length; i++){
    if (answers[i]!==undefined || timeLeft[i] === -0){count++}
  }
if(count == qVar.questions.length){return true;}
else return false;
}

function skipQ(){ 
  var i;
  if (qno==qVar.questions.length-1){i=0;}
  else {i=qno+1;}
  while(true){
    if(i==qno){alert("You've reached the last question!"); break;}
    else if(answers[i]===undefined && timeLeft[i]!=-0){timeLeft[qno]=timeLimit; qno=i; renderQ(); break;}
    else if(i==qVar.questions.length-1){i=0;}
    else {i++;}  
  }  
}

function validateAns(){

  clearInterval(timer);
  document.getElementById("time").innerHTML = "00:00"; 
  var count = 0;
  for(var i in answers){
    if(answers[i]==qVar.questions[i].answer){
      count++;
    }
  }
  if(count>=Math.ceil(qVar.questions.length/2)){
    document.getElementById("audio-win").play();
    document.body.style.backgroundImage = "url('https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif')";
  }
  else{
    document.getElementById("audio-lose").play();
    document.body.style.backgroundImage = "url('https://media.giphy.com/media/GWlO71pnRfZ9C/giphy.gif')";
  }
  document.getElementById("topModal").style.display = "none";
  if(sessionStorage.getItem('topicNo')==quiz.topics.length-1) {document.getElementById("nextTop").innerHTML=" <span class='glyphicon glyphicon-forward'></span> "+quiz.topics[0].name;}
  else document.getElementById("nextTop").innerHTML=" <span class='glyphicon glyphicon-forward'></span> "+quiz.topics[parseInt(sessionStorage.getItem('topicNo'))+1].name;
  document.getElementsByClassName("modal-body1")[0].innerHTML="<p> You've scored "+count+" question(s) right!</p>";

  var modal = document.getElementById('myModal');
  modal.style.display = "block";
}

function saveExit(){
 sessionStorage.setItem(qVar.name, answers);
 sessionStorage.setItem("timeLeft"+topNo,timeLeft);
 sessionStorage.setItem("timeLimit"+topNo, timeLimit);
 sessionStorage.setItem("qno"+topNo, qno);
 window.location.href = 'landing.html';
}

function nextTopic(){
  if(sessionStorage.getItem('topicNo')==quiz.topics.length-1) {
    sessionStorage.setItem('topicNo', 0);
  }
  else sessionStorage.setItem('topicNo', parseInt(sessionStorage.getItem('topicNo'))+1);
  window.location.href = 'quiz.html';
}

// Clock
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var radius = canvas.height / 2;
radius = radius * 0.90;
ctx.translate(radius, radius);


//drawNumbers(ctx, radius);

function drawHand() {
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);
  minute+=(((2*Math.PI))/60);
  ctx.beginPath();
  ctx.lineWidth = radius*0.03;
  ctx.moveTo(0,0);
  ctx.rotate(minute);
  ctx.lineTo(0, -radius*0.8);
  ctx.stroke();
  ctx.rotate(-minute);
}

function drawFace(ctx, radius) {
  var grad;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, 2*Math.PI);
  ctx.fillStyle = 'white';
  ctx.fill();
  grad = ctx.createRadialGradient(0,0,radius*0.95, 0,0,radius*1.1);
  grad.addColorStop(0, '#333');
  grad.addColorStop(0.5, 'white');
  grad.addColorStop(1, '#333');
  ctx.strokeStyle = grad;
  ctx.lineWidth = radius*0.1;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, radius*0.009, 0, 2*Math.PI);
  ctx.fillStyle = '#333';
  //ctx.fill();
  
}

function drawNumbers(ctx, radius) {
  var ang;
  var num;
  ctx.font = radius*0.15 + "px arial";
  ctx.textBaseline="middle";
  ctx.textAlign="center";
  for(num = 1; num < 13; num++){
    ang = num * Math.PI / 6;
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.85);
    ctx.rotate(-ang);
    ctx.fillText((num*5).toString(), 0, 0);
    ctx.rotate(ang);
    ctx.translate(0, radius*0.85);
    ctx.rotate(-ang);
  }
}