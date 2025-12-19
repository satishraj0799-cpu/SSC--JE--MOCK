let subject = localStorage.getItem("subject");
let year = localStorage.getItem("year");
let mode = localStorage.getItem("mode");
let questions = [];
let time = 600;

document.getElementById("title")?.innerText = 
  mode === "full" ? "SSC JE Civil – Full Mock Test" : `SSC JE Civil – ${subject?.toUpperCase()} (${year})`;

async function loadAllData(){
  let allQuestions = [];

  if(mode === "full"){
    const subjects = ["rcc","steel","soil","surveying","hydraulics","env","transportation","mechanics"];
    for(let sub of subjects){
      let data = await fetch(`data/${sub}.json`).then(r=>r.json());
      allQuestions = allQuestions.concat(data);
    }
    questions = allQuestions.sort(()=>0.5-Math.random()).slice(0,200);
    time = 7200; // 2 hours
  } else {
    let data = await fetch(`data/${subject}.json`).then(r=>r.json());
    questions = data.filter(q=>q.year===year);
    time = questions.length * 30; // 30 sec per question
  }
  loadQuestions();
}

function loadQuestions(){
  let quiz = document.getElementById("quiz");
  quiz.innerHTML = "";
  questions.forEach((q,i)=>{
    quiz.innerHTML += `
      <p><b>Q${i+1}. ${q.question}</b></p>
      ${q.options.map((opt,idx)=>`
        <label>
          <input type="radio" name="q${i}" value="${idx}"> ${opt}
        </label><br>`).join("")}
      <hr>
    `;
  });
}

if(document.getElementById("quiz")) loadAllData();

let timer = setInterval(()=>{
  let m = Math.floor(time/60);
  let s = time%60;
  document.getElementById("timer").innerText = `Time: ${m}:${s<10?"0":""}${s}`;
  time--;
  if(time<0) submitTest();
},1000);

function submitTest(){
  clearInterval(timer);
  let score = 0;
  let answers = [];
  questions.forEach((q,i)=>{
    let sel = document.querySelector(`input[name="q${i}"]:checked`);
    let ans = sel?Number(sel.value):-1;
    answers.push(ans);
    if(ans===q.correct) score++;
    else if(ans!==-1) score-=0.25; // negative marking
  });
  localStorage.setItem("questions",JSON.stringify(questions));
  localStorage.setItem("answers",JSON.stringify(answers));
  localStorage.setItem("score",score.toFixed(2));
  window.location.href="result.html";
}
