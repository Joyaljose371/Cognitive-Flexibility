import React, { useState, useRef, useMemo } from 'react';

const experimentData = [
  {
    id: 1,
    title: "Movement Logic",
    initialQ: "A train travels at a constant speed of 60 km/h. How many minutes does it take to travel 10 kilometers?",
    aiStepByStep: [
      "💡 Hint: Convert speed to minutes. 60 km/h means the train covers 1 km every 1 minute.",
      "🤖 Logic: To cover 10 km at a rate of 1 km per minute, it takes exactly 10 minutes.",
      "Result: 10 minutes."
    ],
    updateQ: "SITUATION UPDATE: The train must now slow down to 30 km/h for the last 5 kilometers of that 10 km trip. Recalculate the total time for the full 10 km."
  },
  {
    id: 2,
    title: "Perspective Switching",
    initialQ: "The University is using AI cameras to track 'Study Habits' to improve library efficiency. Provide 3 keywords that justify this from the University's perspective.",
    aiStepByStep: [
      "💡 Hint: Think about how an administrator uses data to manage space, costs, and resources.",
      "🤖 Logic: Use terms like 'Resource Optimization' (better seating), 'Operational Efficiency' (staffing), and 'Analytics' (usage trends).",
      "Keywords: Optimization, Data-driven, Efficiency"
    ],
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
    initialQ: "A farmer must move a fox, a chicken, and a bag of grain across a river. The boat only carries the farmer and ONE item. Alone: Fox eats Chicken, or Chicken eats Grain. What is the minimum crossings?",
    aiStepByStep: [
      "💡 Hint: You must take the Chicken first to prevent any eating, then use 'return trips' to swap items safely.",
      "🤖 Logic: 1. Chicken over, 2. Return empty, 3. Fox over, 4. Chicken back (crucial!), 5. Grain over, 6. Return empty, 7. Chicken over.",
      "Result: 7 crossings."
    ],
    updateQ: "SITUATION UPDATE: A raft is found that allows the grain to be left floating separately. Recalculate minimum crossings."
  },
  {
    id: 4,
    title: "Financial Pivot",
    initialQ: "₹1,00,000 is moved from a bank account earning 4% annual interest to a digital wallet earning 0%. How much potential profit is lost in one year by making this move?",
    aiStepByStep: [
      "💡 Hint: This 'lost profit' is the money you would have earned if you left the funds in the bank instead of the wallet.",
      "🤖 Logic: Calculate 4% of 1,00,000. The bank would have paid you 4,000, while the wallet pays 0.",
      "Result: ₹4,000 lost profit."
    ],
    updateQ: "SITUATION UPDATE: The digital wallet now offers a special cashback of ₹500 for every ₹10,000 held in it. Which is now more profitable: the Bank (4% interest) or the Wallet (Cashback)?"
  }
];

export default function ExperimentApp() {
  const [step, setStep] = useState('landing');
  const [group, setGroup] = useState(null);
  const [currentTask, setCurrentTask] = useState(0);
  const [phase, setPhase] = useState('initial');
  const [results, setResults] = useState([]);
  const [inputText, setInputText] = useState('');
  const [timer, setTimer] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const timerRef = useRef(null);

  // Generates the ID once and remembers it for the whole session
  const pIDValue = useMemo(() => `User-${Math.floor(Math.random() * 90000) + 10000}`, []);

  const startExperiment = (g) => {
    setGroup(g);
    setStep('survey');
  };

  const goToUpdate = () => {
    let mode = group === 'A'
      ? (showHint && showAnswer ? "Both" : showAnswer ? "Logic" : "Hint")
      : `Manual: ${inputText.replace(/\|/g, ';')}`;

    setResults(prev => [...prev, { mode }]);
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

  const handleUpdateSubmit = (choiceValue = null) => {
    clearInterval(timerRef.current);
    if (choiceValue) setInputText(choiceValue);
    setPhase('confidence');
  };

  const handleConfidenceSubmit = (confScore) => {
    const currentResults = [...results];
    const currentIndex = currentResults.length - 1;

    currentResults[currentIndex] = {
      ...currentResults[currentIndex],
      time: timer,
      answer: (inputText || "").replace(/\|/g, ';'),
      confidence: confScore
    };

    setResults(currentResults);
    setInputText('');

    if (currentTask < experimentData.length - 1) {
      setCurrentTask(currentTask + 1);
      setPhase('initial');
    } else {
      sendToGoogle(currentResults);
      setStep('finished');
    }
  };

  const sendToGoogle = (finalData) => {
    const formID = "1FAIpQLSdxHo29TnDPuTUW-_Ah8JJp10Gux2a5Tp_uFuzf74q3jNBRNw";
    const fields = {
      pID: "entry.525021555",
      t1: { m: "entry.651143595", t: "entry.312742935", a: "entry.719538924", c: "entry.1641818878" },
      t2: { m: "entry.963073410", t: "entry.772162158", a: "entry.1009011268", c: "entry.1726924177" },
      t3: { m: "entry.1995615539", t: "entry.1409764106", a: "entry.1004505213", c: "entry.731737617" },
      t4: { m: "entry.1026101836", t: "entry.71733623", a: "entry.767400298", c: "entry.1169791376" }
    };

    // Use the persistent pID with the group prefix
    const finalID = `Grp-${group}-${pIDValue}`;
    let url = `https://docs.google.com/forms/d/e/${formID}/formResponse?${fields.pID}=${finalID}`;

    finalData.forEach((task, i) => {
      const key = `t${i + 1}`;
      url += `&${fields[key].m}=${encodeURIComponent(task.mode)}` +
             `&${fields[key].t}=${encodeURIComponent(task.time)}` +
             `&${fields[key].a}=${encodeURIComponent(task.answer)}` +
             `&${fields[key].c}=${encodeURIComponent(task.confidence)}`;
    });

    const iframe = document.createElement('iframe');
    iframe.title = "Data Submit";
    iframe.src = url + "&submit=Submit";
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  };

  if (step === 'landing') {
    return (
      <div style={layoutWrapper}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <h1 style={{ color: '#1a1a1a', marginBottom: '20px' }}>Cognitive Flexibility Study</h1>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button onClick={() => startExperiment('A')} style={startBtnStyle}>Group A</button>
            <button onClick={() => startExperiment('B')} style={{ ...startBtnStyle, background: '#34495e' }}>Group B</button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'survey') {
    // Construct the Pre-filled URL for your survey form
    const surveyUrl = `https://docs.google.com/forms/d/e/1FAIpQLSfy5CIWCy5XN53CXhj3Rf64XaHmcFCe9ddeZKP5OST_GtNgIg/viewform?usp=pp_url&entry.1589615168=${pIDValue}&embedded=true`;

    return (
      <div style={layoutWrapper}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Pre-Task Assessment</h2>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
            Please complete the AAIUS and Cognitive Flexibility scales below.
            <strong> Your Participant ID ({pIDValue}) has been automatically entered.</strong>
          </p>
          <div style={{ width: '100%', height: '600px', overflow: 'hidden', borderRadius: '8px', border: '1px solid #eee' }}>
            <iframe
              title="AAIUS and CF Scales"
              src={surveyUrl}
              width="100%" height="600" frameBorder="0" marginHeight="0" marginWidth="0"
            >Loading…</iframe>
          </div>
          <button onClick={() => setStep('consent')} style={mainBtnStyle}>
            I have submitted the form & am ready to start →
          </button>
        </div>
      </div>
    );
  }

  if (step === 'consent') {
    return (
      <div style={layoutWrapper}>
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Informed Consent Form</h2>
          <div style={consentScrollBox}>
            <p><strong>Project Title:</strong> AI Reliance & Cognitive Adaptation.</p>
            <hr />
            <p><strong>1. Purpose:</strong> Study investigating digital tools and problem-solving.</p>
            <p><strong>2. Procedures:</strong> 4 logic tasks with rule changes. ~10 mins.</p>
            <p><strong>3. Privacy:</strong> Data is fully anonymized.</p>
            <p><strong>4. Voluntary:</strong> You may exit at any time.</p>
            <hr />
            <p><em>By clicking below, you voluntarily agree to participate.</em></p>
          </div>
          <button onClick={() => setStep('experiment')} style={mainBtnStyle}>I Consent & Start</button>
        </div>
      </div>
    );
  }

  if (step === 'finished') {
    return (
      <div style={layoutWrapper}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>✅</div>
          <h1>Participation Recorded</h1>
          <p>Thank you for your contribution to this study.</p>
        </div>
      </div>
    );
  }

  const task = experimentData[currentTask];
  const progress = ((currentTask + 1) / 4) * 100;

  return (
    <div style={layoutWrapper}>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <div style={progressContainer}><div style={{ ...progressBar, width: `${progress}%` }} /></div>
        <div style={cardStyle}>
          <span style={taskLabel}>Task {currentTask + 1} of 4 • {task.title}</span>

          {phase === 'initial' && (
            <div style={{ marginTop: '15px' }}>
              <p style={questionText}>{task.initialQ}</p>
              {group === 'A' ? (
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => setShowHint(true)} style={smallBtnStyle}>💡 Show AI Hint</button>
                    <button onClick={() => setShowAnswer(true)} style={{ ...smallBtnStyle, background: '#f3f0ff', color: '#6741d9' }}>🤖 Show AI Answer</button>
                  </div>
                  {showHint && (
                    <div style={aiBoxStyle}>
                      <strong>💡 AI Hint:</strong>
                      <p style={{ margin: '5px 0 0 0' }}>{task.aiStepByStep[0]}</p>
                    </div>
                  )}
                  {showAnswer && (
                    <div style={{ ...aiBoxStyle, borderColor: '#6741d9', background: '#f8f7ff' }}>
                      <strong>🤖 AI Answer & Logic:</strong>
                      <div style={{ margin: '5px 0 0 0' }}>
                        {task.aiStepByStep.slice(1).map((s, i) => (
                          <p key={i} style={{ marginBottom: '5px' }}>{s}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <button onClick={goToUpdate} disabled={!(showHint || showAnswer)} style={mainBtnStyle}>Proceed to Challenge</button>
                </div>
              ) : (
                <>
                  <textarea style={textAreaStyle} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Provide your response..." />
                  <button onClick={goToUpdate} disabled={!inputText.trim()} style={mainBtnStyle}>Submit & See Update</button>
                </>
              )}
            </div>
          )}

          {phase === 'update' && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ ...cardStyle, background: '#fff9f4', borderColor: '#ff922b', boxShadow: 'none' }}>
                <p style={{ fontSize: '18px', fontWeight: '600', color: '#d9480f' }}>{task.updateQ}</p>
                {task.options ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    {task.options.map((opt, i) => <button key={i} onClick={() => handleUpdateSubmit(opt)} style={optionBtnStyle}>{opt}</button>)}
                  </div>
                ) : (
                  <>
                    <textarea style={textAreaStyle} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Your update response..." />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                      <div style={{ color: '#ff922b', fontSize: '14px', fontWeight: '600' }}>⏱ Latency: {timer}s</div>
                      <button onClick={() => handleUpdateSubmit()} disabled={!inputText.trim()} style={submitBtnStyle}>Submit Response</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {phase === 'confidence' && (
            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <h3 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '5px' }}>Confidence Rating</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
                How certain are you that your answer to the <strong>Situation Update</strong> is correct?
                (1 = Not at all, 5 = Completely certain)
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                {[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => handleConfidenceSubmit(n)} style={confBtn}>{n}</button>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const layoutWrapper = { backgroundColor: '#fdfdfd', minHeight: '100vh', fontFamily: 'Inter, system-ui', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' };
const cardStyle = { background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', width: '100%', maxWidth: '700px', boxSizing: 'border-box' };
const taskLabel = { textTransform: 'uppercase', fontSize: '12px', fontWeight: 'bold', color: '#3498db', letterSpacing: '1px' };
const questionText = { fontSize: '18px', lineHeight: '1.6', color: '#2c3e50', marginTop: '15px' };
const startBtnStyle = { padding: '15px 40px', cursor: 'pointer', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' };
const mainBtnStyle = { width: '100%', marginTop: '25px', padding: '15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' };
const smallBtnStyle = { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', background: '#e7f5ff', color: '#1971c2' };
const aiBoxStyle = { marginTop: '15px', background: '#f0f7ff', padding: '15px', borderRadius: '12px', border: '1px dashed #3498db', fontSize: '14px' };
const textAreaStyle = { width: '100%', height: '100px', marginTop: '15px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' };
const progressContainer = { height: '6px', background: '#eee', borderRadius: '10px', marginBottom: '40px', overflow: 'hidden', width: '100%' };
const progressBar = { height: '100%', background: '#3498db', transition: 'width 0.5s ease' };
const submitBtnStyle = { padding: '12px 30px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' };
const confBtn = { width: '50px', height: '50px', borderRadius: '50%', border: '2px solid #3498db', cursor: 'pointer', background: 'white', color: '#3498db', fontWeight: 'bold', fontSize: '16px' };
const optionBtnStyle = { padding: '15px', textAlign: 'left', background: 'white', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '15px' };
const consentScrollBox = { height: '200px', overflowY: 'auto', background: '#fcfcfc', padding: '15px', border: '1px solid #eee', borderRadius: '8px', fontSize: '14px', margin: '15px 0', lineHeight: '1.5' };