import { NextResponse } from 'next/server';
import os from 'os';

export async function GET(request: Request) {
  try {
    // Optional: Secure this route so only Vercel Cron can trigger it
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 1. Gather Vercel Serverless node metrics
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;
    
    for (let cpu in cpus) {
      user += cpus[cpu].times.user;
      nice += cpus[cpu].times.nice;
      sys += cpus[cpu].times.sys;
      irq += cpus[cpu].times.irq;
      idle += cpus[cpu].times.idle;
    }
    
    const total = user + nice + sys + idle + irq;
    const active = total - idle;
    const cpuUsage = Math.round((active / total) * 100) || 0;

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = Math.round((usedMem / totalMem) * 100) || 0;

    // 2. Measure latency (e.g., pinging an external service)
    const start = Date.now();
    await fetch('https://www.google.com', { method: 'HEAD' });
    const latency = Date.now() - start;

    // 3. Fire the payload to your new MetricPulse dashboard
    // Make sure this matches your actual deployed MetricPulse URL!
    await fetch('https://themetricpulse.vercel.app/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'metric',
        payload: { cpu: cpuUsage, memory: memoryUsage, latency }
      })
    });

    return NextResponse.json({ success: true, message: 'Pulse sent successfully' });
  } catch (error) {
    console.error('Pulse error:', error);
    return NextResponse.json({ error: 'Failed to send pulse' }, { status: 500 });
  }
}