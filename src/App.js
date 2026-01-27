import React, { useState, useEffect, useRef } from 'react';

const experimentData = [
  {
    id: 1,
    title: "Numerical Reasoning",
    initialQ: "A used book costs ₹100, which includes a 10% tax. What is the base price before tax?",
    aiStepByStep: ["Total (₹100) = Base (100%) + Tax (10%).", "Ratio: 110% = 100, so Base = 100 / 1.10.", "Result: ₹90.91"],
    updateQ: "SITUATION UPDATE: A 10% student discount is applied to the BASE price (₹90.91) first, then the 10% tax is added back. What is the final price?"
  },
  {
    id: 2,
    title: "Perspective Switching",
    initialQ: "The University is using AI cameras to track 'Study Habits' to improve library efficiency. Provide 3 keywords that justify this from the University's perspective.",
    aiStepByStep: ["Optimization", "Data-driven", "Efficiency"],
    updateQ: "UPDATE: Due to privacy concerns, cameras are now only for 'Security' (theft prevention). Which choice best represents a Student's balanced view?",
    options: [
      "I support theft prevention but demand privacy protection.",
      "The university should use cameras to track my study habits.",
      "Cameras are unnecessary for security.",
      "I prefer the efficiency tracking over security."
    ]
  },
  {
    id: 3,
    title: "Logic Adaptation",
    initialQ: "Solve the fox–chicken–grain river crossing problem. Find the minimum crossings.",
    aiStepByStep: ["Chicken first (1), return (2).", "Grain across (3), Chicken back (4).", "Fox across (5), return (6).", "Chicken across (7). Result: 7."],
    updateQ: "SITUATION UPDATE: A raft is found that allows the grain to be left floating separately. Recalculate minimum crossings."
  },
  {
    id: 4,
    title: "Financial Pivot",
    initialQ: "₹1,00,000 moved to a 0% wallet from a 4% bank account. Calculate the annual opportunity cost.",
    aiStepByStep: ["Interest: 1,00,000 * 4% = 4,000.", "Bank (4,000) vs Wallet (0).", "Result: ₹4,000 loss."],
    updateQ: "SITUATION UPDATE: The wallet now offers ₹500 cashback per ₹10,000 held. Which is more profitable: Bank (4% interest) or Wallet (Cashback)?"
  }
];

export default function ExperimentApp() {
  const [group, setGroup] = useState(null);
  const [currentTask, setCurrentTask] = useState(0);
  const [phase, setPhase] = useState('initial');
  const [results, setResults] = useState([]);
  const [inputText, setInputText] = useState('');
  const [timer, setTimer] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlGroup = params.get('group')?.toUpperCase();
    if (urlGroup === 'A' || urlGroup === 'B') setGroup(urlGroup);
  }, []);

  const startExperiment = (g) => { setGroup(g); setPhase('initial'); };

  const goToUpdate = () => {
    let firstPartData = "";
    if (group === 'A') {
      if (showHint && showAnswer) firstPartData = "Both Hint & Answer";
      else if (showAnswer) firstPartData = "AI Answer Only";
      else if (showHint) firstPartData = "AI Hint Only";
    } else {
      firstPartData = `Manual: ${inputText}`;
    }
    
    setResults(prev => [...prev, firstPartData]);
    setPhase('update');
    setInputText('');
    setShowHint(false);
    setShowAnswer(false);
    
    setTimer(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setTimer(((Date.now() - start) / 1000).toFixed(2));
    }, 100);
  };

  const handleSubmit = (choiceValue = null) => {
    clearInterval(timerRef.current);
    const finalAnswer = choiceValue || inputText;
    const summary = `${timer}s | ${finalAnswer}`;
    const updatedResults = [...results, summary];
    setResults(updatedResults);
    setInputText('');

    if (currentTask < experimentData.length - 1) {
      setCurrentTask(currentTask + 1);
      setPhase('initial');
    } else {
      sendToGoogle(updatedResults);
      setPhase('finished');
    }
  };

  const sendToGoogle = (finalResults) => {
    const formID = "1FAIpQLSdxHo29TnDPuTUW-_Ah8JJp10Gux2a5Tp_uFuzf74q3jNBRNw";
    const fields = { id: "entry.525021555", t1: "entry.651143595", t2: "entry.312742935", t3: "entry.719538924", t4: "entry.1641818878" };
    const pID = `Grp-${group}-${Math.floor(Math.random() * 10000)}`;
    
    const task1 = `${finalResults[0]} || ${finalResults[1]}`;
    const task2 = `${finalResults[2]} || ${finalResults[3]}`;
    const task3 = `${finalResults[4]} || ${finalResults[5]}`;
    const task4 = `${finalResults[6]} || ${finalResults[7]}`;

    const url = `https://docs.google.com/forms/d/e/${formID}/formResponse?${fields.id}=${pID}&${fields.t1}=${encodeURIComponent(task1)}&${fields.t2}=${encodeURIComponent(task2)}&${fields.t3}=${encodeURIComponent(task3)}&${fields.t4}=${encodeURIComponent(task4)}&submit=Submit`;
    
    const iframe = document.createElement('iframe');
    iframe.src = url; iframe.style.display = 'none';
    document.body.appendChild(iframe);
  };

  if (!group) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, system-ui' }}>
        <h1 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Cognitive Flexibility Study</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => startExperiment('A')} style={startBtnStyle}>Group A</button>
          <button onClick={() => startExperiment('B')} style={startBtnStyle}>Group B</button>
        </div>
      </div>
    );
  }

  if (phase === 'finished') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
        <h1>Participation Recorded</h1>
      </div>
    );
  }

  const task = experimentData[currentTask];
  const progress = ((currentTask + 1) / 4) * 100;

  // Validation Logic
  const canProceedInitial = group === 'A' ? (showHint || showAnswer) : inputText.trim().length > 0;
  const canSubmitUpdate = task.options ? true : inputText.trim().length > 0;

  return (
    <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: 'Inter, system-ui', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ height: '6px', background: '#eee', borderRadius: '10px', marginBottom: '40px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3498db', transition: 'width 0.5s ease' }} />
        </div>

        <div style={cardStyle}>
          <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', color: '#3498db', letterSpacing: '1px' }}>
            Task {currentTask + 1} of 4 • {task.title}
          </span>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#2c3e50', marginTop: '15px' }}>{task.initialQ}</p>
          
          {group === 'A' && phase === 'initial' && (
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowHint(true)} style={{...smallBtnStyle, background: '#e7f5ff', color: '#1971c2'}}>💡 Show AI Hint</button>
                <button onClick={() => setShowAnswer(true)} style={{...smallBtnStyle, background: '#f3f0ff', color: '#6741d9'}}>🤖 Show AI Answer</button>
              </div>
              {showHint && <div style={aiBoxStyle}><strong>💡 Hint:</strong> {task.aiStepByStep[0]}</div>}
              {showAnswer && (
                <div style={{...aiBoxStyle, borderColor: '#6741d9', background: '#f8f7ff'}}>
                  <strong>🤖 AI Answer:</strong>
                  <ul style={{ margin: '5px 0 0 20px' }}>{task.aiStepByStep.map((s, i) => <li key={i}>{s}</li>)}</ul>
                </div>
              )}
            </div>
          )}

          {phase === 'initial' && (
            <div style={{ marginTop: '20px' }}>
              {group === 'B' && <textarea style={textAreaStyle} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Provide your response..." />}
              <button 
                onClick={goToUpdate} 
                disabled={!canProceedInitial}
                style={{...mainBtnStyle, opacity: canProceedInitial ? 1 : 0.5, cursor: canProceedInitial ? 'pointer' : 'not-allowed'}}
              >
                {group === 'B' ? "Submit & See Update" : "Proceed to Challenge"}
              </button>
            </div>
          )}
        </div>

        {phase === 'update' && (
          <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ ...cardStyle, background: '#fff9f4', borderColor: '#ff922b' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#d9480f' }}>{task.updateQ}</p>
              {task.options ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                  {task.options.map((opt, i) => <button key={i} onClick={() => handleSubmit(opt)} style={optionBtnStyle}>{opt}</button>)}
                </div>
              ) : (
                <>
                  <textarea style={textAreaStyle} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Your update response..." />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <div style={{ color: '#ff922b', fontSize: '14px', fontWeight: '600' }}>⏱ Latency: {timer}s</div>
                    <button 
                        onClick={() => handleSubmit()} 
                        disabled={!canSubmitUpdate}
                        style={{...submitBtnStyle, opacity: canSubmitUpdate ? 1 : 0.5, cursor: canSubmitUpdate ? 'pointer' : 'not-allowed'}}
                    >
                        Submit Response
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const cardStyle = { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' };
const aiBoxStyle = { marginTop: '15px', background: '#f0f7ff', padding: '15px', borderRadius: '12px', border: '1px dashed #3498db', fontSize: '14px' };
const textAreaStyle = { width: '100%', height: '100px', marginTop: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
const startBtnStyle = { padding: '15px 40px', cursor: 'pointer', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' };
const mainBtnStyle = { width: '100%', marginTop: '25px', padding: '15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', transition: '0.3s' };
const submitBtnStyle = { padding: '12px 30px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', transition: '0.3s' };
const optionBtnStyle = { padding: '15px', textAlign: 'left', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' };
const smallBtnStyle = { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' };