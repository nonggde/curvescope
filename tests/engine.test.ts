import {describe,it,expect} from 'vitest';
import {analyze,DEFAULTS,parseInputs,report,importReport,PRESETS,quote,decimalTree} from '../src/engine';
import BN from 'bn.js';

describe('Meteora DBC simulation invariants',()=>{
  it('builds every preset through the real SDK and produces finite prices',()=>{
    for(const p of PRESETS){const a=analyze(p.values);expect(a.threshold).toBeGreaterThan(0);expect(a.selected.output).toBeGreaterThan(0);expect(a.initialPrice).toBeCloseTo(p.values.initialFdv/p.values.supply,8);expect(a.selected.minimumOutput).toBeLessThan(a.selected.output);}
  });
  it('separates the trading fee from curve impact',()=>{
    const a=analyze(DEFAULTS),q=a.selected;
    expect(q.used).toBeCloseTo(q.fee+Number(q.exact.excludedFeeInputAmount)/1e6,6);
    expect(q.costVsSpotPct).toBeGreaterThan(q.curveImpactPct);
    expect(q.fee).toBeCloseTo(DEFAULTS.buyAmount*.02,5);
  });
  it('higher first-buy sizes have increasing average execution prices',()=>{
    const a=analyze(DEFAULTS);
    for(let i=1;i<a.points.length;i++)expect(a.points[i].averagePrice).toBeGreaterThan(a.points[i-1].averagePrice);
  });
  it('caps a large order at graduation and accounts for unfilled funds',()=>{
    const a=analyze(DEFAULTS),q=quote(a.config,DEFAULTS,a.threshold*2);
    expect(q.unfilled).toBeGreaterThan(0);
    expect(q.used+q.unfilled).toBeCloseTo(q.requested,5);
    expect(Number(q.exact.excludedFeeInputAmount)).toBeLessThanOrEqual(a.threshold*1e6+1);
  });
  it('linear fee decay improves token output without inventing prior activity',()=>{
    const a=analyze(DEFAULTS);
    expect(a.feeWindows[2].fee).toBeLessThan(a.feeWindows[0].fee);
    expect(a.feeWindows[2].output).toBeGreaterThan(a.feeWindows[0].output);
    expect(a.feeWindows[2].fee).toBeCloseTo(5,5);
  });
  it('slippage changes the minimum, not the actual modeled output',()=>{
    const a=analyze(DEFAULTS),b=analyze({...DEFAULTS,slippageBps:500});
    expect(b.selected.output).toEqual(a.selected.output);
    expect(b.selected.minimumOutput).toBeLessThan(a.selected.minimumOutput);
  });
  it('exports BN values in decimal without losing precision',()=>{
    expect(decimalTree({large:new BN('1000000000000000000000000000001')})).toEqual({large:'1000000000000000000000000000001'});
    const a=analyze(DEFAULTS),r=report(a);expect(importReport(JSON.stringify(r))).toEqual(DEFAULTS);
    expect(report(analyze(importReport(JSON.stringify(r))))).toEqual(r);
  });
  it('rejects dangerous or malformed inputs instead of displaying stale results',()=>{
    for(const change of [{supply:NaN},{initialFdv:0},{migrationFdv:10},{startFeeBps:1,endFeeBps:500},{durationMinutes:0},{buyAmount:0.0000001},{elapsedMinutes:-1},{slippageBps:10001},{supply:'1000000'}])expect(()=>parseInputs({...DEFAULTS,...change})).toThrow();
    expect(()=>importReport('{"schema":"other"}')).toThrow();
    expect(()=>importReport('x'.repeat(1000001))).toThrow();
  });
  it('flags unlocked migrated liquidity and boundary cases',()=>{
    const a=analyze({...DEFAULTS,lockedLpPercent:60,buyAmount:1e8});
    expect(a.notes.some(n=>n.includes('40%'))).toBe(true);
    expect(a.notes.some(n=>n.includes('unfilled'))).toBe(true);
  });
});
