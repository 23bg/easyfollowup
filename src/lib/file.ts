// File handling utilities: file picker, CSV parsing, XLSX dynamic parsing (optional), mapping to lead schema

export type PickOptions = {
  multiple?: boolean;
  accept?: string[]; // e.g. ['.csv', '.xlsx']
};

export async function pickFiles(opts: PickOptions = {}): Promise<File[]> {
  if (typeof window === 'undefined') return [];
  const multiple = !!opts.multiple;
  const accept = opts.accept ?? ['.csv', '.xlsx'];

  // Preferred API
  try {
    const win: any = window as any;
    if (typeof win.showOpenFilePicker === 'function') {
      const types = [
        {
          description: 'Spreadsheet files',
          accept: {
            'text/csv': ['.csv'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
          },
        },
      ];
      const handles: any[] = await win.showOpenFilePicker({ multiple, types });
      const files: File[] = [];
      for (const h of handles) {
        const f = await h.getFile();
        files.push(f);
      }
      return files;
    }
  } catch (e) {
    // fallthrough to input
  }

  // Fallback: input element
  return await new Promise<File[]>((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept.join(',');
    input.multiple = multiple;
    input.onchange = () => {
      const files = input.files ? Array.from(input.files) : [];
      resolve(files);
    };
    input.click();
  });
}

// Basic CSV parser that supports quoted fields
function parseCSVText(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length === 0) return [];

  function parseLine(line: string) {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (ch === ',' && !inQuotes) {
        out.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out;
  }

  const headers = parseLine(lines[0]).map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseLine(lines[i]);
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j] ?? `col${j}`] = (cols[j] ?? '').trim();
    }
    rows.push(obj);
  }
  return rows;
}

export async function parseCSV(file: File) {
  const text = await file.text();
  return parseCSVText(text);
}

// Try to parse XLSX dynamically using 'xlsx' if available.
export async function parseXlsx(file: File) {
  try {
    // dynamic import to avoid bundling unless used
    const XLSX = await import('xlsx');
    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab, { type: 'array' });
    const first = wb.SheetNames[0];
    const ws = wb.Sheets[first];
    const json = XLSX.utils.sheet_to_json(ws, { defval: '' }) as Record<string, any>[];
    return json;
  } catch (e) {
    throw new Error('Parsing .xlsx requires the optional dependency "xlsx"; please provide CSV or install xlsx.');
  }
}

export function mapToLeadSchema(rows: Record<string, any>[]) {
  // map heuristically to { name, email, phone, status, tags }
  return rows.map((r) => {
    const normalized: Record<string, string> = {};
    const keys = Object.keys(r);
    const keyMap: Record<string, string> = {};
    for (const k of keys) {
      keyMap[k.toLowerCase().replace(/[^a-z0-9]/g, '')] = k;
    }

    function find(...cands: string[]) {
      for (const c of cands) {
        const k = keyMap[c.toLowerCase().replace(/[^a-z0-9]/g, '')];
        if (k && r[k] != null && String(r[k]).trim() !== '') return String(r[k]).trim();
      }
      return '';
    }

    const name = find('name', 'fullname', 'full name', 'firstlast', 'first name');
    const email = find('email', 'e-mail');
    const phone = find('phone', 'mobile', 'contact');
    const status = find('status', 'stage');
    const company = find('company', 'organisation', 'organization');

    return {
      name: name || `${r[keys[0]] ?? ''}`.toString(),
      email: email || '',
      phone: phone || '',
      status: status || 'new',
      company: company || '',
      raw: r,
    };
  });
}

export default {
  pickFiles,
  parseCSV,
  parseXlsx,
  mapToLeadSchema,
};
