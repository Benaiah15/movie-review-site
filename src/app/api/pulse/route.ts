import { NextResponse } from 'next/server';
import os from 'os';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Optional check for strict security
    }

    // 1. Gather serverless metrics
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

    const start = Date.now();
    await fetch('https://www.google.com', { method: 'HEAD' });
    const latency = Date.now() - start;

    // 2. Send the Metric payload to MetricPulse
    await fetch('https://themetricpulse.vercel.app/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'metric',
        payload: { cpu: cpuUsage, memory: memoryUsage, latency }
      })
    });

    // 3. Send a Log payload to MetricPulse so it populates the audit table!
    await fetch('https://themetricpulse.vercel.app/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'log',
        payload: {
          service: 'moviespace-production',
          severity: 'info',
          message: `Routine health check successful. CPU: ${cpuUsage}%, RAM: ${memoryUsage}%, Latency: ${latency}ms`
        }
      })
    });

    return NextResponse.json({ success: true, message: 'Pulse and log sent successfully' });
  } catch (error) {
    console.error('Pulse error:', error);
    return NextResponse.json({ error: 'Failed to send pulse' }, { status: 500 });
  }
}