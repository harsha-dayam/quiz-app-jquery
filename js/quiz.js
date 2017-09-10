var topNo;
var qno;
var qVar;
var answers = [];
var timeLeft = [];
var temp="";

// Clock
var canvas ;
var ctx ;
var radius;
var minute = 0;
// minute=-(2*Math.PI/70);

/* Timer */
var timeLimit=[];
var timer;

var quiz = null;
$.ajax({
  type:'GET',
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
  if(sessionStorage.getItem("dist")) {timeLimit = sessionStorage.getItem("dist").split(",");}
  if(timeLimit[topNo]) timeLimit[topNo]=parseInt(timeLimit[topNo]);
  else timeLimit[topNo]= 60000*qVar.questions.length;  
  //timerStart();
  $("#topic").html(qVar.name);
  renderQ();
  // Clock
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  radius = canvas.height / 2;
  ctx.translate(radius, radius);
  radius = radius * 0.90;
  minute=-(Math.PI/179);
  drawFace(ctx, radius);
  drawNumbers(ctx, radius);

  //timer
  var timer = setInterval(function() {
    drawHand();
    timeLimit[topNo] -= 1000;

    var minutes = Math.floor((timeLimit[topNo] % (1000 * 60 * 60)) / (1000 * 60));
    minutes = ("0" + minutes).slice(-2);
    var seconds = Math.floor((timeLimit[topNo] % (1000 * 60)) / 1000);
    seconds = ("0" + seconds).slice(-2);
    
    $("#time").html(minutes + ":" + seconds);
    //document.getElementById("time").style.display = "inline-block";

    if (timeLimit[topNo]< 0) {
      clearInterval(timer);
      $("#time").html("00:00");
      $("#topModal").css("display", "block");
    }
  }, 1000);
}

$("#next").on('click', function(){ 
  if(qno<qVar.questions.length-1){
    qno++;
    renderQ();
  }
  else{
    qno=0;
    renderQ();
  }
});

$("#previous").on('click', function(){ 
  if(qno>0){
    qno--;
    renderQ();
  }
  else if(qno==0 && answers.length>1){
    qno=answers.length-1;
    renderQ();
  }
});

function renderQ(){

  /*rendering question and answers*/
  temp = '<div class="well"><h2 class="text-center">'+qVar.questions[qno].q+'</h2></div><div class="row">';
  for (var i = 0; i < qVar.questions[qno].options.length; i++) {
    temp+='<div class="col-sm-6"><p class="text-center"><label class="btn btn-default btn-lg options-'+qno+'"><input type="radio" value="'+qVar.questions[qno].options[i]+'" name="options" class="option"> '+qVar.questions[qno].options[i]+'</input></label></p></div>';
    //temp+='<div class="col-sm-6"><p class="text-center"><label class="btn btn-default btn-lg options-'+qno+'"><input type="radio" value="'+qVar.questions[qno].options[i]+'" name="options" onChange="selectOption(this)"> '+qVar.questions[qno].options[i]+'</input></label></p></div>';
  }
  temp+="</div>";
  $("#question").html(temp);
  
  /*disabling skip button*/
  if(answers[qno]!==undefined){$("#skip").prop('disabled', true);}
  /*disabling/enabling next button*/
  if(qno==0 && answers.length==0){$("#next").prop('disabled', true);}
  else{$("#next").prop('disabled', false)}
  /*disabling/enabling previous, skip, next & submit*/
  if(qno == 0 && answers.length < 2) {
    $("#previous").prop('disabled', true);;
  }
  else if (answers.length==qVar.questions.length && allAnswered()==true){
    $(".next").css("display", "none");
    $("#submit").css("display", "block");
    $("#skip").prop('disabled', true);;
  }
  else {
    $(".next").css("display", "block");
    $("#submit").css("display", "none");
    $("#previous").prop('disabled', false);
    $("#skip").prop('disabled', false);
  }
  //focus on selected answer
  if(answers[qno]!==undefined){
    $('[value="'+answers[qno]+'"]').parent().addClass("active");
  }
}

$(document.body).on('change','.option', function(){
  answers[qno] = $(this).val();
  //skip button
  if(answers[qno]!==undefined){$("#skip").prop('disabled', true);}
  else{$("#skip").prop('disabled', false);}
  //next button
  if (answers.length>0){$("#next").prop('disabled', false);}
  //submit button
  if(answers.length==qVar.questions.length && allAnswered()==true){
    $(".next").css("display", "none");
    $("#submit").css("display", "block");
  }
  var opt=document.getElementsByClassName('options-'+qno+'');
  for(var i=0; i<opt.length; i++){
    $(opt[i]).removeClass("active");
  }
  $(this).parent().addClass("active");
});

function allAnswered(){
  var count = 0;
  for (var i=0; i<answers.length; i++){
    if (answers[i] === undefined){count++;}
  }
  if (count>0){return false}
    else {return true}
  }


$("#skip").on('click', function(){ 
  if (answers.length==0){
   if(qno<qVar.questions.length-1){nextQ();}
   else {qno=0; renderQ();}
 }
 else{
  var i;
  if (qno==qVar.questions.length-1){i=0;}
  else {i=qno+1;}
  while(true){
    if(i==qno){alert("You've reached the last question!"); break;}
    else if(answers[i]===undefined){qno=i; renderQ(); break;}
    else if(i==qVar.questions.length-1){i=0;}
    else {i++;}
  }
}  
});

$(".validateAns").on('click', function(){ 
  clearInterval(timer);
  $("#time").html("00:00"); 
  var count = 0;
  for(var i in answers){
    if(answers[i]==qVar.questions[i].answer){
      count++;
    }
  }
  if(count>=Math.ceil(qVar.questions.length/2)){
    $("#audio-win").get(0).play();
    $("body").css("background-image", "url('https://media.giphy.com/media/26tOZ42Mg6pbTUPHW/giphy.gif')");
  }
  else{
    $("#audio-lose").get(0).play();
    $("body").css("background-image", "url('https://media.giphy.com/media/GWlO71pnRfZ9C/giphy.gif')");
  }
  $("#topModal").css("display", "none");
  if(sessionStorage.getItem('topicNo')==quiz.topics.length-1) {$("#nextTop").html(" <span class='glyphicon glyphicon-forward'></span> "+quiz.topics[0].name);}
  else $("#nextTop").html(" <span class='glyphicon glyphicon-forward'></span> "+quiz.topics[parseInt(sessionStorage.getItem('topicNo'))+1].name);
  $(".modal-body1").html("<p> You've scored "+count+" question(s) right!</p>");

  $("#myModal").css("display", "block");
});

$("#saveExit").on('click', function(){ 
 var topNo = sessionStorage.getItem('topicNo');
 sessionStorage.setItem(qVar.name, answers);
 alert("hi");
 sessionStorage.setItem("dist", timeLimit);
 sessionStorage.setItem("questionNo",qno);
 window.location.href = 'index.html';
});

$("#nextTop").on('click', function(){
  if(sessionStorage.getItem('topicNo')==quiz.topics.length-1) {
    sessionStorage.setItem('topicNo', 0);
  }
  else sessionStorage.setItem('topicNo', parseInt(sessionStorage.getItem('topicNo'))+1);
  window.location.href = 'quiz.html';
});

//Clock

function drawHand() {
  minute+=(((2*Math.PI)/3)/60);
  ctx.beginPath();
  ctx.lineWidth = radius*0.035;
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
  //ctx.arc(0, 0, radius*0.009, 0, 2*Math.PI);
  //ctx.fillStyle = '#333';
  //ctx.fill();
  
}

function drawNumbers(ctx, radius) {
  var ang = 0;
  // ctx.font = radius*0.15 + "px arial";
  // ctx.textBaseline="middle";
  // ctx.textAlign="center";
  for(num = 1; num < qVar.questions.length+1; num++){
    ang += (2*Math.PI / qVar.questions.length);
    ctx.rotate(ang);
    ctx.translate(0, -radius*0.85);
    //ctx.rotate(-ang);
    ctx.moveTo(0,0);
    ctx.lineTo(2,0);
    ctx.stroke();
    //ctx.rotate(ang);
    ctx.translate(0, radius*0.85);
    ctx.rotate(-ang);
  }
}