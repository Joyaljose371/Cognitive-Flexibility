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
  const timerRef = useRef(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlGroup = params.get('group')?.toUpperCase();
    if (urlGroup === 'A' || urlGroup === 'B') {
      setGroup(urlGroup);
    }
  }, []);

  const startExperiment = (g) => { 
    setGroup(g); 
    setPhase('initial'); 
  };

  const goToUpdate = () => {
    // Save Group B's initial answer before clearing
    const initialNote = group === 'B' ? `B-Init: ${inputText}` : `A-ViewedAI`;
    setResults(prev => [...prev, initialNote]);
    
    setPhase('update');
    setInputText('');
    setTimer(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setTimer(((Date.now() - start) / 1000).toFixed(2));
    }, 100);
  };

  const sendToGoogle = (finalResults) => {
    const formID = "1FAIpQLSdxHo29TnDPuTUW-_Ah8JJp10Gux2a5Tp_uFuzf74q3jNBRNw";
    const fields = {
      id: "entry.525021555",
      t1: "entry.651143595",
      t2: "entry.312742935",
      t3: "entry.719538924",
      t4: "entry.1641818878"
    };
    const pID = `Grp-${group}-${Math.floor(Math.random() * 10000)}`;
    
    // We send the 'Update' results (indexes 1, 3, 5, 7 in the array)
    const url = `https://docs.google.com/forms/d/e/${formID}/formResponse?${fields.id}=${pID}&${fields.t1}=${encodeURIComponent(finalResults[1])}&${fields.t2}=${encodeURIComponent(finalResults[3])}&${fields.t3}=${encodeURIComponent(finalResults[5])}&${fields.t4}=${encodeURIComponent(finalResults[7])}&submit=Submit`;
    
    const iframe = document.createElement('iframe');
    iframe.src = url; iframe.style.display = 'none';
    document.body.appendChild(iframe);
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

  // --- STYLES ---
  const cardStyle = {
    background: 'white', padding: '30px', borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eaeaea'
  };

  if (!group) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, system-ui' }}>
        <h1 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Cognitive Flexibility Study</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>Select your assigned group to begin the assessment</p>
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
        <h1 style={{ color: '#27ae60' }}>Participation Recorded</h1>
        <p style={{ color: '#666', maxWidth: '400px' }}>Thank you! Your data has been securely synced to our research database. You may now close this tab.</p>
      </div>
    );
  }

  const task = experimentData[currentTask];
  const progress = ((currentTask + 1) / 4) * 100;

  return (
    <div style={{ backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: 'Inter, system-ui', padding: '40px 20px' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Progress Bar */}
        <div style={{ height: '6px', background: '#eee', borderRadius: '10px', marginBottom: '40px', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: '#3498db', transition: 'width 0.5s ease' }} />
        </div>

        <div style={cardStyle}>
          <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', color: '#3498db', letterSpacing: '1px' }}>
            Task {currentTask + 1} of 4 • {task.title}
          </span>
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#2c3e50', marginTop: '15px' }}>{task.initialQ}</p>
          
          {group === 'A' && (
            <div style={{ marginTop: '20px', background: '#f0f7ff', padding: '20px', borderRadius: '12px', border: '1px dashed #3498db' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#3498db' }}>
                <span style={{ fontSize: '18px' }}>🤖</span> <strong>AI Logic Sequence:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#445' }}>
                {task.aiStepByStep.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>{s}</li>)}
              </ul>
            </div>
          )}

          {phase === 'initial' && (
            <div style={{ marginTop: '20px' }}>
              {group === 'B' && (
                <textarea 
                  style={textAreaStyle} 
                  value={inputText} 
                  onChange={(e) => setInputText(e.target.value)} 
                  placeholder="Provide your initial response..."
                />
              )}
              <button onClick={goToUpdate} style={mainBtnStyle}>
                {group === 'B' ? "Submit Answer & See Update" : "Proceed to Challenge"}
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
                  {task.options.map((opt, i) => (
                    <button key={i} onClick={() => handleSubmit(opt)} style={optionBtnStyle}>{opt}</button>
                  ))}
                </div>
              ) : (
                <>
                  <textarea 
                    style={textAreaStyle} 
                    value={inputText} 
                    onChange={(e) => setInputText(e.target.value)} 
                    placeholder="Enter your response based on the update..."
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                    <div style={{ color: '#ff922b', fontSize: '14px', fontWeight: '600' }}>⏱ Latency: {timer}s</div>
                    <button onClick={() => handleSubmit()} style={submitBtnStyle}>Submit Response</button>
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

// --- BUTTON & TEXTAREA STYLES ---
const startBtnStyle = { padding: '15px 40px', cursor: 'pointer', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' };
const mainBtnStyle = { width: '100%', marginTop: '25px', padding: '15px', cursor: 'pointer', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' };
const submitBtnStyle = { padding: '12px 30px', cursor: 'pointer', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' };
const optionBtnStyle = { padding: '15px', textAlign: 'left', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '15px', transition: 'background 0.2s' };
const textAreaStyle = { width: '100%', height: '100px', marginTop: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };