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
    initialQ: "Write one sentence supporting AI library cameras for 'Research on Productivity' from the University’s perspective.",
    aiStepByStep: ["Stakeholder: University.", "Goal: Data-driven optimization.", "Result: AI cameras allow the university to gather objective data to enhance institutional productivity."],
    updateQ: "SITUATION UPDATE: Research is now banned. Cameras are for 'Security' only. Write a sentence from the STUDENT'S perspective supporting this new rule."
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
  const [phase, setPhase] = useState('selection'); 
  const [currentTask, setCurrentTask] = useState(0);
  const [results, setResults] = useState([]);
  const [inputText, setInputText] = useState('');
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const urlGroup = params.get('group');
  if (urlGroup === 'A' || urlGroup === 'B') {
    setGroup(urlGroup);
  }
}, []);

  // Auto-detect group from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlGroup = params.get('group')?.toUpperCase();
    if (urlGroup === 'A' || urlGroup === 'B') {
      setGroup(urlGroup);
      setPhase('consent'); 
    }
  }, []);

  const handleConsent = () => {
    setPhase('initial'); 
  };

  const goToUpdate = () => {
    setPhase('update');
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
    const url = `https://docs.google.com/forms/d/e/${formID}/formResponse?${fields.id}=${pID}&${fields.t1}=${encodeURIComponent(finalResults[0])}&${fields.t2}=${encodeURIComponent(finalResults[1])}&${fields.t3}=${encodeURIComponent(finalResults[2])}&${fields.t4}=${encodeURIComponent(finalResults[3])}&submit=Submit`;
    const iframe = document.createElement('iframe');
    iframe.src = url; iframe.style.display = 'none';
    document.body.appendChild(iframe);
  };

  const handleSubmit = () => {
    clearInterval(timerRef.current);
    const summary = `${timer}s | ${inputText}`;
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

  // SCREEN: Selection
  if (phase === 'selection' && !group) {
    return (
      <div style={fullPageCenter}>
        <div style={cardStyle}>
          <h1 style={{ color: '#1a1a1a', marginBottom: '10px' }}>Cognitive Flexibility Study</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>Select your assigned group to begin the assessment</p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button onClick={() => { setGroup('A'); setPhase('consent'); }} style={startBtnStyle}>Group A</button>
            <button onClick={() => { setGroup('B'); setPhase('consent'); }} style={startBtnStyle}>Group B</button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN: Consent
  if (phase === 'consent') {
    return (
      <div style={fullPageCenter}>
        <div style={{ ...cardStyle, maxWidth: '600px', textAlign: 'left' }}>
          <h2 style={{ borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>Instructions & Consent</h2>
          <div style={{ margin: '20px 0', fontSize: '15px', lineHeight: '1.6', color: '#444' }}>
            <strong>How it works:</strong>
            <ul style={{ paddingLeft: '20px' }}>
              <li>You will face 4 cognitive tasks.</li>
              <li>Each task has an <strong>Initial Scenario</strong> and an <strong>Update</strong>.</li>
              <li>Once you click "Proceed to Challenge", a timer will start.</li>
              <li>Please provide your answer as accurately and quickly as possible.</li>
            </ul>
            <strong>Consent:</strong>
            <p>By clicking the button below, you agree that your participation is voluntary and anonymous.</p>
          </div>
          <button onClick={handleConsent} style={mainBtnStyle}>I Consent - Start Experiment</button>
        </div>
      </div>
    );
  }

  // SCREEN: Finished
  if (phase === 'finished') {
    return (
      <div style={fullPageCenter}>
        <div style={cardStyle}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ color: '#27ae60' }}>Participation Recorded</h1>
          <p style={{ color: '#666' }}>Thank you! Your data has been securely synced. You may now close this tab.</p>
        </div>
      </div>
    );
  }

  // SCREEN: Tasks
  const task = experimentData[currentTask];
  const progress = ((currentTask + 1) / 4) * 100;

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
          <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#2c3e50', marginTop: '15px', textAlign: 'left' }}>{task.initialQ}</p>
          
          {group === 'A' && (
            <div style={{ marginTop: '20px', background: '#f0f7ff', padding: '20px', borderRadius: '12px', border: '1px dashed #3498db', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: '#3498db' }}>
                <span style={{ fontSize: '18px' }}>🤖</span> <strong>AI Logic Sequence:</strong>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#445' }}>
                {task.aiStepByStep.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>{s}</li>)}
              </ul>
            </div>
          )}

          {phase === 'initial' && (
            <button onClick={goToUpdate} style={mainBtnStyle}>Proceed to Challenge</button>
          )}
        </div>

        {phase === 'update' && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ ...cardStyle, background: '#fff9f4', borderColor: '#ff922b', textAlign: 'left' }}>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#d9480f' }}>{task.updateQ}</p>
              <textarea 
                style={{ width: '100%', height: '100px', marginTop: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }} 
                value={inputText} 
                onChange={(e) => setInputText(e.target.value)} 
                placeholder="Enter your response..."
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
                <div style={{ color: '#ff922b', fontSize: '14px', fontWeight: '600' }}>⏱ Latency: {timer}s</div>
                <button onClick={handleSubmit} style={submitBtnStyle}>Submit Response</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- STYLES (Declared once, outside function) ---
const fullPageCenter = {
  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
  minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Inter, system-ui', padding: '20px'
};

const cardStyle = {
  background: 'white', padding: '40px', borderRadius: '16px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', width: '100%', boxSizing: 'border-box'
};

const startBtnStyle = { padding: '15px 40px', cursor: 'pointer', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' };
const mainBtnStyle = { width: '100%', marginTop: '25px', padding: '15px', cursor: 'pointer', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' };
const submitBtnStyle = { padding: '12px 30px', cursor: 'pointer', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' };
