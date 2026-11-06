import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
const bundled=path.join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const candidates=[process.env.PORTFOLIO_PYTHON,existsSync(bundled)?bundled:null,'python3','python'].filter(Boolean);
let selected;
for(const executable of candidates){
  const check=spawnSync(executable,['-c','import sys; assert sys.version_info >= (3, 9); print("ok")'],{encoding:'utf8',windowsHide:true,timeout:10000});
  if(check.status===0&&check.stdout.trim()==='ok'){selected=executable;break;}
}
if(!selected)throw new Error('Python 3.9+ required. Set PORTFOLIO_PYTHON to its executable.');
const result=spawnSync(selected,['scripts/prepare.py',...process.argv.slice(2)],{stdio:'inherit',windowsHide:true});
process.exit(result.status??1);
