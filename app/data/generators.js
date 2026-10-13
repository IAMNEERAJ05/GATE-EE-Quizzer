/* Number generators: these NAT cards get fresh numbers every time they appear.
   gen(id, fn): fn(rand) returns {q, v, why, tol?, p}. p holds the drawn numbers (used by checking scripts).
   The card's written q / n stay as the fallback and as the example shown in the deck. Load after all card files. */
(function(){
const R = String.raw;
const byId = Object.fromEntries(BANK.map(c => [c.id, c]));
function gen(id, fn){ const c = byId[id]; if (!c || c.k !== 'nat') { console.warn('generator skipped:', id); return; } c.gen = fn; }
const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));
const pk = (r, arr) => arr[Math.floor(r() * arr.length)];
const rd = (x, d = 4) => Math.round(x * 10 ** d) / 10 ** d;
const C = (n, k) => { if (k < 0 || k > n) return 0; let v = 1; for (let i = 1; i <= k; i++) v = v * (n - k + i) / i; return Math.round(v); };
const fact = n => n <= 1 ? 1 : n * fact(n - 1);
const shufl = (r, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ---------------- Engineering Mathematics (adapted from the DA app) ---------------- */
gen('math.compl', r => { const m = ri(r,2,5), v = rd(1 - (5/6)**m);
  return {p:{m}, v, tol:0.002, q:R`A fair die is rolled ${m} times. Find \(P(\text{at least one six})\), to 3 decimals.`,
    why:R`\(1-(5/6)^{${m}}\approx${v.toFixed(3)}\).`}; });
gen('math.bayesnat', r => { const pr = pk(r,[0.005,0.01,0.02,0.05]), se = pk(r,[0.8,0.9,0.95,0.99]), fp = pk(r,[0.02,0.05,0.1]);
  const num = se*pr, den = num + fp*(1-pr), v = rd(num/den);
  return {p:{pr,se,fp}, v, tol:0.002, q:R`${+(pr*100).toFixed(1)}% of people have a disease. The test detects ${se*100}% of cases and gives a false positive ${fp*100}% of the time. Someone tests positive. Find \(P(\text{disease}\mid\text{positive})\), to 3 decimals.`,
    why:R`\(\frac{${se}\times${pr}}{${se}\times${pr}+${fp}\times${rd(1-pr,3)}}=\frac{${rd(num,5)}}{${rd(den,5)}}\approx${v.toFixed(3)}\). The base rate matters a lot.`}; });
gen('math.totalnat', r => { const s = pk(r,[0.5,0.6,0.7,0.8]), q = pk(r,[0.2,0.3,0.4,0.5]), v = rd(s + (1-s)*(1-q));
  return {p:{s,q}, v, q:R`${s*100}% of students never change their vote; the rest switch with probability ${q} between two votes. Find \(P(\text{a random student votes the same way twice})\).`,
    why:R`\(${s}\times1+${rd(1-s,2)}\times${rd(1-q,2)}=${v}\).`}; });
gen('math.median', r => { const xs = []; while (xs.length < 6){ const x = ri(r,1,30); if (!xs.includes(x)) xs.push(x); }
  const s = xs.slice().sort((a,b) => a-b), v = (s[2]+s[3])/2;
  return {p:{xs}, v, q:R`Find the median of ${xs.join(', ')}.`,
    why:R`Sorted: ${s.join(', ')}. Average the middle two: \((${s[2]}+${s[3]})/2=${v}\).`}; });
gen('math.meanupd', r => { const n = ri(r,10,30), m = ri(r,20,50), d = ri(r,1,4), x = (m+d)*(n+1) - n*m;
  return {p:{n,m,x}, v:m+d, q:R`${n} values have mean ${m}. A new value ${x} is added. Find the new mean.`,
    why:R`New total \(=${n}\times${m}+${x}=${n*m+x}\); divide by ${n+1} to get ${m+d}.`}; });
gen('math.binvar', r => { const n = ri(r,10,50), p = pk(r,[0.1,0.2,0.25,0.3,0.4,0.5,0.6,0.8]), v = rd(n*p*(1-p));
  return {p:{n,pp:p}, v, q:R`\(X\sim\text{Bin}(${n},\,${p})\). Find \(\operatorname{Var}(X)\).`,
    why:R`\(np(1-p)=${n}\times${p}\times${rd(1-p,2)}=${v}\).`}; });
gen('math.binexp', r => { const red = ri(r,2,8), blue = ri(r,2,8), n = pk(r,[20,30,40,50,60]), v = rd(n*red/(red+blue)), exact = (n*red) % (red+blue) === 0;
  return {p:{red,blue,n}, v, tol: exact ? undefined : 0.006, q:R`A bag has ${red} red and ${blue} blue balls. ${n} balls are drawn one at a time with replacement. Expected number of red balls${exact ? '' : ', to 2 decimals'}?`,
    why:R`Each draw is red with probability \(${red}/${red+blue}\), so \(E=${n}\times${red}/${red+blue}=${v}\).`}; });
gen('math.expsurv', r => { const lam = pk(r,[0.2,0.25,0.5,1]), x = ri(r,1,4), v = rd(Math.exp(-lam*x));
  return {p:{lam,x}, v, tol:0.002, q:R`Lifetimes are exponential with rate \(\lambda=${lam}\) per year. Find \(P(X>${x})\), to 3 decimals.`,
    why:R`\(e^{-${lam}\times${x}}=e^{-${rd(lam*x,3)}}\approx${v.toFixed(3)}\).`}; });
gen('math.memnat', r => { const a = pk(r,[2,3,4,5,10]), p = pk(r,[0.3,0.4,0.5,0.6,0.7,0.8]);
  return {p:{a,pp:p}, v:p, q:R`X is exponential and \(P(X>${a})=${p}\). Find \(P(X>${2*a}\mid X>${a})\).`,
    why:R`Memorylessness: it equals \(P(X>${a})=${p}\).`}; });
gen('math.normnat', r => { const z = pk(r,[1,2,3]), Phi = {1:0.8413,2:0.9772,3:0.9987}[z], mu = pk(r,[40,50,60,100]), s = pk(r,[5,10,15]), x = mu + z*s, v = rd(1-Phi);
  return {p:{z}, v, tol:0.0005, q:R`\(X\sim N(${mu},\,${s}^2)\). Given \(\Phi(${z})=${Phi}\), find \(P(X>${x})\).`,
    why:R`\(z=(${x}-${mu})/${s}=${z}\), so \(P=1-${Phi}=${v}\).`}; });
gen('math.dunifnat', r => { const n = ri(r,5,20), v = (n+1)/2;
  return {p:{n}, v, q:R`X is uniform on {1, 2, …, ${n}}. Find \(E[X]\).`, why:R`\((${n}+1)/2=${v}\).`}; });
gen('math.permnat', r => { const n = ri(r,5,9), k = ri(r,2,4); let v = 1; for (let i = 0; i < k; i++) v *= n-i;
  return {p:{n,k}, v, q:R`How many ${k}-letter arrangements (no repeated letters) can be made from ${n} distinct letters?`,
    why:R`\({}^{${n}}P_{${k}}=${Array.from({length:k},(_,i)=>n-i).join('\\times')}=${v}\).`}; });
gen('math.combnat', r => { const men = ri(r,5,9), wom = ri(r,4,7), size = pk(r,[3,4]), k = ri(r,1,size-1), v = C(wom,k)*C(men,size-k);
  return {p:{men,wom,size,k}, v, q:R`A committee of ${size} is chosen from ${men} men and ${wom} women. In how many ways can it have exactly ${k} women?`,
    why:R`\(\binom{${wom}}{${k}}\binom{${men}}{${size-k}}=${C(wom,k)}\times${C(men,size-k)}=${v}\).`}; });
gen('math.expmv', r => { const c = pk(r,[2,4,5,10]), v = rd(1/c);
  return {p:{c}, v, q:R`\(X\sim\text{Exp}(\lambda)\) and \(\operatorname{Var}(X)=${c}\,E[X]\). Find \(\lambda\).`,
    why:R`\(1/\lambda^2=${c}/\lambda\Rightarrow\lambda=1/${c}=${v}\).`}; });

gen('math.othereig', r => { let l1 = ri(r,1,9), l2 = ri(r,1,9); if ((l1+l2) % 2) l2 += 1; if (l1 === l2) l2 += 2;
  const d = (l1+l2)/2, o = (l1-l2)/2;
  return {p:{l1,l2}, v:l2, q:R`\(H=\begin{bmatrix}${d}&${o}\\${o}&${d}\end{bmatrix}\) has one eigenvalue ${l1}. Find the other.`,
    why:R`Trace is ${l1+l2}, so the other is ${l2}. Check: \(${l1}\times${l2}=${l1*l2}=\det H\).`}; });
gen('math.deteig', r => { const a = ri(r,1,4), b = ri(r,1,3), c = ri(r,2,5), v = (a*a+b*b)*c;
  return {p:{a,b,c}, v, q:R`A real 3×3 matrix has eigenvalues \(${a}-${b}i\) and ${c}. Find \(\det A\).`,
    why:R`The third eigenvalue is \(${a}+${b}i\). \(\det=(${a*a}+${b*b})\times${c}=${v}\).`}; });
gen('math.trpoly', r => { const e = [ri(r,-3,3), ri(r,-3,3), ri(r,1,4)], al = pk(r,[-2,-1,1,2]), v = e.reduce((s,l) => s + l*l + al*l, 0);
  const ps = al < 0 ? `A^2-${-al === 1 ? '' : -al}A` : `A^2+${al === 1 ? '' : al}A`;
  return {p:{e,al}, v, q:R`A has eigenvalues ${e.join(', ')}. Find \(\operatorname{tr}(${ps})\).`,
    why:R`Apply \(\lambda^2${al<0?'-':'+'}${Math.abs(al)===1?'':Math.abs(al)}\lambda\) to each eigenvalue and add: ${e.map(l => l*l+al*l).join(' + ').replace(/\+ -/g, '− ')} = ${v}.`}; });
gen('math.detpoly', r => { const e = [ri(r,1,3), ri(r,1,4), ri(r,2,4)], al = ri(r,1,3), vals = e.map(l => l*l + al*l), v = vals.reduce((a,b) => a*b, 1);
  return {p:{e,al}, v, q:R`A has eigenvalues ${e.join(', ')}. Find \(\det(A^2+${al===1?'':al}A)\).`,
    why:R`\(\lambda^2+${al===1?'':al}\lambda\) gives ${vals.join(', ')}. Product = ${v}.`}; });
gen('math.rnullnat', r => { const m = ri(r,3,7), n = ri(r,3,8), rk = ri(r,1,Math.min(m,n)), v = n-rk;
  return {p:{m,n,rk}, v, q:R`A is \(${m}\times${n}\) with rank ${rk}. Find \(\dim N(A)\).`, why:R`\(${n}-${rk}=${v}\) (number of columns minus rank).`}; });
gen('math.detcombo', r => { const d = ri(r,2,7), c = pk(r,[2,3]), v = c**3;
  return {p:{d,c}, v, q:R`A is 3×3 with \(\det A=${d}\). Find \(\det\big(${c}A^{-1}A^\top\big)\).`,
    why:R`\(${c}^3\cdot\frac1{${d}}\cdot${d}=${v}\). The value of \(\det A\) cancels.`}; });

/* determinants */
const bm = M => R`\begin{bmatrix}${M.map(row => row.join('&')).join(R`\\`)}\end{bmatrix}`;
const det2v = M => M[0][0]*M[1][1] - M[0][1]*M[1][0];
const det3v = M => M[0][0]*(M[1][1]*M[2][2] - M[1][2]*M[2][1]) - M[0][1]*(M[1][0]*M[2][2] - M[1][2]*M[2][0]) + M[0][2]*(M[1][0]*M[2][1] - M[1][1]*M[2][0]);
const minor = (M, i, j) => M.filter((_,a) => a !== i).map(row => row.filter((_,b) => b !== j));
const sgn = x => x < 0 ? `(${x})` : `${x}`;
gen('math.det3', r => { const M = Array.from({length:3}, () => Array.from({length:3}, () => ri(r,-3,4))), v = det3v(M);
  const t = [0,1,2].map(j => (j % 2 ? -1 : 1)*M[0][j]*det2v(minor(M,0,j)));
  return {p:{M}, v, q:R`Find \(\det${bm(M)}\).`,
    why:R`Expand along row 1: \(${M[0].map((a,j) => `${j ? (j % 2 ? '-' : '+') : ''}${sgn(a)}\cdot${sgn(det2v(minor(M,0,j)))}`).join('')}=${t.join('+').replace(/\+-/g,'-')}=${v}\). Expanding along a row or column with zeros saves work.`}; });
gen('math.detsing', r => { if (r() < 0.5){ let a, b, c; do { a = ri(r,-6,9); b = ri(r,-6,9); c = pk(r,[-3,-2,-1,1,2,3,4,5,6]); } while ((a*b) % c !== 0 || a*b === 0);
    const x = a*b/c;
    return {p:{n:2, a, b, c}, v:x, q:R`For what x is \(\begin{bmatrix}x&${a}\\${b}&${c}\end{bmatrix}\) singular?`, why:R`\(${c}x-${sgn(a)}\cdot${sgn(b)}=0\Rightarrow x=${x}\).`}; }
  let M, i, j, al, be, x;
  do { M = Array.from({length:3}, () => Array.from({length:3}, () => ri(r,-3,5))); i = ri(r,0,2); j = ri(r,0,2);
       M[i][j] = 0; be = det3v(M); M[i][j] = 1; al = det3v(M) - be; x = al ? -be/al : NaN; }
  while (!al || !Number.isInteger(x) || Math.abs(x) > 15);
  const S = M.map((row,a) => row.map((e,b) => a === i && b === j ? 'x' : e));
  return {p:{n:3, M:S}, v:x, q:R`For what x is \(${bm(S)}\) singular?`,
    why:R`The determinant is linear in x: \(${al}x${be < 0 ? '' : '+'}${be}=0\Rightarrow x=${x}\).`}; });
gen('math.cofactor', r => { const M = Array.from({length:3}, () => Array.from({length:3}, () => ri(r,-3,6))), i = ri(r,0,2), j = ri(r,0,2), m = det2v(minor(M,i,j)), s_ = (i + j) % 2 ? -1 : 1, v = s_*m;
  return {p:{M,i,j}, v, q:R`For \(A=${bm(M)}\), find the cofactor \(C_{${i + 1}${j + 1}}\).`,
    why:R`Delete row ${i + 1} and column ${j + 1}: \(M_{${i + 1}${j + 1}}=\det${bm(minor(M,i,j))}=${m}\). The sign \((-1)^{${i + j + 2}}=${s_}\) gives \(C_{${i + 1}${j + 1}}=${v}\).`}; });
gen('math.cramer2', r => { let a, b, c, d, x, y; do { a = ri(r,1,6); b = ri(r,-4,6); c = ri(r,-4,6); d = ri(r,1,6); x = ri(r,-5,6); y = ri(r,-5,6); } while (a*d - b*c === 0);
  const e = a*x + b*y, f = c*x + d*y, askX = r() < 0.5, D = a*d - b*c, Dx = e*d - b*f, Dy = a*f - e*c;
  const lin = (p_, q_, rhs) => `${p_ === 1 ? '' : p_ === -1 ? '-' : p_}x${q_ < 0 ? '-' : '+'}${Math.abs(q_) === 1 ? '' : Math.abs(q_)}y=${rhs}`;
  const eq1 = b === 0 ? `${a === 1 ? '' : a}x=${e}` : lin(a,b,e), eq2 = c === 0 ? `${d === 1 ? '' : d}y=${f}` : lin(c,d,f);
  return {p:{a,b,c,d,e,f,askX}, v: askX ? x : y, q:R`Use Cramer’s rule on \(${eq1},\ ${eq2}\). Find ${askX ? 'x' : 'y'}.`,
    why:R`\(\det A=${D}\), \(\det A_${askX ? 'x' : 'y'}=${askX ? Dx : Dy}\), so ${askX ? 'x' : 'y'} \(=${askX ? Dx : Dy}/${sgn(D)}=${askX ? x : y}\).`}; });
gen('math.deteigshift', r => { let e; do { e = [ri(r,-3,5), ri(r,-3,5), ri(r,-3,5)]; } while (new Set(e).size < 3);
  const k = ri(r,-2,4), v = e.reduce((s,l) => s*(l - k), 1), M = k === 0 ? 'A' : k > 0 ? `A-${k === 1 ? '' : k}I` : `A+${-k === 1 ? '' : -k}I`;
  return {p:{e,k}, v, q:R`A is \(3\times3\) with eigenvalues ${e.join(', ')}. Find \(\det(${M})\).`,
    why:R`\(A-kI\) has eigenvalues \(\lambda_i-k\): \(${e.map(l => `(${l}${k < 0 ? '+' + (-k) : '-' + k})`).join('')}=${v}\).`}; });

gen('math.rect', r => { const p = 4*ri(r,3,15), v = (p/4)**2;
  return {p:{per:p}, v, q:R`A rectangle has perimeter ${p}. Find its largest possible area.`, why:R`A square of side ${p/4} is best: area ${v}.`}; });
gen('math.x2ex', r => { const n = ri(r,2,6);
  return {p:{n}, v:n, q:R`Find the \(x\ge0\) that maximises \(f(x)=x^${n}e^{-x}\).`,
    why:R`\(f'=x^{${n-1}}e^{-x}(${n}-x)\), so the maximum is at \(x=${n}\).`}; });
gen('math.mvtnat', r => { const a = ri(r,0,4), b = a + 2*ri(r,1,3), v = (a+b)/2;
  return {p:{a,b}, v, q:R`\(f(x)=x^2\) on [${a}, ${b}]. Find the c given by the mean value theorem.`,
    why:R`Chord slope \(=(${b*b}-${a*a})/${b-a}=${a+b}\); \(2c=${a+b}\Rightarrow c=${v}\).`}; });


const rad = d => d * Math.PI / 180, deg = x => x * 180 / Math.PI;
const SQ2 = Math.SQRT2, SQ3 = Math.sqrt(3);
const TRIPLES = [[3,4,5],[6,8,10],[5,12,13],[8,6,10],[4,3,5],[12,5,13],[9,12,15],[8,15,17]];

/* ---------------- Engineering Mathematics (EE topics) ---------------- */
gen('math.eulernat', r => { const a = ri(r,1,4), b = ri(r,1,4), v = 3*(a*a*b + a*b*b);
  return {p:{a,b}, v, q:R`For \(f(x,y)=x^2y+xy^2\), find \(x f_x+y f_y\) at the point (${a}, ${b}).`,
    why:R`f is homogeneous of degree 3 and \(f(${a},${b})=${a*a*b+a*b*b}\), so the answer is \(3\times${a*a*b+a*b*b}=${v}\).`}; });
gen('math.min2nat', r => { const a = ri(r,1,4), b = ri(r,1,4), c = a*a + b*b + ri(r,1,9), v = c - a*a - b*b;
  return {p:{a,b,c}, v, q:R`Find the minimum value of \(f(x,y)=x^2+y^2-${2*a}x-${2*b}y+${c}\).`,
    why:R`Complete the squares: \((x-${a})^2+(y-${b})^2+${v}\). The minimum is ${v}, at (${a}, ${b}).`}; });
gen('math.ddmax', r => { const [a,b,c] = pk(r,[[1,2,2],[2,3,6],[1,4,8],[2,6,9],[4,4,7],[2,1,2],[6,2,3]]), v = 2*Math.sqrt(a*a+b*b+c*c);
  return {p:{a,b,c}, v, q:R`Find the maximum directional derivative of \(f=x^2+y^2+z^2\) at (${a}, ${b}, ${c}).`,
    why:R`\(\nabla f=(${2*a},${2*b},${2*c})\), and \(|\nabla f|=${v}\).`}; });
gen('math.potnat', r => { const a = ri(r,1,4), b = ri(r,1,5), v = a*a*b;
  return {p:{a,b}, v, q:R`\(\vec F=2xy\,\hat i+x^2\,\hat j\). Find the work \(\int\vec F\cdot d\vec r\) from (0, 0) to (${a}, ${b}) along any path.`,
    why:R`\(\vec F=\nabla(x^2y)\), so the work is \(${a}^2\times${b}=${v}\).`}; });
gen('math.greennat', r => { let p, q; do { p = ri(r,1,6); q = ri(r,1,6); } while (p === q); const a = ri(r,1,3), b = ri(r,1,3), v = (q - p)*a*b;
  return {p:{p,q,a,b}, v, q:R`Evaluate \(\oint_C(${p}y\,dx+${q}x\,dy)\) anticlockwise round the rectangle with corners (0,0), (${a},0), (${a},${b}), (0,${b}).`,
    why:R`\(Q_x-P_y=${q}-${p}=${q-p}\), times the area ${a*b}, gives ${v}.`}; });
gen('math.gaussnat', r => { const a = ri(r,1,3), b = ri(r,1,3), c = ri(r,1,3), v = a*b*c*(a+b+c);
  return {p:{a,b,c}, v, q:R`Find the outward flux of \(\vec F=x^2\hat i+y^2\hat j+z^2\hat k\) through the surface of the box \(0\le x\le${a}\), \(0\le y\le${b}\), \(0\le z\le${c}\).`,
    why:R`\(\nabla\cdot\vec F=2(x+y+z)\). \(\iiint2x\,dV=${a}^2\cdot${b}\cdot${c}\), and similarly for y and z, giving \(abc(a+b+c)=${v}\).`}; });
gen('math.divnat', r => { const a = ri(r,1,3), b = ri(r,1,3), c = ri(r,1,3), v = 2*a*b + c + 2*a*c;
  return {p:{a,b,c}, v, q:R`\(\vec F=x^2y\,\hat i+yz\,\hat j+xz^2\,\hat k\). Find \(\nabla\cdot\vec F\) at (${a}, ${b}, ${c}).`,
    why:R`\(2xy+z+2xz=${2*a*b}+${c}+${2*a*c}=${v}\).`}; });
gen('math.triplenat', r => { const a = ri(r,1,3), b = ri(r,1,4), c = ri(r,1,4), v = a*a*b*b*c*c/8;
  return {p:{a,b,c}, v, q:R`Evaluate \(\int_0^{${a}}\int_0^{${b}}\int_0^{${c}} xyz\,dz\,dy\,dx\).`,
    why:R`The integrand separates: \(\frac{${a*a}}{2}\cdot\frac{${b*b}}{2}\cdot\frac{${c*c}}{2}=${v}\).`}; });
gen('math.pinat', r => { let m1, m2, k; do { m1 = ri(r,1,3); m2 = ri(r,m1+1,5); k = ri(r,1,6); } while (k === m1 || k === m2);
  const s = m1 + m2, pr = m1*m2, d = (k-m1)*(k-m2), v = rd(1/d, 4);
  return {p:{m1,m2,k}, v, tol:0.002, q:R`The particular integral of \(y''-${s}y'+${pr}y=e^{${k}x}\) is \(c\,e^{${k}x}\). Find c, to 3 decimals.`,
    why:R`\(f(${k})=${k*k}-${s*k}+${pr}=${d}\), so \(c=1/${d}\approx${rd(1/d,3)}\).`}; });
gen('math.auxnat', r => { const m1 = ri(r,-4,4), m2 = ri(r,-4,5), s = m1 + m2, pr = m1*m2;
  const t = (x, sym) => x === 0 ? '' : (x > 0 ? '+' : '-') + (Math.abs(x) === 1 && sym ? '' : Math.abs(x)) + sym;
  return {p:{m1,m2}, v:s, q:R`The general solution of \(y''${t(-s,"y'")}${t(pr,'y')}=0\) is \(c_1e^{m_1x}+c_2e^{m_2x}\) (or \((c_1+c_2x)e^{mx}\) if the roots repeat). Find \(m_1+m_2\).`,
    why:R`The auxiliary equation \(m^2${t(-s,'m')}${t(pr,'')}=0\) has roots ${m1} and ${m2}; their sum is the negative of the middle coefficient, ${s}.`}; });
gen('math.wnat', r => { const k = ri(r,2,7);
  return {p:{k}, v:k, q:R`Find the Wronskian of \(\cos${k}x\) and \(\sin${k}x\).`,
    why:R`\(\cos${k}x\cdot${k}\cos${k}x-\sin${k}x\cdot(-${k}\sin${k}x)=${k}\).`}; });
gen('math.resnat', r => { const a = ri(r,1,5), b = ri(r,2,5), v = rd((b + a)/b, 4);
  return {p:{a,b}, v, tol:0.002, q:R`Find the residue of \(\frac{z+${a}}{z(z-${b})}\) at \(z=${b}\), to 3 decimals.`,
    why:R`\(\lim_{z\to${b}}\frac{z+${a}}{z}=\frac{${a+b}}{${b}}\approx${rd((a+b)/b,3)}\).`}; });
gen('math.regprod', r => { const [byx, bxy, rr] = pk(r,[[0.8,0.45,0.6],[0.5,0.5,0.5],[1.6,0.4,0.8],[0.9,0.4,0.6],[2,0.32,0.8],[0.25,1,0.5],[0.32,0.5,0.4],[1.2,0.3,0.6]]);
  const sg = pk(r,[1,-1]), v = sg*rr;
  return {p:{byx:sg*byx, bxy:sg*bxy}, v, q:R`The regression coefficients are \(b_{yx}=${sg*byx}\) and \(b_{xy}=${sg*bxy}\). Find the correlation coefficient r.`,
    why:R`\(|r|=\sqrt{${byx}\times${bxy}}=${rr}\), with the common sign of the coefficients, so \(r=${v}\).`}; });
gen('math.regmeans', r => { let xb, yb, a, b, c, d; do { xb = ri(r,1,6); yb = ri(r,1,8); a = ri(r,1,6); b = ri(r,1,4); c = ri(r,1,6); d = ri(r,1,4); } while (a*d === b*c);
  return {p:{xb,yb,a,b,c,d}, v:xb, q:R`The two regression lines are \(${a}x+${b}y=${a*xb+b*yb}\) and \(${c}x+${d}y=${c*xb+d*yb}\). Find \(\bar x\).`,
    why:R`Both lines pass through \((\bar x,\bar y)\). Solving them together gives \(\bar x=${xb}\), \(\bar y=${yb}\).`}; });
gen('math.spearnat', r => { const n = ri(r,5,7); let ra, d, S;
  do { ra = shufl(r, Array.from({length:n}, (_,i) => i+1)); d = ra.map((x,i) => (i+1) - x); S = d.reduce((s,x) => s + x*x, 0); } while (S === 0);
  const v = rd(1 - 6*S/(n*(n*n-1)), 4);
  return {p:{n,d}, v, tol:0.002, q:R`${n} items are ranked by two judges. The rank differences are ${d.join(', ')}. Find Spearman’s ρ, to 3 decimals.`,
    why:R`\(\sum d^2=${S}\). \(\rho=1-\frac{6\times${S}}{${n}(${n*n}-1)}\approx${rd(v,3)}\).`}; });

/* ---------------- Electric Circuits ---------------- */
gen('ckt.srcnat', r => { const Is = ri(r,2,12), Rs = pk(r,[2,4,5,6,10]), RL = pk(r,[2,3,4,6,10,15]), v = rd(Is*Rs/(Rs+RL), 4);
  return {p:{Is,Rs,RL}, v, tol:0.006, q:R`A ${Is} A current source in parallel with ${Rs} Ω feeds a ${RL} Ω load. Find the load current in A, to 2 decimals.`,
    why:R`Current divider: \(${Is}\times\frac{${Rs}}{${Rs}+${RL}}\approx${rd(v,2)}\) A.`}; });
gen('ckt.depnat', r => { const R1 = ri(r,1,6), k = ri(r,1,6), i = ri(r,1,5), Vs = i*(R1+k);
  return {p:{Vs,R1,k}, v:i, q:R`A single loop has a ${Vs} V source, a ${R1} Ω resistor and a CCVS of value \(${k}i\) (i = loop current) that opposes the ${Vs} V source. Find i in A.`,
    why:R`KVL: \(${Vs}=${R1}i+${k}i\), so \(i=${i}\) A.`}; });
gen('ckt.capseries', r => { const [a,b] = pk(r,[[6,3],[4,12],[10,15],[20,5],[12,6],[8,8],[30,6],[12,4]]), v = a*b/(a+b);
  return {p:{a,b}, v, q:R`Capacitors of ${a} µF and ${b} µF are connected in series. Find the equivalent capacitance in µF.`,
    why:R`\(\frac{${a}\times${b}}{${a}+${b}}=${v}\) µF.`}; });
gen('ckt.indpar', r => { const [a,b] = pk(r,[[4,12],[6,3],[10,15],[20,5],[12,6],[8,8],[30,6],[2,2]]), v = a*b/(a+b);
  return {p:{a,b}, v, q:R`Uncoupled inductors of ${a} H and ${b} H are connected in parallel. Find the equivalent inductance in H.`,
    why:R`\(\frac{${a}\times${b}}{${a+b}}=${v}\) H.`}; });
gen('ckt.indenergy', r => { const L = pk(r,[0.5,1,2,4,5]), I = ri(r,1,6), v = L*I*I/2;
  return {p:{L,I}, v, q:R`A ${L} H inductor carries ${I} A. Find the stored energy in J.`,
    why:R`\(\frac12\times${L}\times${I*I}=${v}\) J.`}; });
gen('ckt.aidnat', r => { const [L1,L2] = pk(r,[[4,9],[1,4],[4,16],[9,16],[1,9],[2,8]]), k = pk(r,[0.25,0.5,0.75,1]), M = k*Math.sqrt(L1*L2), aid = pk(r,[1,-1]), v = L1 + L2 + 2*aid*M;
  return {p:{L1,L2,k,aid}, v, q:R`Coils of ${L1} H and ${L2} H with k = ${k} are connected in series ${aid > 0 ? 'aiding' : 'opposing'}. Find the total inductance in H.`,
    why:R`\(M=${k}\sqrt{${L1*L2}}=${M}\) H. ${aid > 0 ? 'Aiding' : 'Opposing'}: \(${L1}+${L2}${aid > 0 ? '+' : '-'}2(${M})=${v}\) H.`}; });
gen('ckt.Mfromtwo', r => { const M = ri(r,1,6), S = ri(r,3*M,6*M), La = S + 2*M, Lo = S - 2*M;
  return {p:{La,Lo}, v:M, q:R`Two coupled coils measure ${La} mH in series aiding and ${Lo} mH in series opposing. Find M in mH.`,
    why:R`\(4M=${La}-${Lo}=${4*M}\), so \(M=${M}\) mH.`}; });
gen('ckt.kclnat', r => { const a = ri(r,1,9), b = ri(r,1,9), c = ri(r,1,a+b-1), v = a + b - c;
  return {p:{a,b,c}, v, q:R`Currents of ${a} A and ${b} A enter a node. Currents of ${c} A and i leave it. Find i in A.`,
    why:R`\(${a}+${b}=${c}+i\Rightarrow i=${v}\) A.`}; });
gen('ckt.reqnat', r => { const [a,b] = pk(r,[[6,3],[4,12],[10,15],[20,5],[12,6],[8,8],[30,6],[12,4]]), c = ri(r,1,10), v = a*b/(a+b) + c;
  return {p:{a,b,c}, v, q:R`A ${a} Ω resistor in parallel with ${b} Ω is connected in series with ${c} Ω. Find the total resistance in Ω.`,
    why:R`\(${a}\parallel${b}=${a*b/(a+b)}\) Ω, plus ${c} Ω gives ${v} Ω.`}; });
gen('ckt.nodalnat', r => { const R1 = pk(r,[2,4,5,10]), R2 = pk(r,[4,5,6,10,20]), R3 = pk(r,[5,10,12,20]), Vs = pk(r,[10,12,20,24,30]);
  const v = rd((Vs/R1)/(1/R1+1/R2+1/R3), 4);
  return {p:{Vs,R1,R2,R3}, v, tol:0.006, q:R`A ${Vs} V source feeds node V through ${R1} Ω. Node V is connected to ground through ${R2} Ω and through ${R3} Ω. Find V, to 2 decimals.`,
    why:R`\(\frac{V-${Vs}}{${R1}}+\frac{V}{${R2}}+\frac{V}{${R3}}=0\Rightarrow V=\frac{${Vs}/${R1}}{1/${R1}+1/${R2}+1/${R3}}\approx${rd(v,2)}\) V.`}; });
gen('ckt.nodalI', r => { const I = ri(r,1,5), R1 = pk(r,[2,4,5,10]), R2 = pk(r,[4,5,10,20]), Vs = pk(r,[5,10,12,20]);
  const v = rd((I + Vs/R1)/(1/R1 + 1/R2), 4);
  return {p:{I,R1,R2,Vs}, v, tol:0.006, q:R`A ${I} A current source injects into node V. Node V connects to ground through ${R2} Ω and to a ${Vs} V source through ${R1} Ω. Find V, to 2 decimals.`,
    why:R`\(\frac{V-${Vs}}{${R1}}+\frac{V}{${R2}}=${I}\Rightarrow V\approx${rd(v,2)}\) V.`}; });
gen('ckt.meshnat', r => { const Vs = pk(r,[6,10,12,20,24]), Ra = ri(r,1,6), Rs = ri(r,2,8), Rb = ri(r,1,8);
  const det = (Ra+Rs)*(Rs+Rb) - Rs*Rs, I1 = Vs*(Rs+Rb)/det, I2 = Vs*Rs/det, v = rd(I1 - I2, 4);
  return {p:{Vs,Ra,Rs,Rb}, v, tol:0.002, q:R`Mesh 1: a ${Vs} V source, a ${Ra} Ω resistor and a ${Rs} Ω resistor shared with mesh 2. Mesh 2: the shared ${Rs} Ω and another ${Rb} Ω, no source. Find the current in the shared resistor, in A, to 3 decimals.`,
    why:R`\(${Ra+Rs}I_1-${Rs}I_2=${Vs}\), \(-${Rs}I_1+${Rs+Rb}I_2=0\). Then \(I_1\approx${rd(I1,3)}\), \(I_2\approx${rd(I2,3)}\), and \(I_1-I_2\approx${rd(v,3)}\) A.`}; });
gen('ckt.linksnat', r => { const n = ri(r,4,9), b = ri(r,n,2*n+2), v = b - n + 1;
  return {p:{n,b}, v, q:R`A connected network graph has ${n} nodes and ${b} branches. How many fundamental loops (tie-sets) does it have?`,
    why:R`Links \(=b-n+1=${v}\), one fundamental loop each; there are \(n-1=${n-1}\) fundamental cut-sets.`}; });
gen('ckt.dtoynat', r => { const [a,b,c] = pk(r,[[10,20,30],[6,6,12],[5,10,25],[20,20,20],[12,18,6],[4,8,12],[15,30,15]]), v = rd(a*c/(a+b+c), 4);
  return {p:{a,b,c}, v, tol:0.006, q:R`A delta has \(R_{ab}=${a}\) Ω, \(R_{bc}=${b}\) Ω and \(R_{ca}=${c}\) Ω. Find the star resistance at node a, in Ω, to 2 decimals.`,
    why:R`\(\frac{${a}\times${c}}{${a+b+c}}\approx${rd(v,2)}\) Ω.`}; });
gen('ckt.ydbal', r => { const R1 = ri(r,2,20), v = 3*R1;
  return {p:{R:R1}, v, q:R`A balanced star has ${R1} Ω in each arm. Find each resistance of the equivalent delta, in Ω.`,
    why:R`\(R_\Delta=3R_Y=${v}\) Ω.`}; });
gen('ckt.thevnat', r => { const Vs = pk(r,[10,12,20,24,30,36]), R1 = pk(r,[2,3,4,6]), R2 = pk(r,[3,6,12]), v = rd(Vs*R2/(R1+R2), 4);
  return {p:{Vs,R1,R2}, v, tol:0.006, q:R`A ${Vs} V source is in series with ${R1} Ω; a ${R2} Ω resistor is connected across the output terminals a–b. Find \(V_{th}\) at a–b in V, to 2 decimals.`,
    why:R`Divider: \(${Vs}\times\frac{${R2}}{${R1+R2}}\approx${rd(v,2)}\) V. And \(R_{th}=${R1}\parallel${R2}\).`}; });
gen('ckt.thevload', r => { const Vs = pk(r,[12,24,36]), R1 = pk(r,[3,4,6]), R2 = pk(r,[6,12]), RL = pk(r,[2,4,6,8]);
  const Vth = Vs*R2/(R1+R2), Rth = R1*R2/(R1+R2), v = rd(Vth/(Rth+RL), 4);
  return {p:{Vs,R1,R2,RL}, v, tol:0.006, q:R`A ${Vs} V source is in series with ${R1} Ω; ${R2} Ω is across a–b. A ${RL} Ω load is connected at a–b. Find the load current in A, to 2 decimals.`,
    why:R`\(V_{th}=${rd(Vth,3)}\) V, \(R_{th}=${rd(Rth,3)}\) Ω, so \(I_L=\frac{${rd(Vth,3)}}{${rd(Rth,3)}+${RL}}\approx${rd(v,2)}\) A.`}; });
gen('ckt.nortonnat', r => { const R1 = pk(r,[2,4,5,8]), I = ri(r,1,6), Vs = I*R1, R2 = pk(r,[6,10,12]);
  return {p:{Vs,R1,R2}, v:I, q:R`A ${Vs} V source in series with ${R1} Ω, and ${R2} Ω across terminals a–b. Find the Norton current at a–b, in A.`,
    why:R`Shorting a–b shorts the ${R2} Ω, so \(I_{sc}=${Vs}/${R1}=${I}\) A.`}; });
gen('ckt.vociscP', r => { const Rth = pk(r,[2,4,5,8,10]), Isc = ri(r,1,5), Voc = Rth*Isc, RL = pk(r,[2,4,5,8,10]), v = rd((Voc/(Rth+RL))**2*RL, 4);
  return {p:{Voc,Isc,RL}, v, tol:0.006, q:R`A network has \(V_{oc}=${Voc}\) V and \(I_{sc}=${Isc}\) A. Find the power in a ${RL} Ω load, in W, to 2 decimals.`,
    why:R`\(R_{th}=${Rth}\) Ω, \(I=\frac{${Voc}}{${Rth+RL}}\), \(P=I^2\times${RL}\approx${rd(v,2)}\) W.`}; });
gen('ckt.superposnat', r => { const Vs = pk(r,[6,10,12,20]), R1 = pk(r,[2,4,5,10]), R2 = pk(r,[4,5,10,20]), I = ri(r,1,4);
  const v1 = Vs*R2/(R1+R2), v2 = I*R1*R2/(R1+R2), v = rd(v1+v2, 4);
  return {p:{Vs,R1,R2,I}, v, tol:0.006, q:R`A ${Vs} V source feeds node X through ${R1} Ω. Node X has ${R2} Ω to ground, and a ${I} A current source also injects into X. Find \(V_X\) in V, to 2 decimals.`,
    why:R`Voltage source alone: \(${rd(v1,3)}\) V. Current source alone: \(${I}\times(${R1}\parallel${R2})=${rd(v2,3)}\) V. Total \(\approx${rd(v,2)}\) V.`}; });
gen('ckt.mptnat', r => { const V = pk(r,[10,12,20,24,30,40]), R1 = pk(r,[2,4,5,6,10]), v = rd(V*V/(4*R1), 4);
  return {p:{V,R:R1}, v, tol:0.006, q:R`A source has \(V_{th}=${V}\) V and \(R_{th}=${R1}\) Ω. Find the maximum power it can deliver to a resistive load, in W, to 2 decimals.`,
    why:R`\(\frac{${V*V}}{4\times${R1}}\approx${rd(v,2)}\) W, at \(R_L=${R1}\) Ω.`}; });
gen('ckt.mptacnat', r => { const [a,b,c] = pk(r,TRIPLES);
  return {p:{R:a,X:b}, v:c, q:R`\(Z_{th}=${a}+j${b}\) Ω. The load is a variable pure resistor. Find \(R_L\) for maximum power, in Ω.`,
    why:R`\(R_L=|Z_{th}|=\sqrt{${a*a}+${b*b}}=${c}\) Ω.`}; });
gen('ckt.rcnat', r => { const V = pk(r,[5,10,12,20]), tau = pk(r,[0.5,1,2]), t = pk(r,[0.5,1,2,3]), v = rd(V*(1-Math.exp(-t/tau)), 4);
  const [Rk, Cm] = tau === 0.5 ? [0.5,1] : tau === 1 ? [1,1] : [2,1];
  return {p:{V,tau,t}, v, tol:0.006, q:R`An uncharged ${Cm} mF capacitor charges from ${V} V through ${Rk} kΩ. Find \(v_C\) at t = ${t} s, to 2 decimals.`,
    why:R`\(\tau=RC=${tau}\) s. \(v_C=${V}(1-e^{-${t}/${tau}})\approx${rd(v,2)}\) V.`}; });
gen('ckt.rlnat', r => { const V = pk(r,[6,12,24]), R1 = pk(r,[2,3,4,6]), L = pk(r,[1,2,4]), t = pk(r,[0.25,0.5,1]), v = rd(V/R1*(1-Math.exp(-R1*t/L)), 4);
  return {p:{V,R:R1,L,t}, v, tol:0.002, q:R`A ${V} V source is switched onto a series ${R1} Ω, ${L} H circuit at t = 0. Find the current at t = ${t} s, to 3 decimals.`,
    why:R`\(\tau=${rd(L/R1,4)}\) s, \(i(\infty)=${rd(V/R1,4)}\) A, so \(i=${rd(V/R1,4)}(1-e^{-${rd(R1*t/L,4)}})\approx${rd(v,3)}\) A.`}; });
gen('ckt.icap0', r => { const R1 = pk(r,[2,4,5,10]), i = ri(r,1,5), V = i*R1;
  return {p:{V,R:R1}, v:i, q:R`An uncharged capacitor in series with ${R1} Ω is switched onto ${V} V at t = 0. Find the current at \(t=0^+\), in A.`,
    why:R`\(v_C(0^+)=0\), so the full ${V} V is across ${R1} Ω: ${i} A.`}; });
gen('ckt.didt0', r => { const V = pk(r,[6,10,12,20,24]), L = pk(r,[0.5,1,2,4]), R1 = ri(r,1,10), v = V/L;
  return {p:{V,L,R:R1}, v, q:R`A ${V} V source is switched onto a series ${R1} Ω, ${L} H circuit (zero initial current). Find \(di/dt\) at \(t=0^+\), in A/s.`,
    why:R`At \(0^+\) the current is 0, so \(v_L=${V}\) V and \(di/dt=${V}/${L}=${v}\) A/s.`}; });
gen('ckt.dvdtnat', r => { const I = pk(r,[1,2,4,5,10]), C = pk(r,[1,2,4,5,10]), v = I/C*1000;
  return {p:{I,C}, v, q:R`A ${I} mA constant current charges a ${C} µF capacitor. Find \(dv/dt\) in V/s.`,
    why:R`\(\frac{${I}\times10^{-3}}{${C}\times10^{-6}}=${v}\) V/s.`}; });
gen('ckt.critR', r => { const [L, C] = pk(r,[[0.1,10],[1,100],[0.4,10],[0.01,1],[0.9,100],[0.25,1]]), v = rd(2*Math.sqrt(L/(C*1e-6)), 4);
  return {p:{L,C}, v, q:R`A series RLC circuit has L = ${L} H and C = ${C} µF. Find R for critical damping, in Ω.`,
    why:R`\(2\sqrt{L/C}=2\sqrt{${rd(L/(C*1e-6),2)}}=${v}\) Ω.`}; });
gen('ckt.wdnat', r => { const a = ri(r,1,4), w = ri(r,1,5), Rr = 2*a, w02 = a*a + w*w;
  return {p:{R:Rr, invC:w02}, v:w, q:R`A series RLC circuit has R = ${Rr} Ω, L = 1 H and C = 1/${w02} F. Find the damped natural frequency \(\omega_d\), in rad/s.`,
    why:R`\(s^2+${Rr}s+${w02}=0\Rightarrow s=-${a}\pm j${w}\), so \(\omega_d=${w}\) rad/s.`}; });
gen('ckt.ivtfvt', r => { const a = ri(r,1,5), b = ri(r,1,9), c = ri(r,1,4), v = rd(b/c, 4);
  return {p:{a,b,c}, v, tol:0.002, q:R`A current has \(I(s)=\frac{${a}s+${b}}{s(s+${c})}\). Find its final value \(i(\infty)\), in A, to 3 decimals.`,
    why:R`\(sI(s)=\frac{${a}s+${b}}{s+${c}}\to\frac{${b}}{${c}}\approx${rd(v,3)}\). The initial value is ${a}.`}; });
gen('ckt.rcpole', r => { const R1 = pk(r,[1,2,4,5,10]), C = pk(r,[0.1,0.2,0.5,1]), v = rd(-1/(R1*C), 4);
  return {p:{R:R1,C}, v, tol:0.002, q:R`A series RC circuit has R = ${R1} Ω and C = ${C} F. Find the pole of \(V_C(s)/V_{in}(s)\), to 3 decimals.`,
    why:R`\(\frac{1}{1+s\cdot${rd(R1*C,4)}}\): pole at \(-1/RC\approx${rd(v,3)}\).`}; });
gen('ckt.znat', r => { const [a,b,c] = pk(r,TRIPLES), k = pk(r,[2,4,5,10,20]), V = c*k;
  return {p:{R:a,X:b,V}, v:k, q:R`A series circuit has R = ${a} Ω and \(X_L=${b}\) Ω on a ${V} V (rms) supply. Find the rms current, in A.`,
    why:R`\(|Z|=${c}\) Ω, so \(I=${V}/${c}=${k}\) A.`}; });
gen('ckt.zrc', r => { const [a,b,c] = pk(r,TRIPLES);
  return {p:{R:a,X:b}, v:c, q:R`A series circuit has R = ${a} Ω and \(X_C=${b}\) Ω. Find |Z| in Ω.`,
    why:R`\(\sqrt{${a*a}+${b*b}}=${c}\) Ω.`}; });
gen('ckt.rmscomb', r => { const a = ri(r,1,12), b = ri(r,1,12), v = rd(Math.sqrt(a*a+b*b), 4);
  return {p:{a,b}, v, tol:0.006, q:R`Find the rms value of \(v=${a}+${b}\sqrt2\sin\omega t\), to 2 decimals.`,
    why:R`\(\sqrt{${a}^2+${b}^2}\approx${rd(v,2)}\).`}; });
gen('ckt.rmshw', r => { const Vm = pk(r,[10,20,50,100,230,325]), v = Vm/2;
  return {p:{Vm}, v, q:R`Find the rms value of a half-wave rectified sine of peak ${Vm} V.`,
    why:R`\(V_m/2=${v}\) V. The average is \(V_m/\pi\approx${rd(Vm/Math.PI,2)}\) V.`}; });
gen('ckt.acdiv', r => { const [a,b,c] = pk(r,TRIPLES), k = pk(r,[1,2,5,10]), V = c*k, v = b*k;
  return {p:{V,R:a,X:b}, v, q:R`A ${V} V (rms) source drives a ${a} Ω resistor in series with a ${b} Ω inductive reactance. Find the rms voltage across the inductor, in V.`,
    why:R`\(${V}\times\frac{${b}}{${c}}=${v}\) V.`}; });
gen('ckt.acsum', r => { const [a,b,c] = pk(r,TRIPLES), k = pk(r,[5,10,20]), VC = k*ri(r,1,6), VR = a*k, VL = VC + b*k, v = c*k;
  return {p:{VR,VL,VC}, v, q:R`In a series RLC circuit the voltmeter readings are \(V_R=${VR}\) V, \(V_L=${VL}\) V and \(V_C=${VC}\) V. Find the supply voltage, in V.`,
    why:R`\(\sqrt{${VR}^2+(${VL}-${VC})^2}=${v}\) V.`}; });
gen('ckt.acpar', r => { const [a,b,c] = pk(r,TRIPLES);
  return {p:{IR:a,IC:b}, v:c, q:R`A resistor and a capacitor in parallel draw ${a} A and ${b} A (rms). Find the supply current, in A.`,
    why:R`\(\sqrt{${a*a}+${b*b}}=${c}\) A.`}; });
gen('ckt.w0nat', r => { const L = pk(r,[10,40,90]), C = pk(r,[1,4,25,100]), v = rd(1/Math.sqrt(L*1e-3*C*1e-6), 4);
  return {p:{L,C}, v, q:R`L = ${L} mH and C = ${C} µF. Find \(\omega_0\) in rad/s.`,
    why:R`\(LC=${L}\times10^{-3}\times${C}\times10^{-6}\), so \(\omega_0=1/\sqrt{LC}=${v}\) rad/s.`}; });
gen('ckt.vcnat', r => { const Q = pk(r,[5,10,20,25,50]), V = pk(r,[1,2,5,10]), v = Q*V;
  return {p:{Q,V}, v, q:R`A series RLC circuit with Q = ${Q} is driven at resonance by ${V} V (rms). Find the rms capacitor voltage, in V.`,
    why:R`\(V_C=QV=${v}\) V.`}; });
gen('ckt.presRL', r => { const [b,a,c] = pk(r,[[3,4,5],[4,3,5],[6,8,10],[8,6,10],[5,12,13],[12,5,13]]), C = rd(1/(c*c), 6);
  return {p:{R:b, invC:c*c}, v:a, q:R`A coil (R = ${b} Ω, L = 1 H) is in parallel with C = 1/${c*c} F. Find the resonant frequency (unity power factor) in rad/s.`,
    why:R`\(\sqrt{${c*c}-${b*b}}=${a}\) rad/s.`}; });
gen('ckt.qnat', r => { const [L, C] = pk(r,[[0.1,10],[0.01,1],[0.4,10],[1,100],[0.04,1]]), R1 = pk(r,[1,2,5,10,20]), v = rd(Math.sqrt(L/(C*1e-6))/R1, 4);
  return {p:{R:R1,L,C}, v, tol:0.006, q:R`A series circuit has R = ${R1} Ω, L = ${L} H and C = ${C} µF. Find Q, to 2 decimals.`,
    why:R`\(Q=\frac1R\sqrt{L/C}=\frac{${rd(Math.sqrt(L/(C*1e-6)),3)}}{${R1}}\approx${rd(v,2)}\).`}; });
gen('ckt.bwnat', r => { const f0 = pk(r,[0.5,1,2,10]), Q = pk(r,[20,25,50,100]), v = rd(f0*1000/Q, 4);
  return {p:{f0,Q}, v, q:R`A tuned circuit has \(f_0=${f0}\) MHz and Q = ${Q}. Find its bandwidth in kHz.`,
    why:R`\(${f0}\times10^6/${Q}=${v}\) kHz.`}; });
gen('ckt.snat', r => { const V = pk(r,[100,200,230]), I = pk(r,[2,5,10]), tv = pk(r,[0,10,20,30]), th = pk(r,[30,45,60]), ti = tv - th, v = rd(V*I*Math.cos(rad(th)), 4);
  return {p:{V,I,tv,ti}, v, tol:0.06, q:R`\(V=${V}\angle${tv}^\circ\) V and \(I=${I}\angle${ti}^\circ\) A (rms). Find the real power, in W, to 1 decimal.`,
    why:R`\(S=${V*I}\angle${th}^\circ\), so \(P=${V*I}\cos${th}^\circ\approx${rd(v,1)}\) W.`}; });
gen('ckt.striangle', r => { const [a,b,c] = pk(r,TRIPLES), k = pk(r,[10,50,100]), v = rd(a/c, 4);
  return {p:{P:a*k,Q:b*k}, v, tol:0.002, q:R`A load takes ${a*k} W and ${b*k} var. Find its power factor, to 3 decimals.`,
    why:R`\(S=${c*k}\) VA and pf \(=${a*k}/${c*k}\approx${rd(v,3)}\) (lagging).`}; });
gen('ckt.pfcnat', r => { const P = pk(r,[5,10,20,50]), [pf1, t1] = pk(r,[[0.6,4/3],[0.8,0.75]]), [pf2, t2] = pf1 === 0.6 ? pk(r,[[1,0],[0.8,0.75]]) : [1,0], v = rd(P*(t1-t2), 4);
  return {p:{P,pf1,pf2}, v, tol:0.006, q:R`A ${P} kW load runs at ${pf1} pf lagging. Find the capacitor kvar needed to raise the pf to ${pf2}, to 2 decimals.`,
    why:R`\(\tan\phi_1=${rd(t1,4)}\), \(\tan\phi_2=${t2}\), so \(Q_C=${P}(${rd(t1,4)}-${t2})\approx${rd(v,2)}\) kvar.`}; });
gen('ckt.cuF', r => { const Q = pk(r,[500,1000,2000,5000]), V = pk(r,[230,400,415]), v = rd(Q/(V*V*2*Math.PI*50)*1e6, 4);
  return {p:{Q,V}, v, tol:0.06, q:R`A capacitor must supply ${Q} var at ${V} V, 50 Hz. Find C in µF, to 1 decimal.`,
    why:R`\(C=\frac{Q}{V^2\omega}=\frac{${Q}}{${V}^2\times314.16}\approx${rd(v,1)}\) µF.`}; });
gen('ckt.ztee', r => { const a = ri(r,1,6), b = ri(r,1,6), c = ri(r,1,8), v = b + c;
  return {p:{a,b,c}, v, q:R`A T network has series arms ${a} Ω (port 1 side) and ${b} Ω (port 2 side), and a ${c} Ω shunt arm. Find \(z_{22}\) in Ω.`,
    why:R`With port 1 open, port 2 sees \(${b}+${c}=${v}\) Ω. Also \(z_{11}=${a+c}\) and \(z_{12}=${c}\) Ω.`}; });
gen('ckt.ypi', r => { const a = ri(r,1,5), b = ri(r,1,5), c = ri(r,1,6), v = -c;
  return {p:{a,b,c}, v, q:R`A π network has shunt admittances ${a} S (port 1) and ${b} S (port 2) and a series admittance ${c} S. Find \(y_{12}\) in S.`,
    why:R`\(y_{12}=-Y_c=${v}\) S. Also \(y_{11}=${a+c}\), \(y_{22}=${b+c}\) S.`}; });
gen('ckt.ztoy', r => { let a, b; do { a = ri(r,2,8); b = ri(r,1,a-1); } while (false); const v = rd(a/(a*a-b*b), 4);
  return {p:{a,b}, v, tol:0.002, q:R`A two-port has \(z_{11}=z_{22}=${a}\) Ω and \(z_{12}=z_{21}=${b}\) Ω. Find \(y_{11}\) in S, to 3 decimals.`,
    why:R`\(\Delta z=${a*a}-${b*b}=${a*a-b*b}\), so \(y_{11}=z_{22}/\Delta z=${a}/${a*a-b*b}\approx${rd(v,3)}\) S.`}; });
const ABCD = [[2,3,1,2],[3,2,1,1],[2,1,3,2],[3,4,2,3],[5,4,6,5],[2,5,1,3],[4,3,5,4],[3,5,1,2]];
gen('ckt.abcdD', r => { const [A,B,Cc,D] = pk(r,ABCD);
  return {p:{A,B,C:Cc}, v:D, q:R`A reciprocal two-port has A = ${A}, B = ${B} Ω and C = ${Cc} S. Find D.`,
    why:R`\(AD-BC=1\Rightarrow D=\frac{1+${B}\times${Cc}}{${A}}=${D}\).`}; });
gen('ckt.zinload', r => { const [A,B,Cc,D] = pk(r,ABCD), ZL = pk(r,[1,2,4,5,10]), v = rd((A*ZL + B)/(Cc*ZL + D), 4);
  return {p:{A,B,C:Cc,D,ZL}, v, tol:0.002, q:R`A two-port has A = ${A}, B = ${B} Ω, C = ${Cc} S, D = ${D}. Port 2 is terminated in ${ZL} Ω. Find the input impedance, in Ω, to 3 decimals.`,
    why:R`\(Z_{in}=\frac{${A}(${ZL})+${B}}{${Cc}(${ZL})+${D}}=\frac{${A*ZL+B}}{${Cc*ZL+D}}\approx${rd(v,3)}\) Ω.`}; });
gen('ckt.starnat', r => { const VL = pk(r,[400,415,440,208]), R1 = pk(r,[5,10,20,23]), v = rd(VL/SQ3/R1, 4);
  return {p:{VL,R:R1}, v, tol:0.006, q:R`A balanced star load of ${R1} Ω (resistive) per phase is on a ${VL} V (line) supply. Find the line current, in A, to 2 decimals.`,
    why:R`\(V_{ph}=${VL}/\sqrt3\approx${rd(VL/SQ3,2)}\) V, so \(I\approx${rd(v,2)}\) A.`}; });
gen('ckt.dtoyeq', r => { const Z = 3*ri(r,2,20), v = Z/3;
  return {p:{Z}, v, q:R`A balanced delta load has ${Z} Ω per phase. For per-phase (star) analysis, what impedance per phase do you use, in Ω?`,
    why:R`\(Z_Y=Z_\Delta/3=${v}\) Ω.`}; });
gen('ckt.p3nat', r => { const VL = pk(r,[400,415,440]), I = pk(r,[5,10,20,25]), pf = pk(r,[0.6,0.8,0.9,1]), v = rd(SQ3*VL*I*pf/1000, 4);
  return {p:{VL,I,pf}, v, tol:0.006, q:R`A balanced load draws ${I} A from a ${VL} V (line) supply at ${pf} pf. Find the power in kW, to 2 decimals.`,
    why:R`\(\sqrt3\times${VL}\times${I}\times${pf}\approx${rd(v*1000,0)}\) W.`}; });
gen('ckt.twowattnat', r => { let W1, W2; do { W1 = ri(r,1,8); W2 = ri(r,-2,8); } while (W1 + W2 <= 0 || W2 > W1);
  const v = rd(Math.cos(Math.atan(SQ3*(W1-W2)/(W1+W2))), 4);
  return {p:{W1,W2}, v, tol:0.002, q:R`Two wattmeters read ${W1} kW and ${W2} kW on a balanced load. Find the power factor, to 3 decimals.`,
    why:R`\(\tan\phi=\sqrt3\times\frac{${W1-W2}}{${W1+W2}}\), so pf \(=\cos\phi\approx${rd(v,3)}\).`}; });
gen('ckt.deltavsstar', r => { const P = ri(r,1,9), v = 3*P;
  return {p:{P}, v, q:R`Three equal impedances take ${P} kW when star-connected to a supply. How many kW do they take when delta-connected to the same supply?`,
    why:R`Each impedance gets \(\sqrt3\) times the voltage in delta, so 3 times the power: ${v} kW.`}; });

/* ---------------- Control Systems ---------------- */
gen('ctrl.dcgain', r => { const a = ri(r,1,6), p1 = ri(r,1,3), p2 = ri(r,p1+1,6), v = rd(a/(p1*p2), 4);
  return {p:{a,p1,p2}, v, tol:0.002, q:R`Find the DC gain of \(G(s)=\frac{s+${a}}{s^2+${p1+p2}s+${p1*p2}}\), to 3 decimals.`,
    why:R`\(G(0)=${a}/${p1*p2}\approx${rd(v,3)}\); the poles −${p1}, −${p2} are stable.`}; });
gen('ctrl.odetf', r => { const a1 = ri(r,1,6), a0 = ri(r,1,8), b = a0*pk(r,[1,2,3]) , v = b/a0;
  return {p:{a1,a0,b}, v, q:R`A system obeys \(\ddot y+${a1}\dot y+${a0}y=${b}u\). Find its DC gain.`,
    why:R`\(G(s)=\frac{${b}}{s^2+${a1}s+${a0}}\), so \(G(0)=${v}\).`}; });
gen('ctrl.msdzeta', r => { const m = pk(r,[1,2,4]), k = pk(r,[2,4,8,9,16]), b = ri(r,1,8), v = rd(b/(2*Math.sqrt(m*k)), 4);
  return {p:{m,b,k}, v, tol:0.002, q:R`A mass–spring–damper has m = ${m} kg, b = ${b} N·s/m and k = ${k} N/m. Find ζ, to 3 decimals.`,
    why:R`\(\zeta=\frac{${b}}{2\sqrt{${m*k}}}\approx${rd(v,3)}\).`}; });
gen('ctrl.sensnat', r => { const [G, H] = pk(r,[[100,0.09],[100,0.04],[200,0.095],[50,0.98],[100,0.19],[400,0.0475]]), dG = pk(r,[10,20,5]), v = rd(dG/(1+G*H), 4);
  return {p:{G,H,dG}, v, tol:0.002, q:R`A feedback system has G = ${G} and H = ${H}. G changes by ${dG}%. By about what percentage does the closed-loop gain change? Give 3 decimals.`,
    why:R`\(1+GH=${rd(1+G*H,3)}\), so the change is about \(${dG}/${rd(1+G*H,3)}\approx${rd(v,3)}\%\).`}; });
gen('ctrl.bdnat', r => { const a = ri(r,1,5), b = ri(r,1,5), v = rd(a*b/(1+a*b), 4);
  return {p:{a,b}, v, tol:0.002, q:R`Blocks of gain ${a} and ${b} are in cascade inside a unity negative feedback loop. Find the closed-loop gain, to 3 decimals.`,
    why:R`\(G=${a*b}\), so \(T=${a*b}/${a*b+1}\approx${rd(v,3)}\).`}; });
gen('ctrl.nontouch', r => { const a = ri(r,1,5), b = ri(r,1,5), v = (1+a)*(1+b);
  return {p:{L1:-a,L2:-b}, v, q:R`A graph has exactly two loops, of gains −${a} and −${b}, that do not touch. Find Δ.`,
    why:R`\(1-(-${a}-${b})+(${a})(${b})=${v}\).`}; });
gen('ctrl.firstfinal', r => { const K = ri(r,1,10), a = ri(r,1,5), v = rd(K/a, 4);
  return {p:{K,a}, v, tol:0.002, q:R`\(G(s)=\frac{${K}}{s+${a}}\) gets a unit step. Find the final value of the output, to 3 decimals.`,
    why:R`\(G(0)=${K}/${a}\approx${rd(v,3)}\). The time constant is \(1/${a}\) s.`}; });
gen('ctrl.firstbw', r => { const T = pk(r,[0.1,0.2,0.25,0.5,0.05,2]), v = 1/T;
  return {p:{T}, v, q:R`Find the bandwidth (in rad/s) of \(\frac{1}{${T}s+1}\).`,
    why:R`\(1/T=${v}\) rad/s.`}; });
gen('ctrl.zetanat', r => { const z = pk(r,[0.2,0.25,0.4,0.5,0.6,0.75,0.8]), wn = pk(r,[2,4,5,10]), b = rd(2*z*wn, 4);
  return {p:{z,wn}, v:z, q:R`Find ζ for \(\frac{${wn*wn}}{s^2+${b}s+${wn*wn}}\).`,
    why:R`\(\omega_n=${wn}\) and \(2\zeta\omega_n=${b}\), so \(\zeta=${z}\).`}; });
gen('ctrl.wdnat', r => { const s = ri(r,1,5), w = ri(r,1,8);
  return {p:{s,w}, v:w, q:R`Find the damped frequency \(\omega_d\) (rad/s) of \(\frac{${s*s+w*w}}{s^2+${2*s}s+${s*s+w*w}}\).`,
    why:R`The poles are \(-${s}\pm j${w}\), so \(\omega_d=${w}\) rad/s.`}; });
gen('ctrl.mpnat', r => { const z = pk(r,[0.2,0.3,0.4,0.5,0.6,0.7,0.8]), v = rd(100*Math.exp(-z*Math.PI/Math.sqrt(1-z*z)), 4);
  return {p:{z}, v, tol:0.01, q:R`Find the percentage peak overshoot for ζ = ${z}, to 2 decimals.`,
    why:R`\(e^{-${z}\pi/\sqrt{1-${rd(z*z,2)}}}\approx${rd(v/100,4)}\), i.e. ${rd(v,2)}%.`}; });
gen('ctrl.tpnat', r => { const s = ri(r,1,5), w = ri(r,1,8), v = rd(Math.PI/w, 4);
  return {p:{s,w}, v, tol:0.002, q:R`Find the peak time (s) for \(\frac{${s*s+w*w}}{s^2+${2*s}s+${s*s+w*w}}\), to 3 decimals.`,
    why:R`\(\omega_d=${w}\), so \(t_p=\pi/${w}\approx${rd(v,3)}\) s.`}; });
gen('ctrl.tsnat', r => { const s = ri(r,1,6), w = ri(r,1,8), v = rd(4/s, 4);
  return {p:{s,w}, v, tol:0.002, q:R`Find the 2% settling time (s) for \(\frac{${s*s+w*w}}{s^2+${2*s}s+${s*s+w*w}}\), to 3 decimals.`,
    why:R`\(\zeta\omega_n=${s}\), so \(t_s\approx4/${s}\approx${rd(v,3)}\) s.`}; });
gen('ctrl.kvnat', r => { const a = ri(r,1,6), K = a*ri(r,1,8), v = K/a;
  return {p:{K,a}, v, q:R`Find \(K_v\) for \(G(s)=\frac{${K}}{s(s+${a})}\).`,
    why:R`\(sG=\frac{${K}}{s+${a}}\to${v}\).`}; });
gen('ctrl.kpnat', r => { const a = ri(r,1,3), b = ri(r,a+1,5), K = a*b*ri(r,1,6), v = K/(a*b);
  return {p:{K,a,b}, v, q:R`Find \(K_p\) for \(G(s)=\frac{${K}}{(s+${a})(s+${b})}\).`,
    why:R`\(G(0)=${K}/${a*b}=${v}\).`}; });
gen('ctrl.essramp', r => { const a = ri(r,1,5), K = ri(r,2,20), A = ri(r,1,5), v = rd(A*a/K, 4);
  return {p:{K,a,A}, v, tol:0.002, q:R`\(G(s)=\frac{${K}}{s(s+${a})}\) with unity feedback gets the input \(r(t)=${A}t\). Find \(e_{ss}\), to 3 decimals.`,
    why:R`\(K_v=${K}/${a}\), so \(e_{ss}=${A}/K_v\approx${rd(v,3)}\). The closed loop \(s^2+${a}s+${K}\) is stable.`}; });
gen('ctrl.essstep', r => { const a = ri(r,1,3), b = ri(r,a+1,5), K = ri(r,2,30), Kp = K/(a*b), v = rd(1/(1+Kp), 4);
  return {p:{K,a,b}, v, tol:0.002, q:R`\(G(s)=\frac{${K}}{(s+${a})(s+${b})}\) with unity feedback gets a unit step. Find \(e_{ss}\), to 3 decimals.`,
    why:R`\(K_p=${K}/${a*b}\), so \(e_{ss}=\frac{1}{1+K_p}\approx${rd(v,3)}\).`}; });
gen('ctrl.kmaxnat', r => { const a = ri(r,1,3), b = ri(r,a+1,6), v = (a+b)*a*b;
  return {p:{a,b}, v, q:R`\(G(s)=\frac{K}{s(s+${a})(s+${b})}\) with unity feedback. Find the largest K for stability.`,
    why:R`\(s^3+${a+b}s^2+${a*b}s+K\): need \(${a+b}\times${a*b}>K\), so \(K\lt${v}\).`}; });
gen('ctrl.kmax48', r => { const a = pk(r,[2,3,4]), b = pk(r,[4,5,6,8]), v = (a+b)*a*b;
  return {p:{a,b}, v, q:R`\(G(s)=\frac{K}{s(s+${a})(s+${b})}\) with unity feedback. Find the largest K for stability.`,
    why:R`\(s^3+${a+b}s^2+${a*b}s+K\): \(K\lt${a+b}\times${a*b}=${v}\). It then oscillates at \(\sqrt{${a*b}}\) rad/s.`}; });
gen('ctrl.wosc', r => { const a = ri(r,1,3), b = ri(r,a+1,6), v = rd(Math.sqrt(a*b), 4);
  return {p:{a,b}, v, tol:0.002, q:R`\(G(s)=\frac{K}{s(s+${a})(s+${b})}\), unity feedback, K at its marginal value. Find the oscillation frequency in rad/s, to 3 decimals.`,
    why:R`At \(K=${(a+b)*a*b}\) the \(s^2\) row gives \(${a+b}s^2+${(a+b)*a*b}=0\), so \(\omega=\sqrt{${a*b}}\approx${rd(v,3)}\) rad/s.`}; });
gen('ctrl.jwcross', r => { const a = ri(r,1,3), b = ri(r,a+1,6), v = rd(Math.sqrt(a*b), 4);
  return {p:{a,b}, v, tol:0.002, q:R`At what frequency (rad/s) does the root locus of \(\frac{K}{s(s+${a})(s+${b})}\) cross the jω axis? Give 3 decimals.`,
    why:R`Routh gives \(K=${(a+b)*a*b}\) and the auxiliary \(${a+b}s^2+${(a+b)*a*b}=0\), so \(\omega=\sqrt{${a*b}}\approx${rd(v,3)}\).`}; });
gen('ctrl.centroidnat', r => { const a = ri(r,1,4), b = ri(r,a+1,8), v = rd(-(a+b)/3, 4);
  return {p:{a,b}, v, tol:0.002, q:R`Find the centroid of the asymptotes for \(G(s)H(s)=\frac{K}{s(s+${a})(s+${b})}\), to 3 decimals.`,
    why:R`\(\frac{0-${a}-${b}}{3}\approx${rd(v,3)}\).`}; });
gen('ctrl.breaknat', r => { const a = ri(r,1,10), v = -a/2;
  return {p:{a}, v, q:R`Find the breakaway point of the root locus of \(\frac{K}{s(s+${a})}\).`,
    why:R`\(K=-s^2-${a}s\), \(dK/ds=-2s-${a}=0\Rightarrow s=${v}\).`}; });
gen('ctrl.knat', r => { const h = ri(r,1,4), a = 2*h, w = ri(r,1,5), v = h*h + w*w;
  return {p:{a,w}, v, q:R`For \(\frac{K}{s(s+${a})}\) with unity feedback, find K that puts the closed-loop poles at \(-${h}\pm j${w}\).`,
    why:R`\(s^2+${a}s+K=(s+${h})^2+${w*w}\Rightarrow K=${v}\).`}; });
gen('ctrl.kzeta', r => { const z = pk(r,[0.25,0.4,0.5,0.8]), a = pk(r,[2,4,8]), wn = a/(2*z), v = rd(wn*wn, 4);
  return {p:{a,z}, v, tol:0.002, q:R`For \(\frac{K}{s(s+${a})}\) with unity feedback, find K for ζ = ${z}, to 3 decimals.`,
    why:R`\(2\zeta\omega_n=${a}\Rightarrow\omega_n=${rd(wn,4)}\Rightarrow K=\omega_n^2\approx${rd(v,3)}\).`}; });
gen('ctrl.bodenat', r => { const K = pk(r,[10,100,1000]), w = pk(r,[0.1,1]), v = rd(20*Math.log10(K/w), 4);
  return {p:{K,w}, v, q:R`For \(G=\frac{${K}}{s(1+0.1s)}\), find the asymptotic magnitude at ω = ${w} rad/s, in dB.`,
    why:R`Below the corner at 10 rad/s, \(|G|\approx${K}/${w}\), i.e. ${v} dB.`}; });
gen('ctrl.bodeK', r => { const K = pk(r,[2,5,10,20,50,100]);
  return {p:{K}, v:K, q:R`A type-1 Bode plot’s initial −20 dB/dec line (extended) crosses 0 dB at ω = ${K} rad/s. Find the gain K (= \(K_v\)).`,
    why:R`The line is \(K/\omega\), which is 1 at \(\omega=K=${K}\).`}; });
gen('ctrl.gmnat', r => { const K = pk(r,[0.5,1,1.5,2,3,4]), v = rd(6/K, 4);
  return {p:{K}, v, tol:0.002, q:R`Find the gain margin (as a ratio) of \(G=\frac{${K}}{s(s+1)(s+2)}\), to 3 decimals.`,
    why:R`Phase −180° at \(\omega=\sqrt2\), where \(|G|=${K}/6\). So GM \(=6/${K}\approx${rd(v,3)}\).`}; });
gen('ctrl.mrnat', r => { const z = pk(r,[0.1,0.2,0.3,0.4,0.5,0.6]), v = rd(1/(2*z*Math.sqrt(1-z*z)), 4);
  return {p:{z}, v, tol:0.002, q:R`Find the resonant peak \(M_r\) for ζ = ${z}, to 3 decimals.`,
    why:R`\(\frac{1}{2(${z})\sqrt{1-${rd(z*z,2)}}}\approx${rd(v,3)}\).`}; });
gen('ctrl.polarcross', r => { const K = pk(r,[0.5,1,2,3,4,5]), v = rd(-K/6, 4);
  return {p:{K}, v, tol:0.002, q:R`Where does the polar plot of \(\frac{${K}}{s(s+1)(s+2)}\) cross the negative real axis? Give the real value, to 3 decimals.`,
    why:R`At \(\omega=\sqrt2\), \(|G|=${K}/6\), so the crossing is at \(\approx${rd(v,3)}\).`}; });
gen('ctrl.gmdbnat', r => { const a = pk(r,[0.1,0.2,0.25,0.4,0.5,0.8]), v = rd(-20*Math.log10(a), 4);
  return {p:{a}, v, tol:0.006, q:R`The Nyquist plot crosses the negative real axis at −${a}. Find the gain margin in dB, to 2 decimals.`,
    why:R`\(GM=1/${a}\), i.e. \(-20\log${a}\approx${rd(v,2)}\) dB.`}; });
gen('ctrl.nyqK', r => { const a = pk(r,[0.1,0.2,0.25,0.4,0.5,0.125]), v = 1/a;
  return {p:{a}, v, q:R`For K = 1 the Nyquist plot of \(KG(s)\) (stable, minimum phase) crosses the negative real axis at −${a}. At what K does the closed loop become marginally stable?`,
    why:R`The crossing moves to \(-${a}K\), which reaches −1 at \(K=${v}\).`}; });
gen('ctrl.phimaxnat', r => { const a = pk(r,[2,3,4,5,6,8,10]), v = rd(deg(Math.asin((a-1)/(a+1))), 4);
  return {p:{a}, v, tol:0.06, q:R`A lead compensator \(\frac{1+aTs}{1+Ts}\) has a = ${a}. Find its maximum phase lead in degrees, to 1 decimal.`,
    why:R`\(\sin\phi_m=\frac{${a-1}}{${a+1}}\), so \(\phi_m\approx${rd(v,1)}^\circ\).`}; });
gen('ctrl.wmnat', r => { const [z, p] = pk(r,[[2.5,10],[1,4],[2,8],[0.5,8],[4,25],[1,16],[2,32]]), T = 1/p, aT = 1/z, v = Math.sqrt(z*p);
  return {p:{z,p}, v, q:R`Find \(\omega_m\) (rad/s) for \(G_c=\frac{1+${rd(aT,4)}s}{1+${rd(T,4)}s}\).`,
    why:R`Zero at ${z}, pole at ${p} rad/s; \(\sqrt{${z}\times${p}}=${v}\) rad/s.`}; });
gen('ctrl.lagkv', r => { const [z, p] = pk(r,[[0.1,0.01],[0.2,0.02],[0.5,0.05],[0.1,0.02],[0.3,0.03],[0.2,0.04]]), v = rd(z/p, 4);
  return {p:{z,p}, v, q:R`A lag compensator \(\frac{s+${z}}{s+${p}}\) is added in cascade. By what factor does \(K_v\) increase?`,
    why:R`At s → 0 it contributes \(${z}/${p}=${v}\).`}; });
gen('ctrl.pcnat', r => { const Kp = pk(r,[1,3,4,9,19,24,49]), v = rd(1/(1+Kp), 4);
  return {p:{Kp}, v, tol:0.002, q:R`A plant \(\frac{1}{s+1}\) under P control with \(K_p=${Kp}\) and unity feedback gets a unit step. Find \(e_{ss}\), to 3 decimals.`,
    why:R`\(\frac{1}{1+${Kp}}\approx${rd(v,3)}\).`}; });
gen('ctrl.pizero', r => { const Kp = ri(r,1,5), z = ri(r,1,6), Ki = Kp*z;
  return {p:{Kp,Ki}, v:-z, q:R`A PI controller has \(K_p=${Kp}\) and \(K_i=${Ki}\). Where is its zero?`,
    why:R`\(${Kp}+\frac{${Ki}}{s}=\frac{${Kp}(s+${z})}{s}\): zero at −${z}.`}; });
gen('ctrl.pdnat', r => { let wn, a, z, Kd; do { wn = ri(r,2,6); a = ri(r,1,3); z = pk(r,[0.5,0.6,0.7,0.8,1]); Kd = rd(2*z*wn - a, 4); } while (Kd <= 0);
  return {p:{Kp:wn*wn,a,z}, v:Kd, tol:0.002, q:R`A plant \(\frac{1}{s(s+${a})}\) has a PD controller \(K_p+K_ds\) with \(K_p=${wn*wn}\), unity feedback. Find \(K_d\) that gives ζ = ${z} in the characteristic equation, to 3 decimals.`,
    why:R`\(s^2+(${a}+K_d)s+${wn*wn}\): \(\omega_n=${wn}\), \(2\zeta\omega_n=${rd(2*z*wn,4)}=${a}+K_d\Rightarrow K_d=${Kd}\).`}; });
gen('ctrl.sstfnat', r => { const p1 = ri(r,1,3), p2 = ri(r,p1+1,5), a = p1+p2, b = p1*p2, v = rd(1/b, 4);
  return {p:{a,b}, v, tol:0.002, q:R`\(A=\begin{bmatrix}0&1\\-${b}&-${a}\end{bmatrix}\), \(B=\begin{bmatrix}0\\1\end{bmatrix}\), \(C=\begin{bmatrix}1&0\end{bmatrix}\), D = 0. Find the DC gain, to 3 decimals.`,
    why:R`This is the canonical form of \(\frac{1}{s^2+${a}s+${b}}\), so \(G(0)=1/${b}\approx${rd(v,3)}\).`}; });
gen('ctrl.deteig', r => { const p1 = ri(r,1,4), p2 = ri(r,1,5), a = p1+p2, b = p1*p2;
  return {p:{a,b}, v:b, q:R`\(A=\begin{bmatrix}0&1\\-${b}&-${a}\end{bmatrix}\). Find the product of its eigenvalues.`,
    why:R`\(\det A=0\cdot(-${a})-(1)(-${b})=${b}\). The eigenvalues are −${p1} and −${p2}.`}; });
gen('ctrl.stmdiag', r => { const l1 = ri(r,1,3), l2 = ri(r,1,4), t = pk(r,[0.25,0.5,1]), v = rd(Math.exp(-l2*t), 4);
  return {p:{l1,l2,t}, v, tol:0.002, q:R`\(A=\begin{bmatrix}-${l1}&0\\0&-${l2}\end{bmatrix}\). Find the (2, 2) entry of \(\Phi(${t})\), to 3 decimals.`,
    why:R`\(e^{-${l2}\times${t}}\approx${rd(v,3)}\).`}; });
gen('ctrl.stmnil', r => { const x1 = ri(r,-3,4), x2 = ri(r,-3,4), t = ri(r,1,5), v = x1 + t*x2;
  return {p:{x1,x2,t}, v, q:R`\(\dot x=\begin{bmatrix}0&1\\0&0\end{bmatrix}x\) with \(x(0)=\begin{bmatrix}${x1}\\${x2}\end{bmatrix}\). Find \(x_1(${t})\).`,
    why:R`\(e^{At}=I+At\), so \(x_1=${x1}+${t}\times(${x2})=${v}\).`}; });
gen('ctrl.lagnet', r => { const R1 = pk(r,[4,9,19,49]), R2 = 1, C = pk(r,[10,100,1000]), v = rd(1/((R1+R2)*1e3*C*1e-6), 4);
  return {p:{R1,R2,C}, v, tol:0.002, q:R`An RC lag network has \(R_1=${R1}\) kΩ in series and \(R_2=${R2}\) kΩ with C = ${C} µF to ground: \(G_c=\frac{1+R_2Cs}{1+(R_1+R_2)Cs}\). Find the magnitude of its pole in rad/s, to 3 decimals.`,
    why:R`\((R_1+R_2)C=${R1+R2}\times10^3\times${C}\times10^{-6}\) s, so the pole is at \(\approx-${rd(v,3)}\) rad/s.`}; });

/* ---------------- Power Electronics ---------------- */
gen('pe.didtnat', r => { const V = pk(r,[100,200,300,400,600]), d = pk(r,[20,25,50,100]), v = V/d;
  return {p:{V,d}, v, q:R`A thyristor on a ${V} V supply has a di/dt rating of ${d} A/µs. Find the minimum series inductance in µH.`,
    why:R`\(L=V/(di/dt)=${V}/${d}=${v}\) µH.`}; });
gen('pe.condloss', r => { const I = ri(r,2,20), Rds = pk(r,[0.01,0.02,0.05,0.1]), v = rd(I*I*Rds, 4);
  return {p:{I,Rds}, v, tol:0.006, q:R`A MOSFET with \(R_{DS(on)}=${Rds}\) Ω carries a steady ${I} A. Find the conduction loss in W, to 2 decimals.`,
    why:R`\(${I}^2\times${Rds}=${v}\) W.`}; });
gen('pe.swloss', r => { const V = pk(r,[200,300,400,600]), I = pk(r,[5,10,20]), t = pk(r,[100,200,400]), f = pk(r,[10,20,50]), v = rd(0.5*V*I*t*1e-9*f*1e3, 4);
  return {p:{V,I,t,f}, v, tol:0.006, q:R`A switch turns ${V} V and ${I} A on and off with \(t_{on}+t_{off}=${t}\) ns at ${f} kHz. Using linear switching transitions, find the switching loss in W, to 2 decimals.`,
    why:R`\(\frac12\times${V}\times${I}\times${t}\times10^{-9}\times${f*1000}=${v}\) W.`}; });
gen('pe.bucknat', r => { const Vs = pk(r,[24,48,60,100]), D = pk(r,[0.2,0.25,0.4,0.5,0.6,0.75]), Vo = rd(D*Vs, 4);
  return {p:{Vs,Vo}, v:D, q:R`A buck converter steps ${Vs} V down to ${Vo} V in CCM. Find the duty ratio.`,
    why:R`\(D=${Vo}/${Vs}=${D}\).`}; });
gen('pe.buckIs', r => { const Vs = pk(r,[12,24,48]), D = pk(r,[0.25,0.5,0.75]), R1 = pk(r,[2,3,4,6]), Io = D*Vs/R1, v = rd(D*Io, 4);
  return {p:{Vs,D,R:R1}, v, tol:0.006, q:R`An ideal buck converter has \(V_s=${Vs}\) V, D = ${D} and a ${R1} Ω load. Find the average input current in A, to 2 decimals.`,
    why:R`\(V_o=${D*Vs}\) V, \(I_o=${rd(Io,4)}\) A, and \(I_s=DI_o\approx${rd(v,2)}\) A.`}; });
gen('pe.boostnat', r => { const Vs = pk(r,[5,12,24,48]), D = pk(r,[0.2,0.25,0.4,0.5,0.6,0.75,0.8]), v = rd(Vs/(1-D), 4);
  return {p:{Vs,D}, v, tol:0.006, q:R`An ideal boost converter has \(V_s=${Vs}\) V and D = ${D}. Find \(V_o\) in V, to 2 decimals.`,
    why:R`\(${Vs}/(1-${D})=${v}\) V.`}; });
gen('pe.boostIL', r => { const Io = ri(r,1,5), D = pk(r,[0.2,0.25,0.4,0.5,0.6,0.75,0.8]), v = rd(Io/(1-D), 4);
  return {p:{Io,D}, v, tol:0.006, q:R`An ideal boost converter with D = ${D} supplies ${Io} A to its load. Find the average inductor current in A, to 2 decimals.`,
    why:R`\(\bar I_L=I_o/(1-D)=${v}\) A.`}; });
gen('pe.bbnat', r => { const Vs = pk(r,[12,24,36,48]), D = pk(r,[0.2,0.25,0.4,0.5,0.6,0.75]), v = rd(D/(1-D)*Vs, 4);
  return {p:{Vs,D}, v, tol:0.006, q:R`An ideal buck–boost converter has \(V_s=${Vs}\) V and D = ${D}. Find \(|V_o|\) in V, to 2 decimals.`,
    why:R`\(\frac{${D}}{${rd(1-D,2)}}\times${Vs}=${v}\) V, with reversed polarity.`}; });
gen('pe.bbD', r => { const Vs = pk(r,[12,24,36,48]), Vo = pk(r,[6,12,24,36,48]), v = rd(Vo/(Vs+Vo), 4);
  return {p:{Vs,Vo}, v, tol:0.002, q:R`A buck–boost converter must give \(|V_o|=${Vo}\) V from ${Vs} V. Find D, to 3 decimals.`,
    why:R`\(D=\frac{${Vo}}{${Vs}+${Vo}}\approx${rd(v,3)}\).`}; });
gen('pe.ripplenat', r => { const Vs = pk(r,[24,48]), D = pk(r,[0.25,0.5,0.75]), f = pk(r,[20,25,50]), L = pk(r,[50,100,200]), v = rd(D*Vs*(1-D)/(f*1e3*L*1e-6), 4);
  return {p:{Vs,D,f,L}, v, tol:0.006, q:R`A buck converter has \(V_s=${Vs}\) V, D = ${D}, f = ${f} kHz and L = ${L} µH. Find the peak-to-peak inductor ripple in A, to 2 decimals.`,
    why:R`\(\frac{V_o(1-D)}{fL}=\frac{${D*Vs}\times${1-D}}{${f*1000}\times${L}\times10^{-6}}\approx${rd(v,2)}\) A.`}; });
gen('pe.boostripple', r => { const Vs = pk(r,[12,24]), D = pk(r,[0.25,0.5,0.6]), f = pk(r,[20,50,100]), L = pk(r,[60,100,120,200]), v = rd(Vs*D/(f*1e3*L*1e-6), 4);
  return {p:{Vs,D,f,L}, v, tol:0.006, q:R`A boost converter has \(V_s=${Vs}\) V, D = ${D}, f = ${f} kHz and L = ${L} µH. Find the peak-to-peak inductor ripple in A, to 2 decimals.`,
    why:R`\(\frac{V_sD}{fL}\approx${rd(v,2)}\) A.`}; });
gen('pe.lcritnat', r => { const D = pk(r,[0.2,0.25,0.4,0.5,0.6]), R1 = pk(r,[5,10,20]), f = pk(r,[10,20,25,50]), v = rd((1-D)*R1/(2*f*1e3)*1e6, 4);
  return {p:{D,R:R1,f}, v, tol:0.06, q:R`A buck converter has D = ${D}, R = ${R1} Ω and f = ${f} kHz. Find the critical inductance in µH, to 1 decimal.`,
    why:R`\(\frac{${rd(1-D,2)}\times${R1}}{2\times${f*1000}}\approx${rd(v,1)}\) µH.`}; });
gen('pe.fwnat', r => { const V = pk(r,[110,120,200,230,240]), v = rd(2*SQ2*V/Math.PI, 4);
  return {p:{V}, v, tol:0.1, q:R`A single-phase diode bridge with an R load is fed from ${V} V (rms). Find the average output voltage, to 1 decimal.`,
    why:R`\(0.9003\times${V}\approx${rd(v,1)}\) V.`}; });
gen('pe.b3nat', r => { const V = pk(r,[208,380,400,415,440]), v = rd(3*SQ2*V/Math.PI, 4);
  return {p:{V}, v, tol:0.2, q:R`A three-phase diode bridge is fed from ${V} V (line, rms). Find the average output voltage, to 1 decimal.`,
    why:R`\(1.3505\times${V}\approx${rd(v,1)}\) V.`}; });
gen('pe.hw3', r => { const V = pk(r,[120,220,230,240]), v = rd(3*Math.sqrt(6)/(2*Math.PI)*V, 4);
  return {p:{V}, v, tol:0.2, q:R`A three-phase half-wave (3-pulse) diode rectifier is fed from ${V} V phase (rms). Find the average output voltage, to 1 decimal.`,
    why:R`\(1.1695\times${V}\approx${rd(v,1)}\) V.`}; });
gen('pe.capfilt', r => { const I = pk(r,[0.5,1,2]), C = pk(r,[470,1000,2200]), f = pk(r,[50,60]), v = rd(I/(2*f*C*1e-6), 4);
  return {p:{I,C,f}, v, tol:0.06, q:R`A full-wave rectifier with a ${C} µF capacitor filter supplies ${I} A on a ${f} Hz supply. Estimate the peak-to-peak ripple voltage in V, to 1 decimal.`,
    why:R`\(\frac{I}{2fC}=\frac{${I}}{2\times${f}\times${C}\times10^{-6}}\approx${rd(v,1)}\) V.`}; });
gen('pe.rle', r => { const Vm = pk(r,[100,200,325]), k = pk(r,[0.25,0.5,0.6,0.75,0.8]), E = rd(k*Vm, 4), v = rd(deg(Math.asin(k)), 4);
  return {p:{Vm,E}, v, tol:0.06, q:R`A half-wave diode charger has \(V_m=${Vm}\) V and battery emf E = ${E} V (resistive limiting). At what angle (degrees) does the diode start to conduct? Give 1 decimal.`,
    why:R`\(\sin^{-1}(${E}/${Vm})\approx${rd(v,1)}^\circ\).`}; });
gen('pe.fcnat', r => { const V = pk(r,[120,200,230,240]), a = pk(r,[0,15,30,45,60,75]), v = rd(2*SQ2*V/Math.PI*Math.cos(rad(a)), 4);
  return {p:{V,a}, v, tol:0.1, q:R`A single-phase full converter on ${V} V (rms) has firing angle ${a}° and continuous load current. Find \(V_{dc}\), to 1 decimal.`,
    why:R`\(0.9003\times${V}\times\cos${a}^\circ\approx${rd(v,1)}\) V.`}; });
gen('pe.seminat', r => { const V = pk(r,[120,200,230,240]), a = pk(r,[30,45,60,90,120]), v = rd(SQ2*V/Math.PI*(1+Math.cos(rad(a))), 4);
  return {p:{V,a}, v, tol:0.1, q:R`A single-phase semi-converter on ${V} V (rms) is fired at α = ${a}°. Find \(V_{dc}\), to 1 decimal.`,
    why:R`\(\frac{\sqrt2\times${V}}{\pi}(1+\cos${a}^\circ)\approx${rd(v,1)}\) V.`}; });
gen('pe.hwcc', r => { const Vm = pk(r,[100,200,325,400]), a = pk(r,[0,30,45,60,90,120]), v = rd(Vm/(2*Math.PI)*(1+Math.cos(rad(a))), 4);
  return {p:{Vm,a}, v, tol:0.006, q:R`A single-phase half-wave thyristor rectifier with an R load has \(V_m=${Vm}\) V and α = ${a}°. Find \(V_{dc}\), to 2 decimals.`,
    why:R`\(\frac{${Vm}}{2\pi}(1+\cos${a}^\circ)\approx${rd(v,2)}\) V.`}; });
gen('pe.fc3nat', r => { const V = pk(r,[380,400,415,440]), a = pk(r,[0,15,30,45,60]), v = rd(3*SQ2*V/Math.PI*Math.cos(rad(a)), 4);
  return {p:{V,a}, v, tol:0.6, q:R`A three-phase full converter on ${V} V (line) is fired at α = ${a}°. Find \(V_{dc}\), to the nearest volt.`,
    why:R`\(1.3505\times${V}\times\cos${a}^\circ\approx${rd(v,0)}\) V.`}; });
gen('pe.sc3', r => { const V = pk(r,[380,400,415,440]), a = pk(r,[30,60,90,120]), v = rd(3*SQ2*V/(2*Math.PI)*(1+Math.cos(rad(a))), 4);
  return {p:{V,a}, v, tol:0.2, q:R`A three-phase semi-converter on ${V} V (line) is fired at α = ${a}°. Find \(V_{dc}\), to 1 decimal.`,
    why:R`\(\frac{1.3505\times${V}}{2}(1+\cos${a}^\circ)\approx${rd(v,1)}\) V.`}; });
gen('pe.invnat', r => { const V = pk(r,[120,200,230,240]), a = pk(r,[105,120,135,150]), v = rd(2*SQ2*V/Math.PI*Math.cos(rad(a)), 4);
  return {p:{V,a}, v, tol:0.1, q:R`A single-phase full converter on ${V} V (rms), continuous current, is fired at α = ${a}°. Find \(V_{dc}\) (with sign), to 1 decimal.`,
    why:R`\(0.9003\times${V}\times\cos${a}^\circ\approx${rd(v,1)}\) V: power flows back to the AC supply.`}; });
gen('pe.margin', r => { const tq = pk(r,[50,100,150,200,250]), f = pk(r,[50,60]), v = rd(360*f*tq*1e-6, 4);
  return {p:{tq,f}, v, tol:0.06, q:R`Thyristors with \(t_q=${tq}\) µs operate as an inverter on a ${f} Hz supply. Find the minimum margin (extinction) angle in degrees, to 1 decimal.`,
    why:R`\(\gamma=360^\circ\times${f}\times${tq}\times10^{-6}\approx${rd(v,1)}^\circ\).`}; });
gen('pe.vcommnat', r => { const I = pk(r,[20,25,50,100]), tq = pk(r,[10,20,40]), V = pk(r,[100,200,250,400]), v = rd(I*tq/V, 4);
  return {p:{I,tq,V}, v, tol:0.006, q:R`A voltage-commutated chopper carries ${I} A from a ${V} V supply. The thyristor turn-off time is ${tq} µs. Find the minimum commutating capacitance in µF, to 2 decimals.`,
    why:R`\(C=\frac{${I}\times${tq}\times10^{-6}}{${V}}\approx${rd(v,2)}\) µF.`}; });
gen('pe.overlapnat', r => { const Id = pk(r,[50,100,150,200]), X = pk(r,[0.1,0.2,0.3,0.5]), v = rd(3*X*Id/Math.PI, 4);
  return {p:{Id,X}, v, tol:0.006, q:R`A three-phase bridge carries \(I_d=${Id}\) A. Each line has reactance \(\omega L_s=${X}\) Ω. Find the drop in average output voltage due to overlap, to 2 decimals.`,
    why:R`\(\frac{3\times${X}\times${Id}}{\pi}\approx${rd(v,2)}\) V.`}; });
gen('pe.I1nat', r => { const Id = ri(r,5,50), v = rd(2*SQ2/Math.PI*Id, 4);
  return {p:{Id}, v, tol:0.006, q:R`A single-phase full converter carries \(I_d=${Id}\) A (ripple-free). Find the rms fundamental line current, to 2 decimals.`,
    why:R`\(0.9003\times${Id}\approx${rd(v,2)}\) A.`}; });
gen('pe.I1six', r => { const Id = pk(r,[20,50,80,100,150,200]), v = rd(Math.sqrt(6)/Math.PI*Id, 4);
  return {p:{Id}, v, tol:0.06, q:R`A three-phase bridge carries \(I_d=${Id}\) A (ripple-free). Find the rms fundamental line current, to 1 decimal.`,
    why:R`\(0.7797\times${Id}\approx${rd(v,1)}\) A.`}; });
gen('pe.pfnat', r => { const a = pk(r,[0,15,30,45,60,75]), v = rd(2*SQ2/Math.PI*Math.cos(rad(a)), 4);
  return {p:{a}, v, tol:0.002, q:R`A single-phase full converter with ripple-free current is fired at α = ${a}°. Find the input power factor, to 3 decimals.`,
    why:R`\(0.9003\times\cos${a}^\circ\approx${rd(v,3)}\).`}; });
gen('pe.thdnat', r => { const I1 = pk(r,[10,20,50]), I3 = ri(r,1,5), I5 = ri(r,0,4), v = rd(100*Math.sqrt(I3*I3+I5*I5)/I1, 4);
  return {p:{I1,I3,I5}, v, tol:0.06, q:R`A current has rms components \(I_1=${I1}\) A, \(I_3=${I3}\) A and \(I_5=${I5}\) A. Find its THD in %, to 1 decimal.`,
    why:R`\(\sqrt{${I3*I3}+${I5*I5}}/${I1}\approx${rd(v,1)}\%\).`}; });
gen('pe.v1nat', r => { const V = pk(r,[100,200,220,300,400]), v = rd(2*SQ2/Math.PI*V, 4);
  return {p:{V}, v, tol:0.1, q:R`A full-bridge inverter runs in square-wave mode from ${V} V DC. Find the rms fundamental output voltage, to 1 decimal.`,
    why:R`\(0.9003\times${V}\approx${rd(v,1)}\) V.`}; });
gen('pe.six180nat', r => { const V = pk(r,[300,400,500,600,700]), v = rd(Math.sqrt(2/3)*V, 4);
  return {p:{V}, v, tol:0.1, q:R`A three-phase VSI in 180° mode runs from ${V} V DC. Find the rms line voltage, to 1 decimal.`,
    why:R`\(\sqrt{2/3}\times${V}\approx${rd(v,1)}\) V.`}; });
gen('pe.v1six', r => { const V = pk(r,[300,400,500,600]), v = rd(Math.sqrt(6)/Math.PI*V, 4);
  return {p:{V}, v, tol:0.1, q:R`A six-step inverter runs from ${V} V DC. Find the rms fundamental line voltage, to 1 decimal.`,
    why:R`\(0.7797\times${V}\approx${rd(v,1)}\) V.`}; });
gen('pe.csiI1', r => { const Id = pk(r,[10,20,25,40,50]), v = rd(Math.sqrt(6)/Math.PI*Id, 4);
  return {p:{Id}, v, tol:0.006, q:R`A three-phase CSI with 120° conduction carries a DC link current of ${Id} A. Find the rms fundamental output current, to 2 decimals.`,
    why:R`\(0.7797\times${Id}\approx${rd(v,2)}\) A.`}; });
gen('pe.spwmnat', r => { const V = pk(r,[400,600,700,800]), m = pk(r,[0.5,0.6,0.8,0.9,1]), v = rd(SQ3/(2*SQ2)*m*V, 4);
  return {p:{V,m}, v, tol:0.1, q:R`A three-phase SPWM inverter runs from ${V} V DC with \(m_a=${m}\). Find the rms fundamental line voltage, to 1 decimal.`,
    why:R`Phase peak \(=${m}\times${V/2}=${rd(m*V/2,4)}\) V; line rms \(=${rd(m*V/2,4)}\times\sqrt3/\sqrt2\approx${rd(v,1)}\) V.`}; });
gen('pe.mf', r => { const m = pk(r,[9,15,21,27,33,39]), f = pk(r,[50,60]), v = m*f;
  return {p:{m,f}, v, q:R`An SPWM inverter makes ${f} Hz with \(m_f=${m}\). Around what frequency (Hz) do the dominant harmonics appear?`,
    why:R`At \(m_ff_1=${v}\) Hz (with sidebands).`}; });
gen('pe.afeP', r => { const Vs = pk(r,[230,240]), Vc = pk(r,[230,240,250]), d = pk(r,[5,10,15,20]), X = pk(r,[2,5,10]), v = rd(Vs*Vc*Math.sin(rad(d))/X, 4);
  return {p:{Vs,Vc,d,X}, v, tol:1.2, q:R`Per phase, the grid voltage is ${Vs} V and the converter voltage ${Vc} V (rms), with δ = ${d}° across X = ${X} Ω. Find the real power per phase, in W, to the nearest W.`,
    why:R`\(\frac{${Vs}\times${Vc}\times\sin${d}^\circ}{${X}}\approx${rd(v,0)}\) W.`}; });
gen('pe.afeVdc', r => { const VL = pk(r,[380,400,415,440,690]), v = rd(VL*2*SQ2/SQ3, 4);
  return {p:{VL}, v, tol:1, q:R`A three-phase SPWM rectifier (linear range, \(m_a\le1\)) must match a ${VL} V (line, rms) grid. Find the minimum DC link voltage, to the nearest volt.`,
    why:R`\(V_{dc}\ge\frac{${VL}}{0.6124}\approx${rd(v,0)}\) V.`}; });

})();
