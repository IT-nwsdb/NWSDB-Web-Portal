(function(){
const sheets = Object.keys(window.DESIGNATIONS);
let currentSheet = sheets[0];
let currentZone = null;
let currentYear = parseInt(localStorage.getItem('cadre_year')||'2025',10);

const elTabs = document.getElementById('sheetTabs');
const elTitle = document.getElementById('sheetTitle');
const elBody = document.getElementById('tableBody');
const elYear = document.getElementById('currentYear');
const zoneWrap = document.getElementById('zoneWrap');
const zoneSelect = document.getElementById('zoneSelect');
const saveToast = document.getElementById('saveToast');
const headerRow = document.getElementById('headerRow');

function key(sheet, zone){ return `cadre_${currentYear}_${sheet}_${zone||'DEFAULT'}`; }

function buildTabs(){
  elTabs.innerHTML = '';
  sheets.forEach(sh=>{
    const li=document.createElement('li');
    li.className='nav-item';
    const a=document.createElement('a');
    a.href='#';
    a.className='nav-link'+(sh===currentSheet?' active':'');
    a.textContent=sh;
    a.onclick=(e)=>{e.preventDefault(); switchSheet(sh);};
    li.appendChild(a);
    elTabs.appendChild(li);
  });
}

function buildHeader(){
  headerRow.innerHTML='';
  window.HEADERS.forEach((h, idx)=>{
    const th=document.createElement('th');
    th.textContent = h;
    // dynamic year label: the Excel header says 2011 approved Cadre (A) but keep same text
    headerRow.appendChild(th);
  });
}

function getZones(sheet){
  const z = window.DESIGNATIONS[sheet];
  return Object.keys(z);
}

function ensureZoneExists(sheet, zoneName){
  if(!window.DESIGNATIONS[sheet][zoneName]){
    const first = Object.keys(window.DESIGNATIONS[sheet])[0];
    window.DESIGNATIONS[sheet][zoneName] = [...window.DESIGNATIONS[sheet][first]];
  }
}

function switchSheet(sheet){
  currentSheet = sheet;
  buildTabs();
  const zones = getZones(sheet);
  if(zones.length>1){
    zoneWrap.classList.remove('d-none');
    zoneSelect.innerHTML='';
    zones.forEach(z=>{
      const opt=document.createElement('option');
      opt.value=z; opt.textContent=z;
      zoneSelect.appendChild(opt);
    });
    currentZone = localStorage.getItem(`cadre_zone_${sheet}`) || zones[0];
    if(!zones.includes(currentZone)) currentZone=zones[0];
    zoneSelect.value=currentZone;
    zoneSelect.onchange=()=>{ currentZone=zoneSelect.value; localStorage.setItem(`cadre_zone_${sheet}`, currentZone); render(); };
  }else{
    zoneWrap.classList.add('d-none');
    currentZone = zones[0];
  }
  render();
}

function numberOrZero(v){
  const n=parseFloat(v);
  return isNaN(n)?0:n;
}

function calcRow(row){
  const B=numberOrZero(row.B), C=numberOrZero(row.C), D=numberOrZero(row.D);
  const E=B+C+D;
  const F=numberOrZero(row.F), G=numberOrZero(row.G);
  const H=F+G;
  const I=H-E;
  row.E=E; row.H=H; row.I=I;
}

function emptyRow(no, designation){
  return {no, designation, A:'',B:'',C:'',D:'',E:0,F:'',G:'',H:0,I:0, remarks:'', justification:''};
}

function loadData(){
  const k=key(currentSheet,currentZone);
  const raw=localStorage.getItem(k);
  if(raw){
    try{
      const data=JSON.parse(raw);
      data.forEach(calcRow);
      return data;
    }catch(e){}
  }
  const desigs = window.DESIGNATIONS[currentSheet][currentZone] || [];
  const data = desigs.map((d,i)=>emptyRow(String(i+1).padStart(2,'0'), d));
  data.forEach(calcRow);
  return data;
}

function saveData(data){
  const k=key(currentSheet,currentZone);
  localStorage.setItem(k, JSON.stringify(data));
  saveToast.classList.remove('d-none');
  setTimeout(()=>saveToast.classList.add('d-none'),1200);
}

function render(){
  elYear.textContent = currentYear;
  elTitle.textContent = `${currentSheet}${currentZone?` — ${currentZone}`:''}`;
  buildHeader();
  const data = loadData();
  elBody.innerHTML='';
  data.forEach((row)=>{
    calcRow(row);
    const tr=document.createElement('tr');

    // No
    let td=document.createElement('td');
    td.textContent=row.no;
    tr.appendChild(td);

    // Designation
    td=document.createElement('td');
    td.textContent=row.designation;
    tr.appendChild(td);

    // A,B,C,D,E,F,G,H,I, Remarks, Justification
    const editableMap=[
      {k:'A'}, {k:'B'}, {k:'C'}, {k:'D'},
      {k:'E', readonly:true},
      {k:'F'}, {k:'G'},
      {k:'H', readonly:true},
      {k:'I', readonly:true},
      {k:'remarks', text:true},
      {k:'justification', text:true}
    ];

    editableMap.forEach(obj=>{
      const td=document.createElement('td');
      if(obj.readonly){
        td.className='table-secondary fw-semibold';
        td.textContent = row[obj.k];
        td.dataset.col=obj.k;
      }else{
        const inp=document.createElement('input');
        inp.type = obj.text ? 'text' : 'number';
        if(!obj.text){ inp.step='any'; }
        inp.className='form-control form-control-sm';
        inp.value=row[obj.k] ?? '';
        inp.oninput=()=>{
          row[obj.k]=inp.value;
          calcRow(row);
          tr.querySelector('[data-col="E"]').textContent=row.E;
          tr.querySelector('[data-col="H"]').textContent=row.H;
          tr.querySelector('[data-col="I"]').textContent=row.I;
        };
        td.appendChild(inp);
      }
      tr.appendChild(td);
    });

    // mark readonly cells
    tr.querySelectorAll('td[data-col]').forEach(td=>{
      if(td.dataset.col==='E') td.textContent=row.E;
      if(td.dataset.col==='H') td.textContent=row.H;
      if(td.dataset.col==='I') td.textContent=row.I;
    });

    elBody.appendChild(tr);
  });

  document.getElementById('saveBtn').onclick=()=>{
    const rows=[...elBody.querySelectorAll('tr')];
    const out=rows.map((tr)=>{
      const no = tr.children[0].textContent;
      const designation = tr.children[1].textContent;
      const inputs = tr.querySelectorAll('input');
      const row = emptyRow(no, designation);
      const keys=['A','B','C','D','F','G','remarks','justification'];
      keys.forEach((k,i)=>row[k]=inputs[i].value);
      calcRow(row);
      return row;
    });
    saveData(out);
  };
}

const exportBtn = document.getElementById('exportBtn');
if(exportBtn) exportBtn.onclick=()=>{
  const dump={year:currentYear, data:{}};
  sheets.forEach(sh=>{
    const zones=getZones(sh);
    zones.forEach(z=>{
      const k=key(sh,z);
      const raw=localStorage.getItem(k);
      if(raw) dump.data[k]=JSON.parse(raw);
    });
  });
  const blob=new Blob([JSON.stringify(dump,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`cadre_backup_${currentYear}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
};

const importFile = document.getElementById('importFile');
if(importFile) importFile.addEventListener('change', (e)=>{
  const file=e.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const dump=JSON.parse(reader.result);
      if(dump.data){
        Object.entries(dump.data).forEach(([k,v])=>localStorage.setItem(k, JSON.stringify(v)));
      }
      alert('Imported successfully ✅');
      render();
    }catch(err){
      alert('Invalid backup file');
    }
  };
  reader.readAsText(file);
});

document.getElementById('resetBtn').onclick=()=>{
  if(!confirm('Reset current sheet/zone data?')) return;
  localStorage.removeItem(key(currentSheet,currentZone));
  render();
};

document.getElementById('clearAllBtn').onclick=()=>{
  if(!confirm('Clear ALL saved data for all years/sheets?')) return;
  Object.keys(localStorage).forEach(k=>{ if(k.startsWith('cadre_')) localStorage.removeItem(k); });
  alert('Cleared ✅');
  render();
};

document.getElementById('setYearBtn').onclick=()=>{
  const y=parseInt(document.getElementById('yearInput').value,10);
  if(!y || y<2025){ alert('Year must be 2025 or above'); return; }
  currentYear=y;
  localStorage.setItem('cadre_year', String(currentYear));
  render();
};

document.getElementById('createZoneBtn').onclick=()=>{
  const name=document.getElementById('newZoneName').value.trim();
  if(!name){ alert('Enter zone name'); return; }
  ensureZoneExists(currentSheet, name);
  const zones=getZones(currentSheet);
  zoneWrap.classList.remove('d-none');
  zoneSelect.innerHTML='';
  zones.forEach(z=>{
    const opt=document.createElement('option');
    opt.value=z; opt.textContent=z;
    zoneSelect.appendChild(opt);
  });
  currentZone=name;
  zoneSelect.value=currentZone;
  document.getElementById('newZoneName').value='';
  render();
};

document.getElementById('addZoneBtn').onclick=()=>{
  const offcanvas = bootstrap.Offcanvas.getOrCreateInstance(document.getElementById('adminPanel'));
  offcanvas.show();
  document.getElementById('newZoneName').focus();
};

// init
buildTabs();
switchSheet(currentSheet);
render();
})();