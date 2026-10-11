/**
 * CashFlow OS: The ₹10,000 / 30-Day Real-Time Decision Simulator
 * Ultra-Dynamic, Reactive Fintech Engine
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIS ENGINE (Subtle UI Haptics) ---
  const AudioEngine = {
    enabled: true,
    ctx: null,

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        try {
          this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          console.warn('Audio not initialized:', e);
        }
      }
    },

    playTone(freq, type, duration, gainLevel = 0.08) {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    },

    click() {
      this.playTone(480, 'sine', 0.04, 0.035);
    },

    simPreview() {
      this.playTone(320, 'triangle', 0.08, 0.05);
      setTimeout(() => this.playTone(580, 'sine', 0.14, 0.06), 60);
    },

    commitSuccess() {
      this.playTone(523.25, 'triangle', 0.1, 0.08); // C5
      setTimeout(() => this.playTone(659.25, 'triangle', 0.12, 0.08), 90); // E5
      setTimeout(() => this.playTone(783.99, 'sine', 0.22, 0.09), 180); // G5
    },

    warning() {
      this.playTone(280, 'sawtooth', 0.15, 0.06);
      setTimeout(() => this.playTone(210, 'sawtooth', 0.18, 0.07), 100);
    }
  };

  // --- INITIAL DATA & CONFIGURATION ---
  const INITIAL_STATE = {
    totalIncome: 10000,
    totalDays: 30,
    currentDay: 7, // Lived-in baseline Day 7/30
    savingsTarget: 1500, // Default Goa Trip
    savingsGoalName: '🌴 Goa Trip with the Gang',
    isPlayingTimeline: false,
    selectedCategoryFilter: 'all',

    fixedCommitments: [
      { id: 'room', name: 'Room / PG Contribution', cost: 2000, category: 'living', mandatory: true, active: true, dueDay: 5 },
      { id: 'gym', name: 'Cult.fit Gym Pass', cost: 882, category: 'fitness', mandatory: false, active: true, dueDay: 1 },
      { id: 'netflix', name: 'Netflix 4K Shared Slot', cost: 199, category: 'entertainment', mandatory: false, active: true, dueDay: 1 },
      { id: 'spotify', name: 'Spotify Student Premium', cost: 119, category: 'entertainment', mandatory: false, active: true, dueDay: 1 },
      { id: 'icloud', name: 'iCloud 50GB Storage', cost: 75, category: 'tech', mandatory: false, active: false, dueDay: 10 }
    ],

    // Lived-in historical transactions (Days 1 to 7) summing to ₹1,120
    pastTransactions: [
      { id: 'tx-1', day: 1, name: 'Groceries & Essentials', amount: 340, type: 'expense', category: 'Essentials' },
      { id: 'tx-2', day: 2, name: 'Chai, Bun Maska & Snacks', amount: 110, type: 'expense', category: 'Food' },
      { id: 'tx-3', day: 3, name: 'Metro Card Smart Recharge', amount: 250, type: 'expense', category: 'Commute' },
      { id: 'tx-4', day: 4, name: 'Late Night Zomato Order', amount: 210, type: 'expense', category: 'Food' },
      { id: 'tx-5', day: 6, name: 'Stationery & Project Printouts', amount: 70, type: 'expense', category: 'Education' },
      { id: 'tx-6', day: 7, name: 'College Canteen Meal', amount: 140, type: 'expense', category: 'Food' }
    ],

    // Preset Decision Scenarios
    presets: [
      {
        id: 'p-sneakers',
        name: 'Buy Sneaker Drop on Sale',
        emoji: '👟',
        amount: 2499,
        type: 'expense',
        category: 'Lifestyle',
        desc: 'Limited edition kicks on 40% flash discount. High flex, severe capital drain.'
      },
      {
        id: 'p-cafe',
        name: 'Weekend Cafe Hop & Brunch',
        emoji: '☕',
        amount: 850,
        type: 'expense',
        category: 'Food',
        desc: 'Specialty pour-over coffee, artisanal bagel and vibe tax with the crew.'
      },
      {
        id: 'p-subs-cancel',
        name: 'Cancel Netflix & Spotify',
        emoji: '✂️',
        amount: 318,
        type: 'subscription_cancel',
        category: 'Savings',
        desc: 'Cut non-essential streaming for 1 month (+₹318 liquid recovery).'
      },
      {
        id: 'p-freelance',
        name: 'Freelance UI Gig Payout',
        emoji: '💼',
        amount: 1200,
        type: 'income',
        category: 'SideGig',
        desc: 'Landing page redesign delivery (+₹1,200 cash inflow on Day 14).'
      },
      {
        id: 'p-bike',
        name: 'Bike Puncture & Engine Oil',
        emoji: '🏍️',
        amount: 600,
        type: 'expense',
        category: 'Emergency',
        desc: 'Unplanned roadside mechanics bill to keep the two-wheeler running.'
      },
      {
        id: 'p-concert',
        name: 'Early Bird Concert Pass',
        emoji: '🎸',
        amount: 1500,
        type: 'expense',
        category: 'Lifestyle',
        desc: 'Indie music festival passes before ticket price surge next week.'
      },
      {
        id: 'p-splitwise',
        name: 'Splitwise Settlement Return',
        emoji: '🤝',
        amount: 650,
        type: 'income',
        category: 'Friends',
        desc: 'Flatmate finally settles their share from last weekend dinner.'
      },
      {
        id: 'p-zomato',
        name: 'Late-Night Craving Binge',
        emoji: '🍕',
        amount: 420,
        type: 'expense',
        category: 'Food',
        desc: 'Gourmet pizza slice + garlic bread after 1:00 AM study session.'
      }
    ],

    // Surprise Shocks Pool
    surpriseShocks: [
      { name: 'Flatmate Birthday Party Split', emoji: '🎂', amount: 750, type: 'expense', category: 'Lifestyle', desc: 'Surprise party contribution & cake slice expense.' },
      { name: 'Dental Cleaning & Filling', emoji: '🦷', amount: 1100, type: 'expense', category: 'Emergency', desc: 'Sudden toothache requiring clinic consultation.' },
      { name: 'Sold Vintage Jacket on Thrift App', emoji: '🏷️', amount: 950, type: 'income', category: 'SideGig', desc: 'Pre-loved oversized denim jacket sold on FreeUp.' },
      { name: 'Steam Gaming Summer Sale', emoji: '🎮', amount: 890, type: 'expense', category: 'Lifestyle', desc: 'Impulse purchase of 2 trending RPG titles.' },
      { name: 'College Exam Fee Fine', emoji: '📑', amount: 500, type: 'expense', category: 'Emergency', desc: 'Late submission fine for university semester paperwork.' }
    ],

    activeSimulation: null
  };

  let state = JSON.parse(JSON.stringify(INITIAL_STATE));
  let timelineInterval = null;

  // --- MATHEMATICAL CORE ENGINE ---
  function calculateEcosystem(currentState, simulationOverride = null) {
    const totalIncome = currentState.totalIncome;
    const currentDay = currentState.currentDay;
    const totalDays = currentState.totalDays;
    const remainingDays = Math.max(1, totalDays - currentDay);
    const savingsTarget = currentState.savingsTarget;

    // 1. Active Commitments
    let activeCommitmentsCost = currentState.fixedCommitments
      .filter(item => item.active)
      .reduce((acc, item) => acc + item.cost, 0);

    // 2. Discretionary Spent to Date
    let expensesToDate = currentState.pastTransactions
      .filter(tx => tx.day <= currentDay && tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);

    let additionalIncomeToDate = currentState.pastTransactions
      .filter(tx => tx.day <= currentDay && tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);

    // Apply simulation if staged
    let simAdjustedIncome = totalIncome + additionalIncomeToDate;
    let simAdjustedCommitments = activeCommitmentsCost;
    let simAdjustedExpenses = expensesToDate;

    if (simulationOverride) {
      if (simulationOverride.type === 'expense') {
        simAdjustedExpenses += simulationOverride.amount;
      } else if (simulationOverride.type === 'income') {
        simAdjustedIncome += simulationOverride.amount;
      } else if (simulationOverride.type === 'subscription_cancel') {
        simAdjustedCommitments = Math.max(0, simAdjustedCommitments - simulationOverride.amount);
      }
    }

    // 3. Available Liquid Capital
    const liquidCapital = simAdjustedIncome - simAdjustedCommitments - savingsTarget - simAdjustedExpenses;

    // 4. Safe Daily Allowance
    const safeDailyAllowance = Math.max(0, Math.floor(liquidCapital / remainingDays));

    // 5. Current Daily Burn Rate
    const burnDays = Math.max(1, currentDay);
    const currentBurnRate = simAdjustedExpenses / burnDays;

    // 6. 30-Day End-of-Month Forecast
    const projectedRemainingSpend = currentBurnRate * remainingDays;
    const projectedMonthEndBalance = liquidCapital - projectedRemainingSpend;

    // 7. Days of Runway & Projected Broke Day
    let runwayDays = currentBurnRate > 0 ? (liquidCapital / currentBurnRate) : (remainingDays + 10);
    let projectedBrokeDay = null;
    let isSolvent = true;

    if (runwayDays < remainingDays) {
      projectedBrokeDay = Math.min(30, currentDay + Math.max(0, Math.floor(runwayDays)));
      isSolvent = false;
    }

    // 8. Financial Risk Index (0 - 100)
    let riskIndex = 0;
    if (safeDailyAllowance >= 250) riskIndex += 5;
    else if (safeDailyAllowance >= 180) riskIndex += 15;
    else if (safeDailyAllowance >= 130) riskIndex += 28;
    else if (safeDailyAllowance >= 80) riskIndex += 38;
    else riskIndex += 45;

    if (!isSolvent) {
      const daysShort = remainingDays - runwayDays;
      const severity = Math.min(1, daysShort / remainingDays);
      riskIndex += Math.round(20 + severity * 15);
    } else {
      riskIndex += 5;
    }

    if (liquidCapital <= 500) riskIndex += 20;
    else if (liquidCapital <= 1500) riskIndex += 12;
    else if (liquidCapital <= 3000) riskIndex += 6;

    riskIndex = Math.min(100, Math.max(0, riskIndex));

    // 9. Savings Goal Arrival Probability
    let savingsProbability = 0;
    if (projectedMonthEndBalance >= 0) {
      savingsProbability = Math.min(99, Math.max(85, Math.round(92 + (projectedMonthEndBalance / 1000) * 4)));
    } else {
      const deficit = Math.abs(projectedMonthEndBalance);
      if (deficit >= savingsTarget) {
        savingsProbability = Math.max(0, Math.round(25 - (deficit - savingsTarget) / 200));
      } else {
        savingsProbability = Math.max(10, Math.round(((savingsTarget - deficit) / savingsTarget) * 80));
      }
    }

    // 10. Financial Health Score & Grade
    let healthScore = Math.round(
      (savingsProbability * 0.35) +
      (Math.max(0, 100 - riskIndex) * 0.40) +
      (Math.min(100, (liquidCapital / 4000) * 100) * 0.25)
    );
    healthScore = Math.min(100, Math.max(5, healthScore));

    let healthGrade = 'A+';
    if (healthScore >= 90) healthGrade = 'A+';
    else if (healthScore >= 80) healthGrade = 'A';
    else if (healthScore >= 70) healthGrade = 'B';
    else if (healthScore >= 55) healthGrade = 'C';
    else if (healthScore >= 40) healthGrade = 'D';
    else healthGrade = 'F';

    return {
      totalIncome: simAdjustedIncome,
      currentDay,
      totalDays,
      remainingDays,
      activeCommitmentsCost: simAdjustedCommitments,
      savingsTarget,
      expensesToDate: simAdjustedExpenses,
      liquidCapital,
      safeDailyAllowance,
      currentBurnRate,
      projectedMonthEndBalance,
      runwayDays,
      projectedBrokeDay,
      isSolvent,
      riskIndex,
      savingsProbability,
      healthScore,
      healthGrade
    };
  }

  // --- TRAJECTORY POINTS CALCULATOR ---
  function computeTrajectoryPoints(currentState, simulationOverride = null) {
    const ecosystem = calculateEcosystem(currentState, simulationOverride);
    const totalDays = currentState.totalDays;
    const currentDay = currentState.currentDay;
    const startCapital = currentState.totalIncome - ecosystem.activeCommitmentsCost - currentState.savingsTarget;

    const points = [];
    let runningSpend = 0;

    for (let day = 1; day <= currentDay; day++) {
      const dayTx = currentState.pastTransactions
        .filter(t => t.day === day && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      runningSpend += dayTx;
      points.push({
        day,
        balance: Math.round(startCapital - runningSpend),
        isPast: true
      });
    }

    let simDrop = 0;
    if (simulationOverride) {
      if (simulationOverride.type === 'expense') simDrop = simulationOverride.amount;
      else if (simulationOverride.type === 'income') simDrop = -simulationOverride.amount;
      else if (simulationOverride.type === 'subscription_cancel') simDrop = -simulationOverride.amount;
    }

    const currentBalance = points[points.length - 1].balance - simDrop;
    const dailyRate = Math.max(20, ecosystem.currentBurnRate);

    for (let day = currentDay + 1; day <= totalDays; day++) {
      const daysAhead = day - currentDay;
      const projectedBalance = Math.round(currentBalance - (dailyRate * daysAhead));
      points.push({
        day,
        balance: projectedBalance,
        isPast: false
      });
    }

    return points;
  }

  // --- RETINA CANVAS 2D CHART ENGINE ---
  const ChartEngine = {
    canvas: null,
    ctx: null,
    hoveredIndex: -1,
    baselinePoints: [],
    ghostPoints: [],

    init() {
      this.canvas = document.getElementById('trajectoryChart');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.bindEvents();
      this.resize();
      window.addEventListener('resize', () => {
        this.resize();
        this.render();
      });
    },

    resize() {
      if (!this.canvas) return;
      const container = this.canvas.parentElement;
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;
      this.ctx.resetTransform?.();
      this.ctx.scale(dpr, dpr);
    },

    bindEvents() {
      const tooltip = document.getElementById('chartTooltip');
      if (!this.canvas || !tooltip) return;

      const handleMove = (e) => {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const width = rect.width;
        const paddingLeft = 45;
        const paddingRight = 20;
        const chartWidth = width - paddingLeft - paddingRight;

        if (mouseX < paddingLeft || mouseX > width - paddingRight) {
          tooltip.style.display = 'none';
          this.hoveredIndex = -1;
          this.render();
          return;
        }

        const ratio = (mouseX - paddingLeft) / chartWidth;
        const day = Math.min(30, Math.max(1, Math.round(1 + ratio * 29)));
        this.hoveredIndex = day - 1;

        const basePt = this.baselinePoints[this.hoveredIndex];
        const ghostPt = this.ghostPoints && this.ghostPoints[this.hoveredIndex];

        if (basePt) {
          tooltip.style.display = 'block';
          tooltip.style.left = `${mouseX}px`;
          tooltip.style.top = `${rect.height / 2}px`;

          document.getElementById('ttDayTitle').textContent = `Day ${basePt.day} of 30`;
          document.getElementById('ttBaselineVal').textContent = `₹${basePt.balance.toLocaleString('en-IN')}`;

          const ghostRow = document.getElementById('ttGhostRow');
          if (ghostPt && state.activeSimulation) {
            ghostRow.style.display = 'flex';
            document.getElementById('ttGhostVal').textContent = `₹${ghostPt.balance.toLocaleString('en-IN')}`;
          } else {
            ghostRow.style.display = 'none';
          }

          const statusVal = document.getElementById('ttStatusVal');
          const targetBal = ghostPt && state.activeSimulation ? ghostPt.balance : basePt.balance;
          if (targetBal <= 0) {
            statusVal.textContent = 'Broke / Debt 🚨';
            statusVal.style.color = '#ff2a5f';
          } else if (targetBal < 500) {
            statusVal.textContent = 'Danger Zone (<₹500)';
            statusVal.style.color = '#ffaa00';
          } else {
            statusVal.textContent = 'Safe Capital Zone ✅';
            statusVal.style.color = '#00f59b';
          }
        }

        this.render();
      };

      this.canvas.addEventListener('mousemove', handleMove);
      this.canvas.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
        this.hoveredIndex = -1;
        this.render();
      });

      this.canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) handleMove(e.touches[0]);
      }, { passive: true });

      this.canvas.addEventListener('touchend', () => {
        tooltip.style.display = 'none';
        this.hoveredIndex = -1;
        this.render();
      });
    },

    render() {
      if (!this.ctx || !this.canvas) return;

      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const ctx = this.ctx;

      ctx.clearRect(0, 0, w, h);

      this.baselinePoints = computeTrajectoryPoints(state, null);
      this.ghostPoints = state.activeSimulation ? computeTrajectoryPoints(state, state.activeSimulation) : null;

      const pLeft = 45;
      const pRight = 20;
      const pTop = 20;
      const pBottom = 35;
      const chartW = w - pLeft - pRight;
      const chartH = h - pTop - pBottom;

      let minVal = -1000;
      let maxVal = 5500;
      const allValues = this.baselinePoints.map(p => p.balance);
      if (this.ghostPoints) allValues.push(...this.ghostPoints.map(p => p.balance));
      minVal = Math.min(-1000, ...allValues);
      maxVal = Math.max(5500, ...allValues);

      const getX = (day) => pLeft + ((day - 1) / 29) * chartW;
      const getY = (val) => pTop + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

      // 1. Grid & Y-Ticks
      const gridTicks = [0, 500, 1500, 3000, 4500];
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      gridTicks.forEach(tick => {
        const y = getY(tick);
        if (y >= pTop && y <= pTop + chartH) {
          ctx.strokeStyle = tick === 500 ? 'rgba(255, 42, 95, 0.45)' : 'rgba(255, 255, 255, 0.06)';
          ctx.lineWidth = tick === 500 ? 1.5 : 1;
          ctx.setLineDash(tick === 500 ? [4, 4] : []);
          ctx.beginPath();
          ctx.moveTo(pLeft, y);
          ctx.lineTo(w - pRight, y);
          ctx.stroke();

          ctx.fillStyle = tick === 500 ? '#ff2a5f' : '#64748b';
          ctx.fillText(`₹${tick}`, pLeft - 8, y);
        }
      });
      ctx.setLineDash([]);

      // 2. Danger Zone Shading (< ₹500)
      const dangerY = getY(500);
      if (dangerY <= pTop + chartH) {
        const dangerGrad = ctx.createLinearGradient(0, dangerY, 0, pTop + chartH);
        dangerGrad.addColorStop(0, 'rgba(255, 42, 95, 0.16)');
        dangerGrad.addColorStop(1, 'rgba(255, 42, 95, 0.02)');
        ctx.fillStyle = dangerGrad;
        ctx.fillRect(pLeft, dangerY, chartW, (pTop + chartH) - dangerY);
      }

      // 3. X-Axis Day Labels
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = '#64748b';
      [1, 5, 10, 15, 20, 25, 30].forEach(day => {
        const x = getX(day);
        ctx.fillText(`D${day}`, x, pTop + chartH + 10);
      });

      // 4. Current Day Vertical Marker
      const curX = getX(state.currentDay);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(curX, pTop);
      ctx.lineTo(curX, pTop + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#00d2ff';
      ctx.font = 'bold 9px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`Today (D${state.currentDay})`, curX, pTop - 12);

      // 5. Past Trajectory (Days 1 to currentDay) in Spring Mint
      ctx.strokeStyle = '#00f298';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      for (let i = 0; i < state.currentDay; i++) {
        const pt = this.baselinePoints[i];
        const x = getX(pt.day);
        const y = getY(pt.balance);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (let i = 0; i < state.currentDay; i++) {
        const pt = this.baselinePoints[i];
        const x = getX(pt.day);
        const y = getY(pt.balance);
        ctx.fillStyle = '#07090e';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00f298';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 6. Projected Trajectory in Electric Cyan
      ctx.strokeStyle = '#00d2ff';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (let i = state.currentDay - 1; i < this.baselinePoints.length; i++) {
        const pt = this.baselinePoints[i];
        const x = getX(pt.day);
        const y = getY(pt.balance);
        if (i === state.currentDay - 1) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // 7. Ghost Trajectory in Pulsing Vivid Magenta
      if (this.ghostPoints && state.activeSimulation) {
        ctx.strokeStyle = '#e024c3';
        ctx.lineWidth = 3.5;
        ctx.setLineDash([6, 5]);
        ctx.shadowColor = 'rgba(224, 36, 195, 0.8)';
        ctx.shadowBlur = 14;

        ctx.beginPath();
        for (let i = state.currentDay - 1; i < this.ghostPoints.length; i++) {
          const pt = this.ghostPoints[i];
          const x = getX(pt.day);
          const y = getY(pt.balance);
          if (i === state.currentDay - 1) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }

      // 8. Hover Crosshair & Circles
      if (this.hoveredIndex >= 0 && this.hoveredIndex < this.baselinePoints.length) {
        const hPt = this.baselinePoints[this.hoveredIndex];
        const hX = getX(hPt.day);
        const hY = getY(hPt.balance);

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(hX, pTop);
        ctx.lineTo(hX, pTop + chartH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#00f59b';
        ctx.beginPath();
        ctx.arc(hX, hY, 6, 0, Math.PI * 2);
        ctx.fill();

        if (this.ghostPoints && this.ghostPoints[this.hoveredIndex]) {
          const ghPt = this.ghostPoints[this.hoveredIndex];
          const ghY = getY(ghPt.balance);
          ctx.fillStyle = '#ff007f';
          ctx.beginPath();
          ctx.arc(hX, ghY, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  };

  // --- CONFETTI PARTICLE SYSTEM ---
  const Confetti = {
    canvas: null,
    ctx: null,
    particles: [],
    animId: null,

    init() {
      this.canvas = document.getElementById('confettiCanvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      window.addEventListener('resize', () => this.resize());
    },

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    },

    fire(count = 75) {
      this.init();
      const colors = ['#00f59b', '#00e5ff', '#ffaa00', '#ff007f', '#8b5cf6'];
      for (let i = 0; i < count; i++) {
        this.particles.push({
          x: window.innerWidth * (0.3 + Math.random() * 0.4),
          y: window.innerHeight * 0.6,
          vx: (Math.random() - 0.5) * 14,
          vy: -Math.random() * 12 - 4,
          size: Math.random() * 8 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          vRot: (Math.random() - 0.5) * 10,
          opacity: 1
        });
      }

      if (!this.animId) this.animate();
    },

    animate() {
      if (this.particles.length === 0) {
        this.animId = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        return;
      }

      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.vRot;
        p.opacity -= 0.015;

        if (p.opacity <= 0 || p.y > window.innerHeight) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.globalAlpha = p.opacity;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        this.ctx.restore();
      }

      this.animId = requestAnimationFrame(() => this.animate());
    }
  };

  // --- TOAST NOTIFICATIONS ---
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div style="font-size:1.2rem;">${type === 'success' ? '⚡' : '⚠️'}</div>
      <div>${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 20);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }

  // --- MOUSE SPOTLIGHT EFFECT ---
  function initMouseSpotlight() {
    const spotlight = document.getElementById('mouseSpotlight');
    if (!spotlight) return;

    window.addEventListener('mousemove', (e) => {
      spotlight.style.left = `${e.clientX}px`;
      spotlight.style.top = `${e.clientY}px`;
    });
  }

  // --- PHYSICAL 3D TITANIUM CARD TILT & SHEEN ---
  function initCard3DTilt() {
    const card = document.getElementById('titaniumDebitCard');
    if (!card) return;
    const sheen = card.querySelector('.card-holographic-sheen');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 12;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      if (sheen) {
        sheen.style.transform = `translate(${((x - centerX) / centerX) * 40}px, ${((y - centerY) / centerY) * 40}px) rotate(25deg)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (sheen) sheen.style.transform = 'translate(0px, 0px) rotate(25deg)';
    });
  }

  // --- APPLICATION STATE RENDERING ---
  function renderApp() {
    const baseline = calculateEcosystem(state, null);
    const hasSim = state.activeSimulation !== null;
    const sim = hasSim ? calculateEcosystem(state, state.activeSimulation) : null;

    if (hasSim) {
      document.body.classList.add('simulation-active');
    } else {
      document.body.classList.remove('simulation-active');
    }

    // 1. Timeline & Header Controls
    const slider = document.getElementById('dayTimelineSlider');
    slider.value = state.currentDay;
    slider.style.background = `linear-gradient(90deg, #00d2ff 0%, #0072ff ${(state.currentDay/30)*100}%, rgba(255, 255, 255, 0.12) ${(state.currentDay/30)*100}%)`;

    document.getElementById('dayCountDisplay').textContent = `Day ${state.currentDay < 10 ? '0' + state.currentDay : state.currentDay} of 30`;
    document.getElementById('ledgerDaySpan').textContent = state.currentDay;

    const cardChip = document.getElementById('cardDayChip');
    if (cardChip) {
      cardChip.textContent = `DAY ${state.currentDay < 10 ? '0' + state.currentDay : state.currentDay} / 30`;
    }

    // Health Score Badge
    const effectiveHealth = hasSim ? sim.healthScore : baseline.healthScore;
    const effectiveGrade = hasSim ? sim.healthGrade : baseline.healthGrade;
    document.getElementById('healthGradeBox').textContent = effectiveGrade;
    document.getElementById('healthScoreDisplay').textContent = `${effectiveHealth}/100`;

    const healthSub = document.getElementById('heroHealthSubText');
    if (healthSub) {
      const prob = hasSim ? sim.savingsProbability : baseline.savingsProbability;
      healthSub.textContent = `${state.savingsGoalName}: ${prob}% Protected`;
    }

    // 2. Interactive Capital Allocation Strip
    const totalCap = 10000;
    const pLiquid = Math.max(0, (baseline.liquidCapital / totalCap) * 100);
    const pFixed = (baseline.activeCommitmentsCost / totalCap) * 100;
    const pSavings = (state.savingsTarget / totalCap) * 100;
    const pSpent = Math.max(0, (baseline.expensesToDate / totalCap) * 100);

    document.getElementById('segLiquid').style.width = `${pLiquid.toFixed(1)}%`;
    document.getElementById('segFixed').style.width = `${pFixed.toFixed(1)}%`;
    document.getElementById('segSavings').style.width = `${pSavings.toFixed(1)}%`;
    document.getElementById('segSpent').style.width = `${pSpent.toFixed(1)}%`;

    document.getElementById('allocSummaryText').textContent = `₹${baseline.liquidCapital.toLocaleString('en-IN')} Unlocked Liquid`;
    document.getElementById('allocValLiquid').textContent = `₹${baseline.liquidCapital.toLocaleString('en-IN')} (${pLiquid.toFixed(1)}%)`;
    document.getElementById('allocValFixed').textContent = `₹${baseline.activeCommitmentsCost.toLocaleString('en-IN')} (${pFixed.toFixed(1)}%)`;
    document.getElementById('allocValSavings').textContent = `₹${state.savingsTarget.toLocaleString('en-IN')} (${pSavings.toFixed(1)}%)`;
    document.getElementById('allocValSpent').textContent = `₹${baseline.expensesToDate.toLocaleString('en-IN')} (${pSpent.toFixed(1)}%)`;

    // 3. Simulation Active Alert Banner
    const simBanner = document.getElementById('simulationActiveBanner');
    if (hasSim) {
      simBanner.classList.add('visible');
      const action = state.activeSimulation;
      const typeSign = action.type === 'expense' ? '-₹' : '+₹';
      document.getElementById('simBannerDescription').textContent = 
        `Testing Move: "${action.name} (${typeSign}${action.amount.toLocaleString('en-IN')})"`;
    } else {
      simBanner.classList.remove('visible');
    }

    // 4. Hero Metrics Cards
    document.getElementById('valLiquidCapital').textContent = `₹${baseline.liquidCapital.toLocaleString('en-IN')}`;
    const deltaLiquidPill = document.getElementById('deltaLiquidPill');
    if (hasSim) {
      const diff = sim.liquidCapital - baseline.liquidCapital;
      deltaLiquidPill.innerHTML = `
        <span>Sim: ₹${sim.liquidCapital.toLocaleString('en-IN')}</span>
        <span class="diff">(${diff >= 0 ? '+' : ''}₹${diff.toLocaleString('en-IN')})</span>
      `;
      deltaLiquidPill.className = `delta-ghost-pill ${diff >= 0 ? 'positive' : 'negative'}`;
    }

    document.getElementById('valDailyAllowance').textContent = `₹${baseline.safeDailyAllowance}`;
    document.getElementById('allowanceDaysNote').textContent = `Across ${baseline.remainingDays} remaining days`;
    const deltaAllowancePill = document.getElementById('deltaAllowancePill');
    if (hasSim) {
      const diff = sim.safeDailyAllowance - baseline.safeDailyAllowance;
      const pct = baseline.safeDailyAllowance > 0 
        ? Math.round((diff / baseline.safeDailyAllowance) * 100) 
        : 0;
      deltaAllowancePill.innerHTML = `
        <span>Sim: ₹${sim.safeDailyAllowance}/day</span>
        <span class="diff">(${diff >= 0 ? '+' : ''}${diff} / ${pct}%)</span>
      `;
      deltaAllowancePill.className = `delta-ghost-pill ${diff >= 0 ? 'positive' : 'negative'}`;
    }

    const balanceSign = baseline.projectedMonthEndBalance >= 0 ? '+' : '';
    document.getElementById('valMonthEnd').textContent = `${balanceSign}₹${baseline.projectedMonthEndBalance.toLocaleString('en-IN')}`;
    document.getElementById('burnTrajectoryNote').textContent = `Trajectory at ₹${baseline.currentBurnRate.toFixed(1)}/day burn`;

    const deltaMonthEndPill = document.getElementById('deltaMonthEndPill');
    if (hasSim) {
      const sDiff = sim.projectedMonthEndBalance - baseline.projectedMonthEndBalance;
      const sSign = sim.projectedMonthEndBalance >= 0 ? '+' : '';
      deltaMonthEndPill.innerHTML = `
        <span>Sim: ${sSign}₹${sim.projectedMonthEndBalance.toLocaleString('en-IN')}</span>
        <span class="diff">(${sDiff >= 0 ? '+' : ''}₹${sDiff.toLocaleString('en-IN')})</span>
      `;
      deltaMonthEndPill.className = `delta-ghost-pill ${sDiff >= 0 ? 'positive' : 'negative'}`;
    }

    document.getElementById('valRiskScore').textContent = `${baseline.riskIndex}`;
    const riskBadge = document.getElementById('riskStatusBadge');
    if (baseline.riskIndex < 30) {
      riskBadge.textContent = 'Low Risk';
      riskBadge.className = 'status-pill status-safe';
    } else if (baseline.riskIndex < 60) {
      riskBadge.textContent = 'Moderate Caution';
      riskBadge.className = 'status-pill status-warning';
    } else {
      riskBadge.textContent = 'High Risk';
      riskBadge.className = 'status-pill status-danger';
    }
    document.getElementById('riskFactorSummary').textContent = 
      `Runway: ${baseline.runwayDays.toFixed(1)} days • Buffer: ${baseline.liquidCapital > 1000 ? 'Stable' : 'Low'}`;

    const deltaRiskPill = document.getElementById('deltaRiskPill');
    if (hasSim) {
      const rDiff = sim.riskIndex - baseline.riskIndex;
      deltaRiskPill.innerHTML = `
        <span>Sim: ${sim.riskIndex}/100</span>
        <span class="diff">(${rDiff >= 0 ? '+' : ''}${rDiff} pts)</span>
      `;
      deltaRiskPill.className = `delta-ghost-pill ${rDiff <= 0 ? 'positive' : 'negative'}`;
    }

    // 5. Trajectory Micro Metrics
    document.getElementById('insightBurnRate').textContent = `₹${baseline.currentBurnRate.toFixed(2)} / day`;
    document.getElementById('insightRunway').textContent = `${baseline.runwayDays.toFixed(1)} Days Remaining`;
    const brokeInsight = document.getElementById('insightBrokeDay');
    if (hasSim && !sim.isSolvent) {
      brokeInsight.textContent = `⚡ Broke on Day ${sim.projectedBrokeDay}!`;
      brokeInsight.style.color = '#ff3366';
    } else if (!baseline.isSolvent) {
      brokeInsight.textContent = `⚡ Broke on Day ${baseline.projectedBrokeDay}!`;
      brokeInsight.style.color = '#ff3366';
    } else {
      brokeInsight.textContent = 'Financially Solvent ✅';
      brokeInsight.style.color = '#00f298';
    }

    const ghostLegend = document.getElementById('ghostLegendItem');
    if (ghostLegend) {
      ghostLegend.style.display = hasSim ? 'flex' : 'none';
    }

    // 6. Savings Goal
    document.getElementById('savingsGoalAmount').textContent = `₹${state.savingsTarget.toLocaleString('en-IN')}`;
    document.getElementById('savingsTargetSlider').value = state.savingsTarget;
    document.getElementById('sliderSavingsDisplay').textContent = `₹${state.savingsTarget.toLocaleString('en-IN')}`;

    const probLabel = document.getElementById('savingsProbability');
    probLabel.textContent = `${baseline.savingsProbability}% Arrival Rate`;
    probLabel.style.color = baseline.savingsProbability >= 75 ? '#00f298' : (baseline.savingsProbability >= 45 ? '#ffaa00' : '#ff3366');

    document.getElementById('savingsProgressFill').style.width = `${Math.min(100, Math.max(5, baseline.savingsProbability))}%`;
    const ghostBar = document.getElementById('savingsProgressGhost');
    if (hasSim) {
      ghostBar.style.width = `${Math.min(100, Math.max(5, sim.savingsProbability))}%`;
    }

    // 7. Subscriptions, Presets, Ledger
    renderSubscriptionsList();
    renderPresetsDeck();
    renderTransactionLedger();

    // 8. Vibe Check AI & Floating Dock
    updateVibeCheckAI(baseline, sim);
    updateFloatingDock(baseline, sim);
    updateDrawerImpactBox(baseline, sim);

    // 9. Trajectory Chart
    ChartEngine.render();
  }

  // --- RENDER SUBSCRIPTIONS LIST ---
  function renderSubscriptionsList() {
    const list = document.getElementById('subscriptionsList');
    if (!list) return;

    const totalVal = state.fixedCommitments
      .filter(s => s.active)
      .reduce((sum, s) => sum + s.cost, 0);
    document.getElementById('totalCommitmentsVal').textContent = `₹${totalVal.toLocaleString('en-IN')}`;

    list.innerHTML = '';
    state.fixedCommitments.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = `sub-item-row ${!item.active ? 'paused' : ''}`;
      itemEl.innerHTML = `
        <div class="sub-left-meta">
          <div class="sub-merchant-badge ${item.id}">
            ${item.id === 'room' ? '🏠' : item.id === 'gym' ? '💪' : item.id === 'netflix' ? '🎬' : item.id === 'spotify' ? '🎧' : '☁️'}
          </div>
          <div class="sub-info-text">
            <h4>${item.name}</h4>
            <p>${item.mandatory ? 'Essential Living Obligation' : 'Monthly Recurring'}</p>
          </div>
        </div>
        <div class="sub-right-ctrl">
          <span class="sub-price-num" style="${!item.active ? 'text-decoration:line-through;color:var(--text-3);' : ''}">₹${item.cost}</span>
          <label class="switch">
            <input type="checkbox" ${item.active ? 'checked' : ''} ${item.mandatory ? 'disabled' : ''} data-sub-id="${item.id}">
            <span class="slider-toggle"></span>
          </label>
        </div>
      `;

      const input = itemEl.querySelector('input');
      if (input && !item.mandatory) {
        input.addEventListener('change', (e) => {
          item.active = e.target.checked;
          AudioEngine.click();
          showToast(
            item.active 
              ? `Re-activated ${item.name} (₹${item.cost})` 
              : `Paused ${item.name} (+₹${item.cost} liquid saved!)`,
            item.active ? 'alert' : 'success'
          );
          renderApp();
        });
      }

      list.appendChild(itemEl);
    });
  }

  // --- RENDER PRESETS DECK ---
  function renderPresetsDeck() {
    const grid = document.getElementById('scenariosGrid');
    const drawerList = document.getElementById('drawerPresetsList');
    if (!grid) return;

    grid.innerHTML = '';
    if (drawerList) drawerList.innerHTML = '';

    const filter = state.selectedCategoryFilter;
    const filteredPresets = filter === 'all' 
      ? state.presets 
      : state.presets.filter(p => p.category === filter);

    filteredPresets.forEach(p => {
      const card = document.createElement('div');
      card.className = 'tactile-scenario-pad';
      const costSign = p.type === 'expense' ? '-₹' : '+₹';
      const costClass = p.type === 'expense' ? 'expense' : 'income';

      card.innerHTML = `
        <div class="pad-header">
          <div class="pad-title-group">
            <span class="pad-emoji">${p.emoji}</span>
            <span class="pad-title">${p.name}</span>
          </div>
          <span class="pad-price-tag ${costClass}">${costSign}${p.amount.toLocaleString('en-IN')}</span>
        </div>
        <p class="pad-desc">${p.desc}</p>
        <div class="pad-action-row">
          <button class="btn-pad-sim" data-sim-id="${p.id}">
            🔮 Preview
          </button>
          <button class="btn-pad-commit" data-commit-id="${p.id}">
            ⚡ Commit
          </button>
        </div>
      `;

      card.querySelector('[data-sim-id]').addEventListener('click', (e) => {
        e.stopPropagation();
        stageSimulation(p);
      });

      card.querySelector('[data-commit-id]').addEventListener('click', (e) => {
        e.stopPropagation();
        commitActionDirect(p);
      });

      grid.appendChild(card);

      if (drawerList) {
        const dItem = document.createElement('div');
        dItem.className = 'sub-item-row';
        dItem.style.cursor = 'pointer';
        dItem.innerHTML = `
          <div class="sub-left-meta">
            <span style="font-size:1.3rem;">${p.emoji}</span>
            <div class="sub-info-text">
              <h4>${p.name}</h4>
              <p>${p.desc}</p>
            </div>
          </div>
          <div class="sub-right-ctrl">
            <span class="pad-price-tag ${costClass}">${costSign}${p.amount}</span>
            <button class="btn-pad-sim" style="padding:6px 12px;" data-drawer-sim-id="${p.id}">
              Simulate
            </button>
          </div>
        `;
        dItem.querySelector('[data-drawer-sim-id]').addEventListener('click', () => {
          stageSimulation(p);
        });
        drawerList.appendChild(dItem);
      }
    });
  }

  // --- RENDER TRANSACTION LEDGER ---
  function renderTransactionLedger() {
    const list = document.getElementById('transactionLedgerList');
    if (!list) return;

    list.innerHTML = '';
    const sortedTx = [...state.pastTransactions].sort((a, b) => b.day - a.day);

    sortedTx.forEach(tx => {
      const item = document.createElement('div');
      item.className = 'tx-item';
      const isExp = tx.type === 'expense';
      item.innerHTML = `
        <div class="tx-left">
          <span class="tx-day-tag">Day ${tx.day}</span>
          <div>
            <div class="tx-name">${tx.name}</div>
            <div class="tx-cat">${tx.category}</div>
          </div>
        </div>
        <div class="tx-amount ${isExp ? 'neg' : 'pos'}">
          ${isExp ? '-₹' : '+₹'}${tx.amount.toLocaleString('en-IN')}
        </div>
      `;
      list.appendChild(item);
    });
  }

  // --- VIBE CHECK AI COPILOT LOGIC ---
  function updateVibeCheckAI(baseline, sim) {
    const quoteEl = document.getElementById('vibeAiQuote');
    const badgeEl = document.getElementById('vibeCheckBadge');
    const disciplineEl = document.getElementById('disciplineRating');
    const cookedEl = document.getElementById('broIsCookedMetric');

    const activeObj = sim || baseline;
    const isSimulated = sim !== null;

    if (activeObj.liquidCapital <= 500 || activeObj.safeDailyAllowance < 60) {
      badgeEl.textContent = 'CRITICAL PANIC 🚨';
      badgeEl.className = 'vibe-badge-pill status-danger';
      cookedEl.innerHTML = 'Bro-is-cooked meter: <strong style="color:var(--neon-crimson)">98% (FATAL)</strong>';
      disciplineEl.innerHTML = 'Discipline Rating: <strong style="color:var(--neon-crimson)">22%</strong>';
      quoteEl.innerHTML = isSimulated
        ? `"BRUH. If you commit this <strong>${state.activeSimulation.name}</strong>, your daily allowance plummets to <strong>₹${activeObj.safeDailyAllowance}/day</strong>. You will hit ₹0 on Day ${activeObj.projectedBrokeDay || 21}. You'll be surviving on tap water and campus wifi. RECONSIDER IMMEDIATELY."`
        : `"EMERGENCY: You only have <strong>₹${activeObj.liquidCapital}</strong> remaining across ${activeObj.remainingDays} days (₹${activeObj.safeDailyAllowance}/day). You're one Uber ride away from total debt. Cut subscriptions right now."`;
    } else if (activeObj.safeDailyAllowance < 140) {
      badgeEl.textContent = 'High Friction ⚠️';
      badgeEl.className = 'vibe-badge-pill status-warning';
      cookedEl.innerHTML = 'Bro-is-cooked meter: <strong style="color:var(--neon-amber)">64% (Caution)</strong>';
      disciplineEl.innerHTML = 'Discipline Rating: <strong style="color:var(--neon-amber)">58%</strong>';
      quoteEl.innerHTML = isSimulated
        ? `"Warning: This simulated move knocks your daily allowance down to <strong>₹${activeObj.safeDailyAllowance}/day</strong>. Your ${state.savingsGoalName} odds dropped to <strong>${activeObj.savingsProbability}%</strong>. You can only do this if you skip eating out all next week."`
        : `"You're currently burning cash faster than your budget allows. Your ${state.savingsGoalName} (₹${state.savingsTarget}) is under slight pressure. Hold off on impulse flexes until Day 20."`;
    } else {
      badgeEl.textContent = 'Financially Solid 🟢';
      badgeEl.className = 'vibe-badge-pill status-safe';
      cookedEl.innerHTML = 'Bro-is-cooked meter: <strong style="color:var(--neon-emerald)">4% (Chill)</strong>';
      disciplineEl.innerHTML = 'Discipline Rating: <strong style="color:var(--neon-emerald)">91% (Locked)</strong>';
      quoteEl.innerHTML = isSimulated
        ? `"Clean move. Even with this action, you maintain a <strong>₹${activeObj.safeDailyAllowance}/day</strong> safety cushion and your ${state.savingsGoalName} arrival rate stays healthy at <strong>${activeObj.savingsProbability}%</strong>. Safe to execute!"`
        : `"Pacing solidly at <strong>₹${activeObj.currentBurnRate.toFixed(1)}/day</strong>. You have <strong>₹${activeObj.liquidCapital}</strong> liquid capital untouched and ₹${state.savingsTarget} safely ring-fenced. You're in control of your financial OS."`;
    }
  }

  // --- FLOATING DOCK BAR UPDATE ---
  function updateFloatingDock(baseline, sim) {
    const dock = document.getElementById('floatingDockBar');
    const centerPreview = document.getElementById('dockCenterPreview');
    const openBtnText = document.getElementById('openDrawerBtnText');

    if (sim) {
      dock.classList.add('ghost-pulse');
      centerPreview.style.display = 'flex';
      openBtnText.textContent = 'Review & Commit';

      document.getElementById('dockHeading').textContent = `Previewing: "${state.activeSimulation.name}"`;
      document.getElementById('dockSubtitle').textContent = 'Ghost mode active • Trajectory comparison visible';

      document.getElementById('dockPreAllowance').textContent = `₹${baseline.safeDailyAllowance}`;
      document.getElementById('dockPostAllowance').textContent = `₹${sim.safeDailyAllowance}`;

      document.getElementById('dockPreRisk').textContent = `${baseline.riskIndex}`;
      document.getElementById('dockPostRisk').textContent = `${sim.riskIndex}`;
    } else {
      dock.classList.remove('ghost-pulse');
      centerPreview.style.display = 'none';
      openBtnText.textContent = 'Simulate Move';
      document.getElementById('dockHeading').textContent = 'What-If Decision Sandbox';
      document.getElementById('dockSubtitle').textContent = 'Test financial shocks & impulse buys before committing real cash';
    }
  }

  // --- DRAWER IMPACT BOX UPDATE ---
  function updateDrawerImpactBox(baseline, sim) {
    const targetSim = sim || baseline;
    const action = state.activeSimulation;

    document.getElementById('simItemNameLabel').textContent = action 
      ? `${action.name} (${action.type === 'expense' ? '-₹' : '+₹'}${action.amount.toLocaleString('en-IN')})` 
      : 'Baseline Status';

    document.getElementById('impBeforeAllowance').textContent = `₹${baseline.safeDailyAllowance}`;
    document.getElementById('impAfterAllowance').textContent = `₹${targetSim.safeDailyAllowance}`;
    const allDiff = targetSim.safeDailyAllowance - baseline.safeDailyAllowance;
    const allDelta = document.getElementById('impDeltaAllowance');
    allDelta.textContent = `${allDiff >= 0 ? '+' : ''}₹${allDiff}/day`;
    allDelta.style.color = allDiff >= 0 ? '#00f59b' : '#ff2a5f';

    document.getElementById('impBeforeSavings').textContent = `${baseline.savingsProbability}%`;
    document.getElementById('impAfterSavings').textContent = `${targetSim.savingsProbability}%`;
    const savDiff = targetSim.savingsProbability - baseline.savingsProbability;
    const savDelta = document.getElementById('impDeltaSavings');
    savDelta.textContent = `${savDiff >= 0 ? '+' : ''}${savDiff}% probability`;
    savDelta.style.color = savDiff >= 0 ? '#00f59b' : '#ff2a5f';

    document.getElementById('impBeforeRisk').textContent = `${baseline.riskIndex}`;
    document.getElementById('impAfterRisk').textContent = `${targetSim.riskIndex}`;
    const riskDiff = targetSim.riskIndex - baseline.riskIndex;
    const riskDelta = document.getElementById('impDeltaRisk');
    riskDelta.textContent = `${riskDiff >= 0 ? '+' : ''}${riskDiff} pts risk`;
    riskDelta.style.color = riskDiff <= 0 ? '#00f59b' : '#ff2a5f';

    document.getElementById('impBeforeHealth').textContent = `${baseline.healthGrade} (${baseline.healthScore})`;
    document.getElementById('impAfterHealth').textContent = `${targetSim.healthGrade} (${targetSim.healthScore})`;
    const hlthDiff = targetSim.healthScore - baseline.healthScore;
    const hlthDelta = document.getElementById('impDeltaHealth');
    hlthDelta.textContent = `${hlthDiff >= 0 ? '+' : ''}${hlthDiff} score diff`;
    hlthDelta.style.color = hlthDiff >= 0 ? '#00f59b' : '#ff2a5f';

    const brokeTile = document.getElementById('impBrokeAlertTile');
    const brokeTitle = document.getElementById('impBrokeTitle');
    const brokeDesc = document.getElementById('impBrokeDesc');

    if (!targetSim.isSolvent) {
      brokeTile.className = 'broke-alert-tile';
      document.getElementById('impBrokeIcon').textContent = '⚠️';
      brokeTitle.textContent = `Projected Broke Day: Day ${targetSim.projectedBrokeDay}`;
      const daysAhead = 30 - targetSim.projectedBrokeDay;
      brokeDesc.textContent = `At this burn rate, available liquid capital hits ₹0 on Day ${targetSim.projectedBrokeDay} (${daysAhead} days before next salary).`;
    } else {
      brokeTile.className = 'broke-alert-tile safe';
      document.getElementById('impBrokeIcon').textContent = '✅';
      brokeTitle.textContent = 'Projected Broke Day: Financially Solvent';
      brokeDesc.textContent = `Current runway sustains your projected spending past Day 30 without exhausting reserves.`;
    }
  }

  // --- STAGE SIMULATION (GHOST MODE) ---
  function stageSimulation(action) {
    state.activeSimulation = action;
    AudioEngine.simPreview();
    renderApp();
    showToast(`Simulation Mode: "${action.name}" staged! Check ghost curve.`, 'success');
  }

  // --- DISCARD SIMULATION ---
  function discardSimulation() {
    if (!state.activeSimulation) return;
    state.activeSimulation = null;
    AudioEngine.click();
    renderApp();
    showToast('Simulation discarded. Baseline restored.', 'alert');
  }

  // --- COMMIT ACTION ---
  function commitSimulation() {
    if (!state.activeSimulation) return;
    const action = state.activeSimulation;

    if (action.type === 'subscription_cancel') {
      state.fixedCommitments.forEach(s => {
        if (s.id === 'netflix' || s.id === 'spotify') s.active = false;
      });
    } else {
      state.pastTransactions.push({
        id: `tx-${Date.now()}`,
        day: state.currentDay,
        name: action.name,
        amount: action.amount,
        type: action.type,
        category: action.category || 'General'
      });
    }

    state.activeSimulation = null;
    AudioEngine.commitSuccess();
    Confetti.fire(90);
    renderApp();
    closeDrawerModal();
    showToast(`Action committed! "${action.name}" applied to live ledger.`, 'success');
  }

  function commitActionDirect(action) {
    if (action.type === 'subscription_cancel') {
      state.fixedCommitments.forEach(s => {
        if (s.id === 'netflix' || s.id === 'spotify') s.active = false;
      });
    } else {
      state.pastTransactions.push({
        id: `tx-${Date.now()}`,
        day: state.currentDay,
        name: action.name,
        amount: action.amount,
        type: action.type,
        category: action.category || 'General'
      });
    }

    if (state.activeSimulation && state.activeSimulation.id === action.id) {
      state.activeSimulation = null;
    }

    AudioEngine.commitSuccess();
    Confetti.fire(70);
    renderApp();
    showToast(`Direct Commit: "${action.name}" recorded!`, 'success');
  }

  // --- DRAWER MODAL CONTROLS ---
  function openDrawerModal(tab = 'presets') {
    const modal = document.getElementById('simulatorModalBackdrop');
    if (!modal) return;
    modal.classList.add('open');
    AudioEngine.click();
    switchDrawerTab(tab === 'custom' ? 'custom' : 'presets');
  }

  function closeDrawerModal() {
    const modal = document.getElementById('simulatorModalBackdrop');
    if (!modal) return;
    modal.classList.remove('open');
    AudioEngine.click();
  }

  function switchDrawerTab(tab) {
    const tabPresetsBtn = document.getElementById('tabQuickPresetsBtn');
    const tabCustomBtn = document.getElementById('tabCustomMoveBtn');
    const presetsContent = document.getElementById('drawerPresetsTabContent');
    const customContent = document.getElementById('drawerCustomTabContent');

    if (tab === 'presets') {
      tabPresetsBtn.classList.add('active');
      tabCustomBtn.classList.remove('active');
      presetsContent.style.display = 'flex';
      customContent.style.display = 'none';
    } else {
      tabCustomBtn.classList.add('active');
      tabPresetsBtn.classList.remove('active');
      customContent.style.display = 'flex';
      presetsContent.style.display = 'none';
    }
    AudioEngine.click();
  }

  // --- TIMELINE AUTOPLAY / SCRUBBER CONTROLS ---
  function toggleTimelinePlay() {
    const btn = document.getElementById('btnPlayCycle');
    const label = document.getElementById('playCycleLabel');

    if (state.isPlayingTimeline) {
      clearInterval(timelineInterval);
      state.isPlayingTimeline = false;
      btn.classList.remove('playing');
      label.textContent = '▶ Play 30 Days';
      AudioEngine.click();
    } else {
      state.isPlayingTimeline = true;
      btn.classList.add('playing');
      label.textContent = '⏸ Pause';
      AudioEngine.click();

      timelineInterval = setInterval(() => {
        if (state.currentDay >= 30) {
          state.currentDay = 1;
        } else {
          state.currentDay++;
        }
        renderApp();

        if (state.currentDay === 30) {
          clearInterval(timelineInterval);
          state.isPlayingTimeline = false;
          btn.classList.remove('playing');
          label.textContent = '▶ Replay 30 Days';
        }
      }, 700);
    }
  }

  // --- SETUP EVENT HANDLERS ---
  function setupEvents() {
    // 1. Day Scrubber Slider
    const slider = document.getElementById('dayTimelineSlider');
    slider.addEventListener('input', (e) => {
      state.currentDay = parseInt(e.target.value, 10);
      renderApp();
    });

    // 2. Play Cycle & Next Day Buttons
    document.getElementById('btnPlayCycle').addEventListener('click', toggleTimelinePlay);
    document.getElementById('btnNextDay').addEventListener('click', () => {
      state.currentDay = Math.min(30, state.currentDay + 1);
      AudioEngine.click();
      renderApp();
    });

    // 3. Goal Presets Selector Chips
    document.querySelectorAll('.goal-preset-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.goal-preset-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.savingsTarget = parseInt(chip.dataset.goalVal, 10);
        state.savingsGoalName = chip.dataset.goalName;
        AudioEngine.click();
        showToast(`Target Goal Updated: ${chip.dataset.goalName} (₹${state.savingsTarget})`, 'success');
        renderApp();
      });
    });

    // 4. Savings Target Custom Slider
    const savingsSlider = document.getElementById('savingsTargetSlider');
    savingsSlider.addEventListener('input', (e) => {
      state.savingsTarget = parseInt(e.target.value, 10);
      renderApp();
    });

    // 5. Category Filters for Scenarios
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedCategoryFilter = chip.dataset.filter;
        AudioEngine.click();
        renderPresetsDeck();
      });
    });

    // 6. Surprise Shock Generator Button
    const triggerSurpriseShock = () => {
      const randomShock = state.surpriseShocks[Math.floor(Math.random() * state.surpriseShocks.length)];
      stageSimulation(randomShock);
      showToast(`🎲 Surprise Shock: "${randomShock.name}" staged!`, 'alert');
    };

    const btnShock = document.getElementById('btnSurpriseShock');
    if (btnShock) btnShock.addEventListener('click', triggerSurpriseShock);

    const heroShock = document.getElementById('heroSurpriseShockBtn');
    if (heroShock) heroShock.addEventListener('click', triggerSurpriseShock);

    // Hero banner shortcut buttons
    const heroSimBtn = document.getElementById('heroOpenSimBtn');
    if (heroSimBtn) heroSimBtn.addEventListener('click', () => openDrawerModal('presets'));

    const heroLogBtn = document.getElementById('heroQuickLogBtn');
    if (heroLogBtn) heroLogBtn.addEventListener('click', () => openDrawerModal('custom'));

    // 7. Audio Toggle
    const sfxBtn = document.getElementById('sfxToggleBtn');
    const sfxIconOn = document.getElementById('sfxIconOn');
    const sfxIconOff = document.getElementById('sfxIconOff');
    sfxBtn.addEventListener('click', () => {
      AudioEngine.enabled = !AudioEngine.enabled;
      sfxIconOn.style.display = AudioEngine.enabled ? 'block' : 'none';
      sfxIconOff.style.display = AudioEngine.enabled ? 'none' : 'block';
      if (AudioEngine.enabled) AudioEngine.click();
      showToast(AudioEngine.enabled ? 'Sound Effects Enabled' : 'Sound Effects Muted');
    });

    // 8. Engine Reset
    document.getElementById('resetEngineBtn').addEventListener('click', () => {
      if (state.isPlayingTimeline) clearInterval(timelineInterval);
      state = JSON.parse(JSON.stringify(INITIAL_STATE));
      AudioEngine.click();
      renderApp();
      showToast('Engine reset to Day 7 initial state!', 'alert');
    });

    // 9. Ghost Active Banner Buttons
    document.getElementById('bannerCommitBtn').addEventListener('click', commitSimulation);
    document.getElementById('bannerDiscardBtn').addEventListener('click', discardSimulation);

    // 10. Drawer Controls
    document.getElementById('btnOpenSimulatorDrawer').addEventListener('click', () => {
      openDrawerModal('presets');
    });
    document.getElementById('drawerCloseBtn').addEventListener('click', closeDrawerModal);
    document.getElementById('simulatorModalBackdrop').addEventListener('click', (e) => {
      if (e.target.id === 'simulatorModalBackdrop') closeDrawerModal();
    });

    document.getElementById('tabQuickPresetsBtn').addEventListener('click', () => switchDrawerTab('presets'));
    document.getElementById('tabCustomMoveBtn').addEventListener('click', () => switchDrawerTab('custom'));

    document.getElementById('btnDrawerCommit').addEventListener('click', () => {
      if (state.activeSimulation) {
        commitSimulation();
      } else {
        showToast('Stage or select a simulation first!', 'alert');
      }
    });

    document.getElementById('btnDrawerDiscard').addEventListener('click', () => {
      discardSimulation();
      closeDrawerModal();
    });

    document.getElementById('openCustomMoveBtn').addEventListener('click', () => {
      openDrawerModal('custom');
    });

    // 11. Custom Move Builder Form
    let customType = 'expense';
    const btnExpense = document.getElementById('btnTypeExpense');
    const btnIncome = document.getElementById('btnTypeIncome');

    btnExpense.addEventListener('click', () => {
      customType = 'expense';
      btnExpense.className = 'type-btn selected-expense';
      btnIncome.className = 'type-btn';
      AudioEngine.click();
    });

    btnIncome.addEventListener('click', () => {
      customType = 'income';
      btnIncome.className = 'type-btn selected-income';
      btnExpense.className = 'type-btn';
      AudioEngine.click();
    });

    let selectedCat = 'Lifestyle';
    document.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        selectedCat = pill.dataset.cat;
        AudioEngine.click();
      });
    });

    document.getElementById('btnApplyCustomSim').addEventListener('click', () => {
      const name = document.getElementById('customMoveName').value.trim() || 'Custom What-If Move';
      const amount = parseFloat(document.getElementById('customMoveAmount').value);

      if (isNaN(amount) || amount <= 0) {
        showToast('Please enter a valid amount in ₹', 'alert');
        AudioEngine.warning();
        return;
      }

      const customAction = {
        id: `custom-${Date.now()}`,
        name,
        amount,
        type: customType,
        category: selectedCat,
        emoji: customType === 'income' ? '💰' : '💸'
      };

      stageSimulation(customAction);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawerModal();
    });
  }

  // --- DOM READY INITIALIZATION ---
  window.addEventListener('DOMContentLoaded', () => {
    initMouseSpotlight();
    initCard3DTilt();
    ChartEngine.init();
    setupEvents();
    renderApp();
  });
})();
