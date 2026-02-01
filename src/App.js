import React, { useState, useRef, useMemo } from 'react';

/**
 * EXPERIMENT CONTENT DATA
 */
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
    initialQ: "The University uses AI cameras for 'Library Efficiency'. Provide 3 keywords that justify this from the University's perspective.",
    aiStepByStep: [
      "💡 Hint: Focus on space management and resource utilization.",
      "🤖 Logic: Use terms like 'Optimization', 'Resource-Mapping', and 'Utilization'.",
      "Keywords: Optimization, Analytics, Efficiency"
    ],
    updateQ: "SITUATION UPDATE: Privacy laws now ban identifying individuals. Which policy change allows the University to keep collecting data while strictly following the 'No-Identification' rule?",
    options: [
      "Switch to 'Edge-Computing' sensors that only output total headcounts",
      "Use 'Enhanced-ID' to blur faces only after the data is stored",
      "Implement 'High-Precision' tracking to ensure seat optimization",
      "Apply 'Behavioral-Sync' to match student IDs with movement patterns"
    ]
},
  {
    id: 3,
    title: "Logic Adaptation",
    initialQ: "A farmer must move a fox, a chicken, and a bag of grain across a river. Alone: Fox eats Chicken, or Chicken eats Grain. What is the minimum crossings?",
    aiStepByStep: [
      "💡 Hint: You must take the Chicken first to prevent any eating, then use return trips.",
      "🤖 Logic: 1. Chicken over, 2. Return empty, 3. Fox over, 4. Chicken back, 5. Grain over, 6. Return empty, 7. Chicken over.",
      "Result: 7 crossings."
    ],
    updateQ: "SITUATION UPDATE: You find a raft to tow the grain. The grain no longer counts as your 'one item' limit. You can carry one animal while towing the grain. Recalculate the minimum crossings."
  },
{
    id: 4,
    title: "Financial Pivot",
    initialQ: "You have ₹1,00,000. A Bank account pays 4% interest (₹4,000), while a Digital Wallet pays 0%. How much potential profit is lost if you use the Wallet?",
    aiStepByStep: [
      "💡 Hint: The lost profit is simply the 4% interest the bank would have paid.",
      "🤖 Logic: 4% of 1,00,000 = ₹4,000.",
      "Result: ₹4,000 lost profit."
    ],
    updateQ: "SITUATION UPDATE: The Digital Wallet now offers a flat ₹10,000 'Mega Bonus'. However, this is only for new deposits of ₹1,50,000 or more. Since you only have ₹1,00,000, which is now more profitable?",
    options: [
      "Bank (Fixed ₹4,000 Profit)",
      "Digital Wallet (₹10,000 Mega Bonus)"
    ]
}
];

export default function ExperimentApp() {
  // --- STATE MANAGEMENT ---
  const [step, setStep] = useState('landing');
  const [group, setGroup] = useState(null);
  const [currentTask, setCurrentTask] = useState(0); 
  const [phase, setPhase] = useState('initial');    
  const [results, setResults] = useState([]);       
  const [inputText, setInputText] = useState('');   
  const [initialAnswer, setInitialAnswer] = useState(''); 
  const [keywords, setKeywords] = useState([]);     
  const [timer, setTimer] = useState(0);            
  const [showHint, setShowHint] = useState(false);  
  const [showAnswer, setShowAnswer] = useState(false); 
  const [showRating, setShowRating] = useState(false); 
  const [relianceScore, setRelianceScore] = useState(0); 
  const timerRef = useRef(null);                    

  const pIDValue = useMemo(() => `User-${Math.floor(Math.random() * 90000) + 10000}`, []);

  // --- FULLSCREEN FUNCTIONS ---
  const enterFullScreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    else if (elem.msRequestFullscreen) elem.msRequestFullscreen();
  };

  const exitFullScreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  };

  // --- HELPER FUNCTIONS ---

  const handleAIRequest = (type) => {
    if (type === 'hint') setShowHint(true);
    if (type === 'logic') setShowAnswer(true);
    
    setTimeout(() => {
      setShowRating(true);
    }, 2000); // 2 second delay
  };

  const handleKeyUp = (e) => {
    if (currentTask === 1 && (e.key === ' ' || e.key === ',')) {
      const word = inputText.trim().replace(',', '');
      if (word.length > 0 && !keywords.includes(word)) {
        setKeywords([...keywords, word]);
      }
      setInputText('');
    }
  };

  const sendToGoogle = (finalData) => {
    const formID = "1FAIpQLSdxHo29TnDPuTUW-_Ah8JJp10Gux2a5Tp_uFuzf74q3jNBRNw";
    const fields = {
      pID: "entry.525021555",
      t1: { m: "entry.651143595", r: "entry.1733576881", t: "entry.312742935", a: "entry.719538924", au: "entry.1097051775", c: "entry.1641818878" },
      t2: { m: "entry.963073410", r: "entry.984933189", t: "entry.772162158", a: "entry.1009011268", au: "entry.880027627", c: "entry.1726924177" },
      t3: { m: "entry.1995615539", r: "entry.1503230037", t: "entry.1409764106", a: "entry.1004505213", au: "entry.402887706", c: "entry.731737617" },
      t4: { m: "entry.1026101836", r: "entry.1390260123", t: "entry.71733623", a: "entry.767400298", au: "entry.50268811", c: "entry.1169791376" }
    };

    const finalID = `Grp-${group}-${pIDValue}`;
    let url = `https://docs.google.com/forms/d/e/${formID}/formResponse?${fields.pID}=${finalID}`;

    finalData.forEach((task, i) => {
      const key = `t${i + 1}`;
      url += `&${fields[key].m}=${encodeURIComponent(task.mode)}` +
             `&${fields[key].r}=${encodeURIComponent(task.reliance || 0)}` +
             `&${fields[key].t}=${encodeURIComponent(task.time)}` +
             `&${fields[key].a}=${encodeURIComponent(task.initial)}` +
             `&${fields[key].au}=${encodeURIComponent(task.update)}` +
             `&${fields[key].c}=${encodeURIComponent(task.confidence)}`;
    });

    const iframe = document.createElement('iframe');
    iframe.src = url + "&submit=Submit";
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
  };

  const startExperiment = (g) => {
    setGroup(g);
    setStep('survey');
    enterFullScreen(); // Trigger Fullscreen
  };

  const goToUpdate = () => {
    let modeText = group === 'A'
      ? (showHint && showAnswer ? "AI-Logic" : showAnswer ? "AI-Logic" : "AI-Hint")
      : "Manual";
    
    let firstAns = group === 'A' ? modeText : (currentTask === 1 ? keywords.join(', ') : inputText);

    setInitialAnswer(firstAns);
    setPhase('update');
    setInputText('');
    setKeywords([]); 
    
    setTimer(0);
    const start = Date.now();
    timerRef.current = setInterval(() => {
      setTimer(((Date.now() - start) / 1000).toFixed(2));
    }, 100);
  };

  const handleUpdateSubmit = (choiceValue = null) => {
    clearInterval(timerRef.current);
    const finalUpdateAnswer = choiceValue || inputText;
    
    setResults(prev => [...prev, { 
      mode: group === 'A' ? (showHint && showAnswer ? "Logic" : showAnswer ? "Logic" : "Hint") : "Manual",
      reliance: relianceScore,
      initial: initialAnswer,
      update: finalUpdateAnswer,
      time: timer
    }]);

    setPhase('confidence');
  };

  const handleConfidenceSubmit = (confScore) => {
    const currentResults = [...results];
    const currentIndex = currentResults.length - 1;
    currentResults[currentIndex].confidence = confScore;

    setResults(currentResults);
    setInputText('');
    setRelianceScore(0);
    setShowHint(false);
    setShowAnswer(false);
    setShowRating(false);

    if (currentTask < experimentData.length - 1) {
      setCurrentTask(currentTask + 1);
      setPhase('initial');
    } else {
      sendToGoogle(currentResults);
      setStep('finished');
      exitFullScreen(); // Exit Fullscreen at final submit
    }
  };

  // --- COMPONENT VIEWS ---

  if (step === 'landing') return (
    <div style={layoutWrapper}>
      <div style={cardStyle}>
        <h1 style={titleStyle}>The Impact of AI on Cognitive Flexibility</h1>
        <p style={descriptionStyle}>
          This research project examines how humans adapt to changing rules when assisted by automated logic. 
          The study involves 4 logical tasks and takes approximately 10 minutes.
        </p>
        <div style={{display:'flex', gap:'20px', justifyContent:'center'}}>
          <button onClick={() => startExperiment('A')} style={startBtnStyle}>Group A</button>
          <button onClick={() => startExperiment('B')} style={{...startBtnStyle, background:'#34495e'}}>Group B</button>
        </div>
      </div>
    </div>
  );

  if (step === 'survey') return (
    <div style={layoutWrapper}>
      <div style={cardStyle}>
        <h2 style={{marginTop:0}}>Pre-Task Assessment</h2>
        <div style={infoBox}>
            📍 <strong>Your Participant ID:</strong> <span style={{color: '#e67e22'}}>{pIDValue}</span>
        </div>
        <p style={{fontSize: '14px', marginBottom: '15px'}}>Please fill out this background survey. After submitting, click the button below.</p>
        <iframe title="Survey" src={`https://docs.google.com/forms/d/e/1FAIpQLSfy5CIWCy5XN53CXhj3Rf64XaHmcFCe9ddeZKP5OST_GtNgIg/viewform?usp=pp_url&entry.1589615168=${pIDValue}&embedded=true`} width="100%" height="450" frameBorder="0"></iframe>
        <button onClick={() => setStep('consent')} style={mainBtnStyle}>Survey Submitted → Continue</button>
      </div>
    </div>
  );

  if (step === 'consent') return (
    <div style={layoutWrapper}>
      <div style={cardStyle}>
        <h2 style={{marginTop:0}}>Informed Consent & Instructions</h2>
        <div style={consentScrollBox}>
          <strong>PURPOSE:</strong> Research on human-AI collaboration and cognitive adaptability.<br/><br/>
          <strong>PROCEDURE:</strong> You will solve an initial problem, followed by a situation update where rules change. You must solve the update as quickly as possible.<br/><br/>
          <strong>DATA & PRIVACY:</strong> All data is anonymous. We track response accuracy and time taken (latency). Your IP address is not recorded.<br/><br/>
          <strong>RIGHT TO WITHDRAW:</strong> You may stop the study at any time by closing your browser tab.<br/><br/>
          <strong>INSTRUCTIONS:</strong> Focus on accuracy for the first part. Focus on <strong>speed and accuracy</strong> for the second part (Situation Update).
        </div>
        <button onClick={() => setStep('experiment')} style={mainBtnStyle}>I Consent & Start Experiment</button>
      </div>
    </div>
  );

  if (step === 'finished') return (
    <div style={layoutWrapper}>
      <div style={cardStyle}>
        <h1 style={{textAlign:'center'}}>✅ Study Complete</h1>
        <div style={{...infoBox, background: '#f8f9fa', border: '1px solid #eee', margin: '20px 0'}}>
            <strong>Your Participant ID:</strong> <span style={{color: '#e67e22'}}>{pIDValue}</span>
        </div>
        <p style={{textAlign:'center'}}>Your data has been securely submitted. Thank you for your participation.</p>
      </div>
    </div>
  );

  const task = experimentData[currentTask];

  return (
    <div style={layoutWrapper}>
      <div style={{ width: '100%', maxWidth: '700px' }}>
        <div style={cardStyle}>
          <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
            <span style={taskLabel}>TASK {currentTask + 1} / 4</span>
            <span style={taskLabel}>{task.title}</span>
          </div>

          {phase === 'initial' && (
            <div>
              <p style={questionText}>{task.initialQ}</p>
              {group === 'A' ? (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', gap: '10px', marginBottom:'15px' }}>
                    <button onClick={() => handleAIRequest('hint')} style={smallBtnStyle}>💡 Request AI Hint</button>
                    <button onClick={() => handleAIRequest('logic')} style={{ ...smallBtnStyle, background: '#f3f0ff', color: '#6741d9' }}>🤖 Request AI Logic</button>
                  </div>
                  {showHint && <div style={aiBoxStyle}><strong>AI Hint:</strong> {task.aiStepByStep[0]}</div>}
                  {showAnswer && <div style={aiBoxStyle}><strong>AI Logic:</strong> {task.aiStepByStep.slice(1).join(' ')}</div>}
                  
                  {showRating && (
                    <div style={relianceBox}>
                      <p style={{fontWeight:'bold', marginBottom:'10px'}}>How much did you rely on the AI's logic for this answer?</p>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                        {[1, 2, 3, 4, 5].map(n => (
                          <div key={n} style={{textAlign:'center'}}>
                            <button onClick={() => setRelianceScore(n)} style={{...confBtn, background: relianceScore === n ? '#3498db' : 'white', color: relianceScore === n ? 'white' : '#3498db'}}>{n}</button>
                            <div style={{fontSize:'9px', marginTop:'4px'}}>{n===1 ? 'None' : n===5 ? 'Fully' : ''}</div>
                          </div>
                        ))}
                      </div>
                      <button onClick={goToUpdate} disabled={relianceScore === 0} style={{...mainBtnStyle, marginTop: '20px'}}>Unlock Situation Update</button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{marginTop:'15px'}}>
                   {currentTask === 1 && (
                    <div style={{display:'flex', flexWrap:'wrap', gap:'5px', marginBottom:'10px'}}>
                      {keywords.map((kw, i) => <span key={i} style={{...taskLabel, background:'#3498db', color:'white', padding:'4px 10px', borderRadius:'15px'}}>{kw}</span>)}
                    </div>
                  )}
                  {currentTask === 2 ? (
                    <input type="number" style={inputNumberStyle} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="0" />
                  ) : (
                    <textarea 
                      style={textAreaStyle} 
                      value={inputText} 
                      onKeyUp={handleKeyUp}
                      onChange={(e) => setInputText(e.target.value)} 
                      placeholder={currentTask === 1 ? "Type keyword and press SPACE..." : "Type your logical solution here..."} 
                    />
                  )}
                  <button onClick={goToUpdate} disabled={currentTask === 1 ? keywords.length < 1 : !inputText.trim()} style={mainBtnStyle}>Submit Initial Solution</button>
                </div>
              )}
            </div>
          )}

          {phase === 'update' && (
            <div style={{ marginTop: '20px' }}>
              <div style={updateContainer}>
                <h4 style={{color:'#d9480f', margin:'0 0 10px 0'}}>⚠️ SITUATION UPDATE</h4>
                <p style={{ fontWeight: '500', fontSize: '17px' }}>{task.updateQ}</p>
                {task.options ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                    {task.options.map((opt, i) => <button key={i} onClick={() => handleUpdateSubmit(opt)} style={optionBtnStyle}>{opt}</button>)}
                  </div>
                ) : (
                  <>
                    {task.id === 3 ? <input type="number" style={inputNumberStyle} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="0" /> : <textarea style={textAreaStyle} value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Your new solution..." />}
                    <button onClick={() => handleUpdateSubmit()} disabled={!inputText.trim()} style={submitBtnStyle}>Submit Final Answer</button>
                  </>
                )}
                <div style={timerDisplay}>⏱ Latency Recorded: {timer}s</div>
              </div>
            </div>
          )}

          {phase === 'confidence' && (
            <div style={{ textAlign: 'center', marginTop: '25px' }}>
              <h3 style={{marginBottom:'5px'}}>Confidence Rating</h3>
              <p style={{fontSize:'14px', color:'#666'}}>How certain are you that your <strong>Update Answer</strong> is correct?</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '15px' }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <div key={n} style={{textAlign:'center'}}>
                    <button onClick={() => handleConfidenceSubmit(n)} style={confBtn}>{n}</button>
                    <div style={{fontSize:'9px', marginTop:'4px'}}>{n===1 ? 'Low' : n===5 ? 'High' : ''}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- CSS-IN-JS STYLING OBJECTS ---
const layoutWrapper = { backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: '"Segoe UI", Tahoma, sans-serif' };
const cardStyle = { background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', width: '100%', maxWidth: '650px', boxSizing: 'border-box' };
const titleStyle = { textAlign: 'center', color: '#2c3e50', fontSize: '24px', marginBottom: '10px' };
const descriptionStyle = { textAlign: 'center', color: '#7f8c8d', fontSize: '15px', lineHeight: '1.5', marginBottom: '30px' };
const infoBox = { background: '#e8f4fd', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontSize: '15px' };
const taskLabel = { fontSize: '11px', fontWeight: 'bold', color: '#3498db', letterSpacing: '1px' };
const questionText = { fontSize: '18px', color: '#34495e', lineHeight: '1.6' };
const startBtnStyle = { padding: '14px 40px', cursor: 'pointer', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px' };
const mainBtnStyle = { width: '100%', padding: '15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const smallBtnStyle = { flex: 1, padding: '10px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' };
const aiBoxStyle = { background: '#f8f9fa', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #3498db', marginTop: '15px', fontSize: '14px' };
const textAreaStyle = { width: '100%', height: '100px', marginTop: '10px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'inherit' };
const inputNumberStyle = { width: '100%', height: '54px', marginTop: '10px', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', boxSizing: 'border-box', fontFamily: 'inherit' };
const submitBtnStyle = { width: '100%', padding: '15px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '8px', marginTop: '15px', fontWeight: 'bold', cursor: 'pointer' };
const confBtn = { width: '50px', height: '50px', borderRadius: '10px', border: '1.5px solid #3498db', cursor: 'pointer', background: 'white', color: '#3498db', fontWeight: 'bold', fontSize: '16px' };
const optionBtnStyle = { padding: '15px', textAlign: 'left', background: '#fdfdfd', border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer', transition: '0.2s' };
const timerDisplay = { marginTop: '15px', textAlign: 'right', fontWeight: 'bold', color: '#e67e22', fontSize: '13px' };
const relianceBox = { padding: '20px', background: '#fcfcfc', border: '1px solid #eee', borderRadius: '12px', marginTop: '20px', textAlign: 'center' };
const consentScrollBox = { height: '180px', overflowY: 'auto', border: '1px solid #eee', padding: '15px', margin: '20px 0', fontSize: '13px', color: '#444', lineHeight: '1.6', background: '#fafafa' };
const updateContainer = { padding: '20px', border: '2px solid #ff922b', borderRadius: '12px', background: '#fff9f4' };