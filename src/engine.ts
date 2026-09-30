import BN from 'bn.js';
import Decimal from 'decimal.js';
import {Connection, PublicKey} from '@solana/web3.js';
import {
  DynamicBondingCurveClient, buildCurveWithMarketCap, getPriceFromSqrtPrice,
  validateConfigParameters, ActivationType, BaseFeeMode, CollectFeeMode,
  MigrationOption, MigrationFeeOption, TokenType, TokenAuthorityOption, SwapMode,
  type ConfigParameters, type BuildCurveWithMarketCapParams,
} from '@meteora-ag/dynamic-bonding-curve-sdk';

export const SDK_VERSION = '1.5.13';
export const SCHEMA = 'curvescope/v1';
export interface Inputs {
  supply:number; initialFdv:number; migrationFdv:number; startFeeBps:number;
  endFeeBps:number; durationMinutes:number; elapsedMinutes:number;
  buyAmount:number; slippageBps:number; lockedLpPercent:number;
}
export const DEFAULTS:Inputs = {supply:1e9,initialFdv:50000,migrationFdv:500000,startFeeBps:200,endFeeBps:50,durationMinutes:60,elapsedMinutes:0,buyAmount:1000,slippageBps:100,lockedLpPercent:100};
export const PRESETS = [
  {name:'Balanced launch',detail:'10× price discovery · 2% → 0.5%',values:DEFAULTS},
  {name:'Gentle discovery',detail:'3× price discovery · 1% flat',values:{...DEFAULTS,initialFdv:100000,migrationFdv:300000,startFeeBps:100,endFeeBps:100,durationMinutes:0}},
  {name:'Steep discovery',detail:'40× price discovery · 5% → 1%',values:{...DEFAULTS,initialFdv:25000,migrationFdv:1000000,startFeeBps:500,endFeeBps:100,durationMinutes:120}},
];
export function parseInputs(value:unknown):Inputs {
  if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Enter a configuration object.');
  const v=value as Record<string,unknown>;
  const limits:Record<keyof Inputs,[number,number]>={supply:[1000,1e12],initialFdv:[10,1e9],migrationFdv:[11,1e10],startFeeBps:[1,9900],endFeeBps:[1,9900],durationMinutes:[0,1440],elapsedMinutes:[0,2880],buyAmount:[0.000001,1e9],slippageBps:[0,5000],lockedLpPercent:[0,100]};
  const out={} as Inputs;
  for(const key of Object.keys(limits) as (keyof Inputs)[]){
    const x=v[key], [min,max]=limits[key];
    if(typeof x!=='number'||!Number.isFinite(x)||x<min||x>max) throw new Error(`${key} must be a number between ${min} and ${max}.`);
    if(key!=='buyAmount'&&!Number.isSafeInteger(x)) throw new Error(`${key} must be a whole number.`);
    out[key]=x;
  }
  if(new Decimal(out.buyAmount).decimalPlaces()>6) throw new Error('USDC amounts support at most 6 decimal places.');
  if(out.migrationFdv<=out.initialFdv*1.01) throw new Error('Graduation FDV must be more than 1% above the initial FDV.');
  if(out.endFeeBps>out.startFeeBps) throw new Error('The ending fee cannot exceed the starting fee.');
  if(out.startFeeBps!==out.endFeeBps&&out.durationMinutes===0) throw new Error('A changing fee needs a positive duration.');
  return out;
}
export function buildConfig(raw:Inputs):ConfigParameters{
  const i=parseInputs(raw);
  const p:BuildCurveWithMarketCapParams={
    token:{tokenType:TokenType.SPLToken,tokenBaseDecimal:6,tokenQuoteDecimal:6,tokenAuthorityOption:TokenAuthorityOption.Immutable,totalTokenSupply:i.supply,leftover:0},
    fee:{baseFeeParams:{baseFeeMode:BaseFeeMode.FeeSchedulerLinear,feeSchedulerParam:{startingFeeBps:i.startFeeBps,endingFeeBps:i.endFeeBps,numberOfPeriod:i.startFeeBps===i.endFeeBps?0:i.durationMinutes,totalDuration:i.startFeeBps===i.endFeeBps?0:i.durationMinutes*60}},dynamicFeeEnabled:false,collectFeeMode:CollectFeeMode.QuoteToken,creatorTradingFeePercentage:0,poolCreationFee:0,enableFirstSwapWithMinFee:false},
    migration:{migrationOption:MigrationOption.MET_DAMM_V2,migrationFeeOption:MigrationFeeOption.FixedBps100,migrationFee:{feePercentage:0,creatorFeePercentage:0}},
    liquidityDistribution:{partnerLiquidityPercentage:0,partnerPermanentLockedLiquidityPercentage:0,creatorLiquidityPercentage:100-i.lockedLpPercent,creatorPermanentLockedLiquidityPercentage:i.lockedLpPercent},
    lockedVesting:{totalLockedVestingAmount:0,numberOfVestingPeriod:0,cliffUnlockAmount:0,totalVestingDuration:0,cliffDurationFromMigrationTime:0},
    activationType:ActivationType.Timestamp,initialMarketCap:i.initialFdv,migrationMarketCap:i.migrationFdv,
  };
  const config=buildCurveWithMarketCap(p);
  // A nonzero placeholder is required by SDK validation even with no leftover.
  // It is never exported as a recipient or used for any transaction.
  validateConfigParameters({...config,leftoverReceiver:new PublicKey(new Uint8Array(32).fill(1))});
  return config;
}
// The SDK constructor is local. Only its pure pre-pool quotation method is used;
// no RPC methods, wallet adapters, or transaction submission paths are invoked.
const client = new DynamicBondingCurveClient(new Connection('https://api.mainnet-beta.solana.com'),'confirmed');
const units=(n:BN)=>new Decimal(n.toString()).div(1e6).toNumber();
const atoms=(n:number)=>new BN(new Decimal(n).mul(1e6).floor().toFixed(0));
export function quote(config:ConfigParameters,i:Inputs,amount:number,elapsed=i.elapsedMinutes){
  const q=client.pool.getQuoteFromInputAmount({config,swapBaseForQuote:false,swapMode:SwapMode.PartialFill,amountIn:atoms(amount),slippageBps:i.slippageBps,hasReferral:false,currentPoint:new BN(elapsed*60)});
  const output=units(q.outputAmount), used=units(q.includedFeeInputAmount), net=units(q.excludedFeeInputAmount);
  const initialPrice=getPriceFromSqrtPrice(config.sqrtStartPrice,6,6).toNumber();
  const averagePrice=output>0?used/output:0;
  return {requested:amount,used,unfilled:Math.max(0,amount-used),output,minimumOutput:units(q.minimumAmountOut??q.outputAmount),fee:used-net,averagePrice,
    curveImpactPct:output>0?(net/output/initialPrice-1)*100:0,
    costVsSpotPct:output>0?(averagePrice/initialPrice-1)*100:0,
    endPrice:getPriceFromSqrtPrice(q.nextSqrtPrice,6,6).toNumber(),
    exact:{includedFeeInputAmount:q.includedFeeInputAmount.toString(),excludedFeeInputAmount:q.excludedFeeInputAmount.toString(),outputAmount:q.outputAmount.toString(),minimumAmountOut:(q.minimumAmountOut??q.outputAmount).toString(),nextSqrtPrice:q.nextSqrtPrice.toString()}};
}
export type Quote=ReturnType<typeof quote>;
export function analyze(raw:Inputs){
  const inputs=parseInputs(raw), config=buildConfig(inputs);
  const threshold=units(config.migrationQuoteThreshold);
  const selected=quote(config,inputs,inputs.buyAmount);
  const points=Array.from({length:32},(_,j)=>quote(config,inputs,Math.max(0.000001,Number((threshold*(j+1)/32).toFixed(6)))));
  const sizes=[.01,.05,.1,.25,.5,1,1.5].map(f=>quote(config,inputs,Number((threshold*f).toFixed(6))));
  const feeWindows=[0,Math.floor(inputs.durationMinutes/2),inputs.durationMinutes].map(minute=>({minute,...quote(config,inputs,inputs.buyAmount,minute)}));
  const notes:string[]=[];
  if(selected.unfilled>0.000001) notes.push(`This order crosses the DBC graduation boundary. ${selected.unfilled.toFixed(6)} USDC is unfilled; DAMM v2 trading is not simulated.`);
  if(selected.curveImpactPct>10) notes.push(`Curve-only average-price impact is ${selected.curveImpactPct.toFixed(2)}%. Consider a deeper launch or smaller order size.`);
  if(inputs.lockedLpPercent<100) notes.push(`${100-inputs.lockedLpPercent}% of migrated LP is withdrawable by the creator. Disclose this liquidity-control choice.`);
  if(inputs.startFeeBps>500) notes.push('The opening trading fee exceeds 5%. Review the buyer experience before using this configuration.');
  return {inputs,config,threshold,initialPrice:getPriceFromSqrtPrice(config.sqrtStartPrice,6,6).toNumber(),selected,points,sizes,feeWindows,notes};
}
export type Analysis=ReturnType<typeof analyze>;
export function decimalTree(v:unknown):unknown {
  if(BN.isBN(v)) return v.toString(10);
  if(Array.isArray(v))return v.map(decimalTree);
  if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,decimalTree(x)]));
  return v;
}
export function report(a:Analysis){
  return {schema:SCHEMA,sdk:{name:'@meteora-ag/dynamic-bonding-curve-sdk',version:SDK_VERSION},model:'Independent first-buy quotes against an empty virtual pool at each requested elapsed timestamp. Not a sequence of trades.',quoteToken:{symbol:'USDC',decimals:6},baseToken:{decimals:6},inputs:a.inputs,assumptions:{network:'offline',dynamicFees:false,transferFees:false,referral:false,vesting:false,migration:'DAMM v2; 100 bps trading fee after migration; post-migration swaps not simulated',activation:'relative seconds; timestamp 0',feeSchedule:'linear, one period per minute',lockedLp:a.inputs.lockedLpPercent},summary:{migrationQuoteThreshold:a.threshold,initialPrice:a.initialPrice,selected:a.selected},sizeStress:a.sizes,feeWindows:a.feeWindows,notes:a.notes,sdkConfigDecimalIntegers:decimalTree(a.config)};
}
export function importReport(text:string){
  if(text.length>1_000_000)throw new Error('The file is too large. Maximum size is 1 MB.');
  const value=JSON.parse(text);
  if(value.schema!==SCHEMA)throw new Error('Use a CurveScope v1 report.');
  return parseInputs(value.inputs);
}
