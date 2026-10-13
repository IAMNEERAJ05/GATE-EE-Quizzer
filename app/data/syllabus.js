/* GATE EE syllabus (sections 1, 2, 7 and 10) plus General Aptitude, as a checklist.
   Each subject -> topics -> concept units, taken line by line from the GATE 2027 EE syllabus.
   Every unit should be covered by at least three cards.
   Unit keys are referenced by cards (u:'unit') and by tagged paper questions (data/papers.js). */
window.SUBJECTS = [
{ id:'math', name:'Engineering Mathematics', short:'Maths', topics:[
  {id:'la', name:'Linear algebra', units:{
    matalg:'Matrix algebra, transpose and inverse', det:'Determinants', rank:'Rank',
    linsys:'Systems of linear equations', eig:'Eigenvalues and eigenvectors', eigprop:'Eigenvalue properties (trace, determinant, powers, special matrices)',
    cayley:'Cayley–Hamilton theorem'}},
  {id:'calc', name:'Calculus', units:{
    mvt:'Mean value theorems (Rolle, Lagrange)', defint:'Definite integrals and theorems of integral calculus',
    improper:'Improper integrals', partial:'Partial derivatives and Euler’s theorem', maxmin:'Maxima and minima (one and two variables)',
    multint:'Multiple integrals and change of order'}},
  {id:'fs', name:'Fourier series', units:{
    fscoef:'Fourier coefficients (Euler formulas)', fssym:'Even, odd and half-wave symmetry; half-range series', fsconv:'Convergence (Dirichlet) and Parseval'}},
  {id:'vec', name:'Vector calculus', units:{
    vecid:'Gradient, divergence, curl and vector identities', dirder:'Directional derivative', lineint:'Line integrals and conservative fields',
    surfvol:'Surface and volume integrals', stokes:'Stokes’s theorem', gauss:'Gauss’s (divergence) theorem', green:'Green’s theorem'}},
  {id:'ode', name:'Differential equations', units:{
    ode1:'First-order linear equations (integrating factor)', ode1nl:'First-order nonlinear: separable, exact, Bernoulli',
    hocc:'Higher-order linear ODEs with constant coefficients', vop:'Method of variation of parameters',
    cauchy:'Cauchy–Euler equation', ivp:'Initial and boundary value problems'}},
  {id:'pde', name:'Partial differential equations', units:{
    pdeclass:'Order, linearity and classification (heat, wave, Laplace)', sepvar:'Method of separation of variables'}},
  {id:'cv', name:'Complex variables', units:{
    analytic:'Analytic functions and Cauchy–Riemann equations', cit:'Cauchy’s integral theorem', cif:'Cauchy’s integral formula',
    series:'Taylor and Laurent series, singularities', residue:'Residues and the residue theorem', realint:'Real integrals by residues'}},
  {id:'prob', name:'Probability & random variables', units:{
    samp:'Sampling, counting and the axioms', condp:'Conditional probability and Bayes’ theorem',
    rv:'Random variables: PMF, PDF and CDF', expvar:'Mean and variance of a random variable'}},
  {id:'dist', name:'Distributions', units:{
    binom:'Binomial distribution', poisson:'Poisson distribution', unifexp:'Uniform and exponential distributions', normal:'Normal distribution'}},
  {id:'stat', name:'Statistics', units:{
    central:'Mean, median and mode', sd:'Standard deviation and variance', corr:'Correlation analysis', regr:'Regression analysis'}}
]},
{ id:'ckt', name:'Electric Circuits', short:'Circuits', topics:[
  {id:'elem', name:'Network elements', units:{
    src:'Ideal and practical sources, source transformation', dep:'Dependent sources', rlc:'R, L, C element laws and stored energy',
    mut:'Mutual inductance, dot convention and coupling'}},
  {id:'ana', name:'Network solution methods', units:{
    kcl:'KCL, KVL, series–parallel and dividers', nodal:'Node analysis (incl. supernode)', mesh:'Mesh analysis (incl. supermesh)',
    topo:'Network graph: nodes, branches, loops', ydt:'Star–delta transformation'}},
  {id:'thm', name:'Network theorems', units:{
    thev:'Thevenin’s theorem', norton:'Norton’s theorem', superpos:'Superposition theorem', mpt:'Maximum power transfer theorem'}},
  {id:'tran', name:'Transient response', units:{
    rcrl:'First-order RC and RL circuits (time constant)', init:'Initial and final conditions at switching',
    rlc2:'Second-order RLC transients (damping)', sdom:'Laplace (s-domain) circuit analysis', actr:'AC transients (sinusoidal source switched on)'}},
  {id:'ac', name:'Sinusoidal steady state', units:{
    phasor:'Phasors and impedance', rms:'RMS and average values', acana:'AC network analysis with phasors'}},
  {id:'res', name:'Resonance', units:{
    sres:'Series resonance', pres:'Parallel resonance', qbw:'Quality factor and bandwidth'}},
  {id:'pow', name:'Complex power & power factor', units:{
    cpow:'Complex, real, reactive and apparent power', pf:'Power factor and its correction'}},
  {id:'tp', name:'Two-port networks', units:{
    zy:'Z and Y parameters', habcd:'h and ABCD (transmission) parameters', tpconv:'Reciprocity, symmetry, interconnection and conversion'}},
  {id:'tph', name:'Balanced three-phase circuits', units:{
    bal:'Star and delta: line and phase quantities', p3:'Three-phase power and two-wattmeter readings'}}
]},
{ id:'ctrl', name:'Control Systems', short:'Control', topics:[
  {id:'model', name:'Modelling & transfer functions', units:{
    tf:'Transfer function, poles and zeros', phys:'Electrical and mechanical system models (analogies)', fb:'Feedback principle and sensitivity'}},
  {id:'bd', name:'Block diagrams & signal flow graphs', units:{
    bdr:'Block diagram reduction', sfg:'Signal flow graphs and Mason’s gain formula'}},
  {id:'trans', name:'Transient response', units:{
    first:'First-order systems', second:'Second-order systems: ζ, ωₙ and pole locations',
    spec:'Time-domain specs: overshoot, peak, rise and settling time', dom:'Dominant poles, added poles and zeros'}},
  {id:'sse', name:'Steady-state error', units:{
    stype:'System type and error constants', serr:'Steady-state error for step, ramp and parabola'}},
  {id:'routh', name:'Routh–Hurwitz stability', units:{
    rarray:'Routh array and sign changes', rspecial:'Special cases: zero element, zero row', krange:'Range of K, marginal stability and oscillation frequency'}},
  {id:'rl', name:'Root locus', units:{
    rlrules:'Branches, real-axis segments, asymptotes and centroid', rlpts:'Breakaway points, jω crossings and angles', rlk:'Magnitude condition: K at a point'}},
  {id:'freq', name:'Frequency response & Bode plots', units:{
    bode:'Bode magnitude and phase (slopes, corners)', margins:'Gain and phase margins, crossover frequencies',
    fspec:'Resonant peak, bandwidth and their link to ζ'}},
  {id:'nyq', name:'Nyquist criterion', units:{
    polar:'Polar plots', nyqc:'Nyquist criterion: N = Z − P', nyqm:'Margins and stability from the Nyquist plot'}},
  {id:'comp', name:'Compensators', units:{
    lead:'Lead compensator', lag:'Lag compensator', leadlag:'Lead–lag compensator'}},
  {id:'pid', name:'P, PI and PID controllers', units:{
    pc:'Proportional control', pi:'PI control and integral action', pd:'PD and PID control (derivative action)'}},
  {id:'state', name:'State-space analysis', units:{
    ssmodel:'State-space models and canonical forms', sstf:'State space to transfer function, eigenvalues',
    stm:'State-transition matrix and solution of state equations', ctob:'Controllability and observability'}}
]},
{ id:'pe', name:'Power Electronics', short:'PE', topics:[
  {id:'dev', name:'Power devices & gating', units:{
    scr:'Thyristor V–I characteristic, latching and holding current', trig:'Thyristor triggering and gate circuits, di/dt and dv/dt',
    mosigbt:'MOSFET and IGBT characteristics and gate drive', devcmp:'Comparing devices: control, speed and ratings'}},
  {id:'dcdc', name:'DC–DC converters', units:{
    buck:'Buck converter', boost:'Boost converter', bb:'Buck–boost converter', ripple:'Ripple, CCM and DCM boundary'}},
  {id:'unc', name:'Uncontrolled rectifiers', units:{
    r1:'Single-phase diode rectifiers', r3:'Three-phase diode rectifiers', rload:'Load and filter effects (R, RL, RLE, capacitor)'}},
  {id:'pcc', name:'Thyristor converters', units:{
    pc1:'Single-phase full and semi converters', pc3:'Three-phase thyristor converters', invm:'Inversion mode and firing-angle range',
    comm:'Commutation: voltage- and current-commutated, overlap'}},
  {id:'harm', name:'Line harmonics & power factor', units:{
    lh:'Line current harmonics: magnitude and phase', pfdf:'Displacement, distortion and power factor', thd:'THD and RMS of the line current'}},
  {id:'inv', name:'Inverters & PWM', units:{
    vsi1:'Single-phase voltage source inverters', vsi3:'Three-phase VSI (180° and 120° conduction)', csi:'Current source inverters',
    spwm:'Sinusoidal PWM', afe:'Bidirectional AC–DC voltage source converters'}}
]},
{ id:'ga', name:'General Aptitude', short:'GA', deck:'Rules & formulas', noMatch:true, topics:[
  {id:'gram', name:'Grammar', units:{
    sva:'Subject–verb agreement', tense:'Tenses', article:'Articles', prep:'Prepositions', conj:'Conjunctions and connectors',
    adjadv:'Adjectives, adverbs and comparison', pron:'Pronouns', condl:'Conditionals and modals', parallel:'Parallelism and modifiers'}},
  {id:'vocab', name:'Vocabulary & idioms', units:{
    confused:'Commonly confused words', context:'Words in context and intensity order', idiom:'Idioms and phrasal verbs', analogy:'Verbal analogies'}},
  {id:'reason', name:'Reading & inference', units:{
    infer:'Inference vs assumption ("based only on")', condinf:'What conditional sentences imply', seq:'Narrative sequencing'}},
  {id:'logic', name:'Logical reasoning', units:{
    syllog:'Categorical statements and syllogisms', code:'Coding–decoding', relation:'Blood relations', direction:'Directions and maps', puzzle:'Arrangements, tournaments and puzzles'}},
  {id:'arith', name:'Arithmetic', units:{
    pct:'Percentages and successive change', ratio:'Ratio and proportion', avg:'Averages', profit:'Profit, loss and discount',
    interest:'Simple and compound interest', mix:'Mixtures and alligation'}},
  {id:'rate', name:'Time, work & speed', units:{work:'Time and work, pipes', speed:'Speed, distance, trains and boats'}},
  {id:'num', name:'Numbers & algebra', units:{
    numth:'Divisibility, HCF/LCM, primes and digits', powlog:'Powers, exponents and logarithms', series:'Series and sequences', alg:'Equations, roots and function behaviour'}},
  {id:'cp', name:'Counting, probability & statistics', units:{
    pnc:'Permutations and combinations', prob:'Elementary probability', stats:'Mean, median and mode', sets:'Sets and Venn diagrams'}},
  {id:'geo', name:'Mensuration & geometry', units:{
    plane:'Plane figures: areas, angles, circles', solid:'Solids: surface area and volume', scale:'Scaling effects on length, area and volume'}},
  {id:'di', name:'Data interpretation', units:{ditab:'Tables, bar charts and histograms', dipie:'Pie charts and percentage shares'}},
  {id:'nr', name:'Numerical reasoning', units:{clock:'Clocks', calendar:'Calendars', ages:'Ages'}},
  {id:'spatial', name:'Spatial aptitude', units:{
    transform:'Rotation, reflection and symmetry', fold:'Paper folding and cutting', dice:'Dice and cube nets', cubecut:'Cutting and painting cubes', colour:'Map colouring'}}
]}
];

window.BANK = [];
/* addCards(subjectId, cards): scopes ids and stores the subject on each card */
window.addCards = function(s, cards){
  for (const c of cards){ c.s = s; c.id = s + '.' + c.id; window.BANK.push(c); }
};
