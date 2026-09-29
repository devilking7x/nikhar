/** Typed client for the Nikhar API (all YouCam calls stay server-side). */

export interface JobSnapshot {
  id: string;
  kind: 'skin' | 'vto' | 'look' | 'tone';
  status: 'processing' | 'done' | 'error';
  stage: string;
  stageIndex: number;
  stages: string[];
  demo: boolean;
  result?: any;
  error?: string;
}

export interface SkinConcern {
  id: string;
  score: number;
}
export interface SkinResult {
  demo: boolean;
  analyzedAt: string;
  glowScore: number;
  skinAge: number | null;
  concerns: SkinConcern[];
}

export interface Garment {
  id: string;
  name: string;
  file: string;
  category: 'upper_body' | 'full_body' | 'lower_body';
  occasions: string[];
  blurb: string;
}
export interface Occasion {
  id: string;
  name: string;
  garmentId: string;
  palette: string;
  note: string;
}

async function postJob(path: string, form: FormData): Promise<string> {
  const res = await fetch(`/api${path}`, { method: 'POST', body: form });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Request failed (${res.status})`);
  if (!body?.jobId) throw new Error('Server did not return a job id');
  return body.jobId as string;
}

export type StageCb = (stage: string, index: number, stages: string[]) => void;

async function pollJob(jobId: string, onStage?: StageCb): Promise<JobSnapshot> {
  for (;;) {
    const res = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`);
    if (!res.ok) throw new Error(`Job lookup failed (${res.status})`);
    const job = (await res.json()) as JobSnapshot;
    onStage?.(job.stage, job.stageIndex, job.stages);
    if (job.status === 'done') return job;
    if (job.status === 'error') throw new Error(job.error || 'Analysis failed');
    await new Promise((r) => setTimeout(r, 2500));
  }
}

async function runJob(path: string, form: FormData, onStage?: StageCb): Promise<JobSnapshot> {
  const jobId = await postJob(path, form);
  return pollJob(jobId, onStage);
}

const formWith = (name: string, file: File | Blob, filename?: string) => {
  const f = new FormData();
  f.append(name, file, filename || (file instanceof File ? file.name : 'upload.jpg'));
  return f;
};

export const api = {
  status: async (): Promise<{ configured: boolean; demo: boolean; balance: number | null }> => {
    const r = await fetch('/api/youcam/status');
    return r.json();
  },
  catalog: async (): Promise<{ garments: Garment[]; occasions: Occasion[] }> => {
    const r = await fetch('/api/garments');
    if (!r.ok) throw new Error('Could not load catalog');
    return r.json();
  },
  skin: (photo: File | Blob, onStage?: StageCb) => runJob('/jobs/skin', formWith('photo', photo), onStage),
  vto: (
    person: File | Blob,
    garment: File | Blob,
    category: string,
    garmentId: string,
    onStage?: StageCb,
  ) => {
    const f = new FormData();
    f.append('person', person, 'person.jpg');
    f.append('garment', garment, 'garment.jpg');
    f.append('category', category);
    f.append('garmentId', garmentId);
    return runJob('/jobs/vto', f, onStage);
  },
  look: (photo: File | Blob, occasion: string, onStage?: StageCb) => {
    const f = formWith('photo', photo);
    f.append('occasion', occasion);
    return runJob('/jobs/look', f, onStage);
  },
  tone: (photo: File | Blob, onStage?: StageCb) => runJob('/jobs/tone', formWith('photo', photo), onStage),
};
