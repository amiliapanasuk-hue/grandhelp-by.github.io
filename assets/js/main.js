/* ===== vb-q7m — Главный экран ===== */
(function(){
  var root=document.getElementById('vb-q7m');
  if(!root)return;
  var burger=document.getElementById('vb-q7m-burger');
  var menu=document.getElementById('vb-q7m-menu');
  var themeBtn=document.getElementById('vb-q7m-theme');
  var themeLabel=document.getElementById('vb-q7m-theme-label');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function applyTheme(t){
    document.documentElement.setAttribute('data-theme',t);
    if(document.body){
      document.body.style.background=(t==='light')?'#eef3fb':'#0a1120';
      document.body.style.color=(t==='light')?'#0c1626':'#e9f1ff';
    }
    Array.prototype.forEach.call(document.querySelectorAll('.vb-q7m__theme'),function(b){
      b.setAttribute('aria-pressed',t==='light'?'true':'false');
    });
    if(themeLabel){themeLabel.textContent=(t==='light')?'Тёмная тема':'Светлая тема';}
  }
  var mqLight=(window.matchMedia)?window.matchMedia('(prefers-color-scheme: light)'):null;
  applyTheme(document.documentElement.getAttribute('data-theme')==='light'?'light':'dark');
  if(themeBtn){
    themeBtn.addEventListener('click',function(){
      var next=document.documentElement.getAttribute('data-theme')==='light'?'dark':'light';
      document.documentElement.setAttribute('data-theme-manual','1');
      applyTheme(next);
    });
  }
  if(mqLight&&typeof mqLight.addEventListener==='function'){
    mqLight.addEventListener('change',function(e){
      if(document.documentElement.getAttribute('data-theme-manual')==='1')return;
      applyTheme(e.matches?'light':'dark');
    });
  }

  if(burger&&menu){
    burger.addEventListener('click',function(){
      var open=menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded',open?'true':'false');
    });
  }

  var tgTrigger=document.getElementById('vb-tg-trigger');
  var tgMenu=document.getElementById('vb-tg-menu');
  if(tgTrigger&&tgMenu){
    tgTrigger.addEventListener('click',function(e){
      e.stopPropagation();
      tgMenu.classList.toggle('is-open');
    });
    document.addEventListener('click',function(e){
      if(!tgTrigger.contains(e.target)){
        tgMenu.classList.remove('is-open');
      }
    });
  }


  root.addEventListener('click',function(e){
    var link=e.target.closest('a[href^="#"]');
    if(!link)return;
    var id=link.getAttribute('href').slice(1);
    if(!id)return;
    var target=document.getElementById(id);
    if(!target)return;
    e.preventDefault();
    if(menu){menu.classList.remove('is-open');}
    if(burger){burger.setAttribute('aria-expanded','false');}
    target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
  });
})();

/* ===== vb-k3d — О проекте и симулятор ===== */
(function(){
  var root=document.getElementById('vb-k3d');
  if(!root)return;
  var steps=root.querySelectorAll('.vb-k3d__step');
  Array.prototype.forEach.call(steps,function(step){
    var btn=step.querySelector('.vb-k3d__step-btn');
    if(!btn)return;
    btn.addEventListener('click',function(){
      var open=step.classList.toggle('is-open');
      btn.setAttribute('aria-expanded',open?'true':'false');
    });
  });
})();

/* ===== vb-r5x — Карта эмпатии Беларуси ===== */
(function(){
  var root=document.getElementById('vb-r5x');
  if(!root)return;
  var markersBox=document.getElementById('vb-r5x-markers');
  var tip=document.getElementById('vb-r5x-tip');
  var mapWrap=root.querySelector('.vb-r5x__mapwrap');
  var list=document.getElementById('vb-r5x-list');
  var live=document.getElementById('vb-r5x-live');
  var modal=document.getElementById('vb-r5x-modal');
  var addBtn=document.getElementById('vb-r5x-add');
  var cancelBtn=document.getElementById('vb-r5x-cancel');
  var form=document.getElementById('vb-r5x-form');
  var errBox=document.getElementById('vb-r5x-err');
  var numP=document.getElementById('vb-r5x-p');
  var numC=document.getElementById('vb-r5x-c');
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var activeMarker=null;

  var CENTERS={
    'Брестская':{x:22.1,y:70.4},'Витебская':{x:54.1,y:19.2},'Гомельская':{x:66.1,y:73.8},
    'Гродненская':{x:22.1,y:48.3},'Минская':{x:46.1,y:41.4},'Могилёвская':{x:66.1,y:48.3}
  };

  function buildTip(marker){
    tip.textContent='';
    var city=document.createElement('p');city.className='vb-r5x__tip-city';city.textContent=marker.getAttribute('data-city');
    var status=document.createElement('p');status.className='vb-r5x__tip-status';status.textContent=marker.getAttribute('data-status');
    var venue=document.createElement('p');venue.className='vb-r5x__tip-row';
    var v1=document.createElement('span');v1.textContent='Локация: ';venue.appendChild(v1);venue.appendChild(document.createTextNode(marker.getAttribute('data-venue')));
    var sim=document.createElement('p');sim.className='vb-r5x__tip-row';
    var s1=document.createElement('span');s1.textContent='Проведено симуляций: ';sim.appendChild(s1);sim.appendChild(document.createTextNode(marker.getAttribute('data-sim')));
    var part=document.createElement('p');part.className='vb-r5x__tip-row';
    var p1=document.createElement('span');p1.textContent='Участников: ';part.appendChild(p1);part.appendChild(document.createTextNode(marker.getAttribute('data-participants')));
    var call=document.createElement('p');call.className='vb-r5x__tip-row';
    var c1=document.createElement('span');c1.textContent='Совершено «звонков заботы»: ';call.appendChild(c1);call.appendChild(document.createTextNode(marker.getAttribute('data-call')));
    tip.appendChild(city);tip.appendChild(status);tip.appendChild(venue);tip.appendChild(sim);tip.appendChild(part);tip.appendChild(call);
  }

  function placeTip(marker){
    var offsetParent=tip.offsetParent||mapWrap;
    var boxRect=offsetParent.getBoundingClientRect();
    var mRect=marker.getBoundingClientRect();
    tip.style.top=(mRect.top-boxRect.top-12)+'px';
    var half=tip.offsetWidth/2;
    var center=mRect.left-boxRect.left+mRect.width/2;
    var min=half+6, max=boxRect.width-half-6;
    tip.style.left=(center<min?min:(center>max?max:center))+'px';
  }

  function showTip(marker){buildTip(marker);tip.hidden=false;placeTip(marker);}
  function hideTip(){
    if(activeMarker){activeMarker.classList.remove('is-active');}
    activeMarker=null;tip.hidden=true;
  }

  markersBox.addEventListener('mouseover',function(e){
    var m=e.target.closest('.vb-r5x__marker');
    if(!m||activeMarker)return;
    showTip(m);
  });
  markersBox.addEventListener('mouseout',function(e){
    var m=e.target.closest('.vb-r5x__marker');
    if(!m)return;
    if(activeMarker)return;
    tip.hidden=true;
  });
  markersBox.addEventListener('focusin',function(e){
    var m=e.target.closest('.vb-r5x__marker');
    if(!m)return;
    activeMarker=m;m.classList.add('is-active');
    showTip(m);
  });
  markersBox.addEventListener('click',function(e){
    var m=e.target.closest('.vb-r5x__marker');
    if(!m)return;
    if(activeMarker===m){hideTip();return;}
    if(activeMarker){activeMarker.classList.remove('is-active');}
    activeMarker=m;m.classList.add('is-active');
    showTip(m);
  });
  document.addEventListener('click',function(e){
    if(!activeMarker)return;
    if(e.target.closest('.vb-r5x__markers'))return;
    hideTip();
  });
  window.addEventListener('resize',function(){if(activeMarker){placeTip(activeMarker);}});

  function animate(el,to,suffix){
    if(reduced){el.textContent=to+(suffix||'');return;}
    var start=null,dur=1500;
    function step(ts){
      if(start===null)start=ts;
      var p=Math.min(1,(ts-start)/dur);
      var e=1-Math.pow(1-p,3);
      el.textContent=Math.round(to*e)+(suffix||'');
      if(p<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var chEl=document.getElementById('vb-r5x-ch');
  var countersFired=false;
  function totals(){
    var s=0,c=0,p=0;
    Array.prototype.forEach.call(markersBox.querySelectorAll('.vb-r5x__marker'),function(m){
      s+=parseInt(m.getAttribute('data-sim'),10)||0;
      c+=parseInt(m.getAttribute('data-call'),10)||0;
      p+=parseInt(m.getAttribute('data-participants'),10)||0;
    });
    return{sim:s,call:c,participants:p};
  }
  function refreshCounters(){
    var t=totals();
    numP.setAttribute('data-to',t.participants);
    numC.setAttribute('data-to',t.call);
    if(countersFired){animate(numP,t.participants,'');animate(numC,t.call,'');}
  }
  function fireCounters(){
    if(countersFired)return;
    countersFired=true;
    var t=totals();
    animate(numP,t.participants,'');
    animate(numC,t.call,'');
    animate(chEl,parseInt(chEl.getAttribute('data-to'),10)||0,'%');
  }
  var t0=totals();
  numP.setAttribute('data-to',t0.participants);
  numC.setAttribute('data-to',t0.call);
  if('IntersectionObserver' in window && !reduced){
    numP.textContent='0';numC.textContent='0';chEl.textContent='0%';
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){if(en.isIntersecting){fireCounters();io.disconnect();}});
    },{threshold:.3});
    io.observe(root.querySelector('.vb-r5x__counters'));
  }else{
    fireCounters();
  }

  function addPoint(data){
    var center=CENTERS[data.region]||{x:50,y:45};
    var x=(center.x+(Math.random()*7-3.5)).toFixed(1)+'%';
    var y=(center.y+(Math.random()*7-3.5)).toFixed(1)+'%';

    var btn=document.createElement('button');
    btn.type='button';
    btn.className='vb-r5x__marker';
    btn.style.setProperty('--x',x);
    btn.style.setProperty('--y',y);
    btn.setAttribute('data-city',data.city);
    btn.setAttribute('data-status','Проведено: '+data.date);
    btn.setAttribute('data-venue',data.venue);
    btn.setAttribute('data-sim',String(data.sim));
    btn.setAttribute('data-call',String(data.call));
    btn.setAttribute('aria-label',data.city+': проведено симуляций '+data.sim);
    var pin=document.createElement('span');pin.className='vb-r5x__marker-pin';
    var img=document.createElement('img');img.src='assets/icons/marker_location_place_where.svg';img.alt='';
    pin.appendChild(img);
    var name=document.createElement('span');name.className='vb-r5x__marker-name';name.textContent=data.city;
    btn.appendChild(pin);btn.appendChild(name);
    markersBox.appendChild(btn);

    var li=document.createElement('li');
    li.className='vb-r5x__point';
    var dot=document.createElement('span');dot.className='vb-r5x__dot';dot.setAttribute('aria-hidden','true');
    var box=document.createElement('div');
    var strong=document.createElement('strong');strong.textContent=data.city;
    var l1=document.createElement('span');l1.textContent='Проведено: '+data.date+' · '+data.venue;
    var l2=document.createElement('span');l2.textContent='Проведено симуляций: '+data.sim+' · Совершено «звонков заботы»: '+data.call;
    box.appendChild(strong);box.appendChild(l1);box.appendChild(l2);
    li.appendChild(dot);li.appendChild(box);
    list.insertBefore(li,list.firstChild);

    refreshCounters();
    live.textContent='Точка «'+data.city+'» добавлена на карту.';
  }

  if(addBtn&&modal&&modal.showModal){
    addBtn.addEventListener('click',function(){errBox.textContent='';modal.showModal();});
  }
  if(cancelBtn&&modal&&modal.close){
    cancelBtn.addEventListener('click',function(){modal.close();});
  }
  if(form){
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var city=form.city.value.trim();
      var venue=form.venue.value.trim();
      if(!city||!venue){
        errBox.textContent='Заполните название населённого пункта и учреждения.';
        return;
      }
      addPoint({
        region:form.region.value,
        city:city,
        venue:venue,
        sim:parseInt(form.sim.value,10)||0,
        call:parseInt(form.call.value,10)||0,
        date:form.date.value||'по плану'
      });
      form.reset();
      if(modal.close){modal.close();}
    });
  }

  var ACCESS='emiliapanasuk';
  var adminBtn=document.getElementById('vb-r5x-admin-btn');
  var adminDialog=document.getElementById('vb-r5x-admin');
  var gate=document.getElementById('vb-r5x-gate');
  var passInput=document.getElementById('vb-r5x-pass');
  var unlockBtn=document.getElementById('vb-r5x-unlock');
  var gateErr=document.getElementById('vb-r5x-gate-err');
  var adminBody=document.getElementById('vb-r5x-admin-body');
  var adminPoints=document.getElementById('vb-r5x-admin-points');
  var adminCh=document.getElementById('vb-r5x-admin-ch');
  var adminMsg=document.getElementById('vb-r5x-admin-msg');
  var unlocked=false;

  function markerList(){
    return Array.prototype.slice.call(markersBox.querySelectorAll('.vb-r5x__marker'));
  }

  function syncPlan(){
    markerList().forEach(function(m){
      var plan=(parseInt(m.getAttribute('data-sim'),10)||0)===0;
      m.classList.toggle('vb-r5x__marker--plan',plan);
    });
  }

  function renderList(){
    list.textContent='';
    markerList().forEach(function(m){
      var sim=parseInt(m.getAttribute('data-sim'),10)||0;
      var call=parseInt(m.getAttribute('data-call'),10)||0;
      var participants=parseInt(m.getAttribute('data-participants'),10)||0;
      var li=document.createElement('li');
      li.className=sim===0?'vb-r5x__point vb-r5x__point--plan':'vb-r5x__point';
      var dot=document.createElement('span');dot.className='vb-r5x__dot';dot.setAttribute('aria-hidden','true');
      var box=document.createElement('div');
      var strong=document.createElement('strong');strong.textContent=m.getAttribute('data-city');
      var l1=document.createElement('span');
      l1.textContent=m.getAttribute('data-status')+' · '+m.getAttribute('data-venue');
      var l2=document.createElement('span');
      l2.textContent='Проведено симуляций: '+sim+' · Совершено «звонков заботы»: '+call+' · Участников: '+participants;
      box.appendChild(strong);box.appendChild(l1);box.appendChild(l2);
      li.appendChild(dot);li.appendChild(box);
      list.appendChild(li);
    });
  }

  function setChangePercent(v,animateIt){
    chEl.setAttribute('data-to',String(v));
    if(animateIt&&countersFired){animate(chEl,v,'%');}
    else{chEl.textContent=v+'%';}
  }

  function buildAdminFields(){
    adminPoints.textContent='';
    markerList().forEach(function(m,i){
      var row=document.createElement('div');
      row.className='vb-r5x__admin-row';
      row.setAttribute('data-idx',String(i));
      var city=document.createElement('p');
      city.className='vb-r5x__admin-city';
      city.textContent=m.getAttribute('data-city');
      row.appendChild(city);
      var grid=document.createElement('div');grid.className='vb-r5x__admin-opts';
      [['status','Статус',m.getAttribute('data-status')],
       ['sim','Проведено симуляций',m.getAttribute('data-sim')],
       ['participants','Участников',m.getAttribute('data-participants')],
       ['call','«Звонков заботы»',m.getAttribute('data-call')]].forEach(function(f){
        var lab=document.createElement('label');lab.className='vb-r5x__admin-opt';
        lab.appendChild(document.createTextNode(f[1]));
        var inp=document.createElement('input');
        inp.type=(f[0]==='status')?'text':'number';
        if(f[0]!=='status'){inp.min='0';}
        inp.value=f[2];
        inp.setAttribute('data-field',f[0]);
        lab.appendChild(inp);
        grid.appendChild(lab);
      });
      row.appendChild(grid);
      adminPoints.appendChild(row);
    });
    adminCh.value=chEl.getAttribute('data-to');
  }

  function applyAdminFields(){
    var ms=markerList();
    Array.prototype.forEach.call(adminPoints.querySelectorAll('.vb-r5x__admin-row'),function(row){
      var idx=parseInt(row.getAttribute('data-idx'),10);
      var m=ms[idx];
      if(!m)return;
      var st=row.querySelector('[data-field="status"]');
      var sm=row.querySelector('[data-field="sim"]');
      var pa=row.querySelector('[data-field="participants"]');
      var cl=row.querySelector('[data-field="call"]');
      if(st&&st.value.trim()){m.setAttribute('data-status',st.value.trim());}
      if(sm){m.setAttribute('data-sim',String(Math.max(0,parseInt(sm.value,10)||0)));}
      if(pa){m.setAttribute('data-participants',String(Math.max(0,parseInt(pa.value,10)||0)));}
      if(cl){m.setAttribute('data-call',String(Math.max(0,parseInt(cl.value,10)||0)));}
    });
    var ch=parseInt(adminCh.value,10);
    if(!isNaN(ch)&&ch>=0){setChangePercent(Math.min(100,ch),true);}
    syncPlan();
    renderList();
    refreshCounters();
    if(activeMarker){showTip(activeMarker);}
    adminMsg.textContent='Статистика обновлена. Нажмите «Экспорт данных», чтобы сохранить её в файл.';
  }

  function unlock(){
    if(passInput.value===ACCESS){
      unlocked=true;
      gate.hidden=true;
      adminBody.hidden=false;
      gateErr.textContent='';
      buildAdminFields();
    }else{
      gateErr.textContent='Неверный код доступа.';
      passInput.value='';
    }
  }

  if(unlockBtn){unlockBtn.addEventListener('click',unlock);}
  if(passInput){
    passInput.addEventListener('keydown',function(e){
      if(e.key==='Enter'){e.preventDefault();unlock();}
    });
  }
  if(adminBtn&&adminDialog&&adminDialog.showModal){
    adminBtn.addEventListener('click',function(){
      adminMsg.textContent='';
      if(!unlocked){passInput.value='';}
      adminDialog.showModal();
    });
  }
  var applyBtn=document.getElementById('vb-r5x-apply');
  if(applyBtn){applyBtn.addEventListener('click',applyAdminFields);}
  var closeBtn=document.getElementById('vb-r5x-admin-close');
  if(closeBtn&&adminDialog&&adminDialog.close){closeBtn.addEventListener('click',function(){adminDialog.close();});}
  var exportBtn=document.getElementById('vb-r5x-export');
  if(exportBtn){
    exportBtn.addEventListener('click',function(){
      var payload={
        ch:parseInt(chEl.getAttribute('data-to'),10)||0,
        points:markerList().map(function(m){
          return{
            city:m.getAttribute('data-city'),
            status:m.getAttribute('data-status'),
            venue:m.getAttribute('data-venue'),
            sim:parseInt(m.getAttribute('data-sim'),10)||0,
            participants:parseInt(m.getAttribute('data-participants'),10)||0,
            call:parseInt(m.getAttribute('data-call'),10)||0
          };
        })
      };
      var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;a.download='karta-statistika.json';
      document.body.appendChild(a);a.click();
      document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
      adminMsg.textContent='Файл со статистикой карты сохранён.';
    });
  }
  var importInput=document.getElementById('vb-r5x-import');
  if(importInput){
    importInput.addEventListener('change',function(){
      var file=importInput.files&&importInput.files[0];
      if(!file)return;
      var reader=new FileReader();
      reader.onload=function(){
        try{
          var data=JSON.parse(String(reader.result));
          if(!data||!data.points||!data.points.length){
            adminMsg.textContent='Файл не содержит данных статистики карты.';
            return;
          }
          var ms=markerList();
          data.points.forEach(function(p,i){
            var m=ms[i];
            if(!m||!p)return;
            if(typeof p.status==='string'){m.setAttribute('data-status',p.status);}
            if(typeof p.venue==='string'){m.setAttribute('data-venue',p.venue);}
            if(typeof p.sim==='number'&&p.sim>=0){m.setAttribute('data-sim',String(p.sim));}
            if(typeof p.participants==='number'&&p.participants>=0){m.setAttribute('data-participants',String(p.participants));}
            if(typeof p.call==='number'&&p.call>=0){m.setAttribute('data-call',String(p.call));}
          });
          if(typeof data.ch==='number'&&data.ch>=0){setChangePercent(Math.min(100,data.ch),true);}
          syncPlan();
          renderList();
          refreshCounters();
          if(activeMarker){showTip(activeMarker);}
          if(unlocked){buildAdminFields();}
          adminMsg.textContent='Данные импортированы и применены.';
        }catch(err){
          adminMsg.textContent='Не удалось прочитать файл.';
        }
      };
      reader.readAsText(file);
      importInput.value='';
    });
  }

  syncPlan();
})();

/* ===== vb-p4n — Видеоинтервью и соцсети ===== */
(function(){
  var root=document.getElementById('vb-p4n');
  if(!root)return;
  var cards=root.querySelectorAll('.vb-p4n__vcard');
  Array.prototype.forEach.call(cards,function(card){
    var video=card.querySelector('.vb-p4n__video');
    var play=card.querySelector('.vb-p4n__play');
    if(!video||!play)return;
    play.addEventListener('click',function(){
      Array.prototype.forEach.call(root.querySelectorAll('.vb-p4n__video'),function(other){
        if(other!==video&&!other.paused){other.pause();}
      });
      var p=video.play();
      if(p&&typeof p.catch==='function'){p.catch(function(){});}
    });
    video.addEventListener('play',function(){
      video.controls=true;
      card.classList.add('is-playing');
    });
    video.addEventListener('pause',function(){card.classList.remove('is-playing');});
    video.addEventListener('ended',function(){card.classList.remove('is-playing');});
  });
})();

/* ===== vb-t8c — Интерактивный мониторинг ===== */
(function(){
  var root=document.getElementById('vb-t8c');
  if(!root)return;

  var DATA={
    in:[
      {title:'Когда Вы видите, как пожилой человек медленно считает копейки на кассе, путается в кнопках банкомата или переспрашивает один и тот же вопрос, что Вы чувствуете на самом деле?',opts:{'Раздражение и досада':5,'Снисходительная жалость':8,'Равнодушие':4,'Боль и желание помочь':10}},
      {title:'Вспомните Ваш последний разговор с бабушкой, дедушкой или пожилыми родителями. Каким он был?',opts:{'Формальный':7,'Скучно внутри':5,'Разные миры':2,'Тёплый по душам':13}},
      {title:'Как часто Вы САМИ, без напоминания родителей, звоните или заходите в гости к своим пожилым родственникам просто так, чтобы узнать, как дела?',opts:{'Никогда или по праздникам':4,'Очень редко':6,'1–2 раза в месяц':7,'Каждую неделю':6,'Почти каждый день':4}},
      {title:'Задумывались ли Вы когда-нибудь о том, что старость — это не просто морщины, а ежедневная физическая борьба с собственным телом?',opts:{'Не думал(а) об этом':8,'Стараюсь не думать':9,'Вижу на примере близких':10}},
      {title:'«Старость далеко, меня это пока не касается» — согласны ли Вы с этим утверждением?',opts:{'Полностью согласен':7,'Думать об этом странно':12,'Время летит быстро':8}}
    ],
    out:[
      {title:'Какое чувство внутри Вас было самым сильным, когда Вы оказались в «костюме эмпатии» один на один с простым бытом?',opts:{'Беспомощность и паника':12,'Одиночество':8,'Злость на себя':4,'Обида':3}},
      {title:'Какое из бытовых заданий вызвало у Вас самый сильный внутренний протест и дискомфорт?',opts:{'«Поход в магазин»':10,'«Звонок внуку»':9,'«Одинокий чай»':5,'«Выход на улицу»':3}},
      {title:'Что Вы почувствовали в ту самую секунду, когда волонтёры полностью сняли с Вас «комплект эмпатии»?',opts:{'Эйфория и облегчение':14,'Острая грусть':7,'Стыд за прошлое раздражение':4,'Ничего особенного':2}},
      {title:'Насколько сильно эти 15 минут в симуляторе изменили Ваше понимание старости и отношение к пожилым людям?',opts:{'1 · Никак':0,'2 · Незначительно':1,'3 · Заставили задуматься':4,'4 · Серьёзно':12,'5 · Перевернули сознание':10}},
      {title:'Как Вы поступите в следующий раз, если окажетесь в очереди за медлительным пожилым человеком?',opts:{'Скрытое раздражение':2,'Абстрагируюсь':3,'Спокойно и терпеливо':10,'Предложу помощь':12}},
      {title:'Ключевой итог: совершили ли Вы «Звонок заботы» или написали тёплое сообщение близким прямо на площадке?',opts:{'Позвонил(а)':26,'Написал(а) сообщение':0,'Сделаю сегодня':1,'Нет, не планирую':0}},
      {title:'Оставьте ОДНО слово или фразу, которая лучше всего описывает то, что сейчас происходит у Вас на душе:',type:'text',opts:{}}
    ]
  };

  var tabs=root.querySelectorAll('.vb-t8c__tab');
  var panels={in:document.getElementById('vb-t8c-panel-in'),out:document.getElementById('vb-t8c-panel-out')};
  var chartBox=document.getElementById('vb-t8c-chartbox');
  var current='in';
  var ACCESS='emiliapanasuk';
  var ENDPOINT='https://formsubmit.co/ajax/panasyuk_emiliya@mail.ru';

  function postPayload(payload){
    if(typeof fetch!=='function')return;
    try{
      fetch(ENDPOINT,{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(payload)
      }).catch(function(){});
    }catch(err){}
  }

  function collectAnswers(form,key){
    var data={
      '_subject':(key==='in'?'Опрос до симуляции':'Опрос после симуляции')+' — Мост поколений',
      'Анкета':(key==='in'?'Я ещё НЕ проходил симулятор':'Я только что ПРОШЁЛ симулятор')
    };
    Array.prototype.forEach.call(form.elements,function(el){
      if(!el.name||el.disabled)return;
      if(el.type==='radio'){if(el.checked){data[el.name]=el.value;}return;}
      data[el.name]=el.value;
    });
    return data;
  }

  function render(key){
    chartBox.textContent='';
    DATA[key].forEach(function(q,i){
      if(q.type==='text'){return;}
      var chart=document.createElement('div');chart.className='vb-t8c__chart';
      var title=document.createElement('p');title.className='vb-t8c__chart-title';
      var tnum=document.createElement('span');tnum.className='vb-t8c__chart-num';tnum.textContent=String(i+1);
      var ttext=document.createElement('span');ttext.textContent=q.title;
      title.appendChild(tnum);title.appendChild(ttext);
      chart.appendChild(title);
      var keys=Object.keys(q.opts);
      var max=1;
      keys.forEach(function(k){if(q.opts[k]>max)max=q.opts[k];});
      keys.forEach(function(k){
        var row=document.createElement('div');row.className='vb-t8c__bar-row';
        var label=document.createElement('div');label.className='vb-t8c__bar-label';
        var name=document.createElement('span');name.textContent=k;
        var val=document.createElement('b');val.textContent=String(q.opts[k]);
        label.appendChild(name);label.appendChild(val);
        var track=document.createElement('div');track.className='vb-t8c__bar-track';
        var fill=document.createElement('div');fill.className='vb-t8c__bar-fill';
        track.appendChild(fill);
        row.appendChild(label);row.appendChild(track);
        chart.appendChild(row);
        requestAnimationFrame(function(){
          fill.style.width=Math.round(q.opts[k]/max*100)+'%';
        });
      });
      chartBox.appendChild(chart);
    });
    if(key==='out'){
      var openNote=document.createElement('p');
      openNote.className='vb-t8c__charts-note';
      openNote.textContent='Вопрос 7 — открытый: одно слово или фраза о состоянии собираются текстом и в диаграммы не входят.';
      chartBox.appendChild(openNote);
    }
  }

  Array.prototype.forEach.call(tabs,function(tab){
    tab.addEventListener('click',function(){
      var key=tab.getAttribute('data-key');
      current=key;
      Array.prototype.forEach.call(tabs,function(t){
        t.setAttribute('aria-selected',t===tab?'true':'false');
      });
      Object.keys(panels).forEach(function(k){
        panels[k].hidden=(k!==key);
        var sb=panels[k].querySelector('.js-successbox');
        if(sb&&k!==key){sb.style.display='none';}
      });
      render(key);
    });
  });

  function clearErrors(form){
    Array.prototype.forEach.call(form.querySelectorAll('.t-input-error'),function(e){e.textContent='';});
    var g=form.querySelector('.vb-t8c__err');
    if(g)g.textContent='';
    var all=form.querySelector('.js-errorbox-all');
    if(all)all.style.display='none';
  }

  function validateForm(form,key){
    clearErrors(form);
    for(var i=1;i<=DATA[key].length;i++){
      var q=DATA[key][i-1];
      var box=form.querySelectorAll('.vb-t8c__q')[i-1];
      var fe=box?box.querySelector('.t-input-error'):null;
      var eb=form.querySelector('.vb-t8c__err');
      if(q&&q.type==='text'){
        var open=box?box.querySelector('[data-t8c-open="true"]'):null;
        if(!open||!open.value.trim()){
          if(fe)fe.textContent='Это обязательное поле — оставьте одно слово или короткую фразу.';
          if(eb)eb.textContent='Пожалуйста, заполните вопрос №'+i+'.';
          if(open){open.focus();}
          return false;
        }
        continue;
      }
      if(!form.querySelector('input[name="'+key+'-q'+i+'"]:checked')){
        if(fe)fe.textContent='Выберите один из вариантов ответа.';
        if(eb)eb.textContent='Пожалуйста, ответьте на вопрос №'+i+'.';
        return false;
      }
    }
    return true;
  }

  function recordAnswers(form,key){
    for(var j=0;j<DATA[key].length;j++){
      var q=DATA[key][j];
      if(!q||q.type==='text'){continue;}
      var sel=form.querySelector('input[name="'+key+'-q'+(j+1)+'"]:checked');
      if(sel&&Object.prototype.hasOwnProperty.call(q.opts,sel.value)){
        q.opts[sel.value]=q.opts[sel.value]+1;
      }
    }
    render(key);
  }

  function showSuccess(form,key){
    var box=form.querySelector('.js-successbox');
    if(!box)return;
    box.textContent=(key==='in')
      ? 'Спасибо! Ваш входящий ответ принят и уже отражён в живой статистике. После симуляции пройдите исходящую анкету — так мы увидим, как меняется восприятие.'
      : 'Спасибо! Ваш исходящий ответ принят и добавлен в статистику. Помните: самый ценный итог — «звонок заботы» близким.';
    box.style.display='block';
  }

  function updateProgress(form){
    var key=form.getAttribute('data-key');
    var bar=root.querySelector('[data-t8c-bar="'+key+'"]');
    var txt=root.querySelector('[data-t8c-progress="'+key+'"]');
    if(!bar||!txt)return;
    var total=0,done=0;
    var boxes=form.querySelectorAll('.vb-t8c__q');
    Array.prototype.forEach.call(boxes,function(box,i){
      var q=DATA[key]&&DATA[key][i];
      if(!q)return;
      total++;
      if(q.type==='text'){
        var open=box.querySelector('[data-t8c-open="true"]');
        if(open&&open.value.trim()){done++;}
      }else if(form.querySelector('input[name="'+key+'-q'+(i+1)+'"]:checked')){
        done++;
      }
    });
    var pct=total?Math.round(done/total*100):0;
    bar.style.width=pct+'%';
    txt.textContent='Отвечено '+done+' из '+total;
  }

  Object.keys(panels).forEach(function(key){
    var form=panels[key];
    if(!form)return;
    updateProgress(form);
    form.addEventListener('change',function(){updateProgress(form);});
    form.addEventListener('input',function(){updateProgress(form);});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!validateForm(form,key)){return;}
      recordAnswers(form,key);
      postPayload(collectAnswers(form,key));
      showSuccess(form,key);
      form.reset();
      updateProgress(form);
    });
  });

  var adminBtn=document.getElementById('vb-t8c-admin-btn');
  var adminDialog=document.getElementById('vb-t8c-admin');
  var gate=document.getElementById('vb-t8c-gate');
  var passInput=document.getElementById('vb-t8c-pass');
  var unlockBtn=document.getElementById('vb-t8c-unlock');
  var gateErr=document.getElementById('vb-t8c-gate-err');
  var adminBody=document.getElementById('vb-t8c-admin-body');
  var adminFields=document.getElementById('vb-t8c-admin-fields');
  var adminMsg=document.getElementById('vb-t8c-admin-msg');
  var unlocked=false;

  function buildAdminFields(){
    adminFields.textContent='';
    ['in','out'].forEach(function(k){
      DATA[k].forEach(function(q,qi){
        if(q.type==='text'){return;}
        var wrap=document.createElement('div');wrap.className='vb-t8c__admin-q';
        var t=document.createElement('p');
        t.textContent=(k==='in'?'До симуляции · ':'После симуляции · ')+(qi+1)+'. '+q.title;
        wrap.appendChild(t);
        var grid=document.createElement('div');grid.className='vb-t8c__admin-opts';
        Object.keys(q.opts).forEach(function(name){
          var lab=document.createElement('label');lab.className='vb-t8c__admin-opt';
          lab.appendChild(document.createTextNode(name));
          var inp=document.createElement('input');
          inp.type='number';inp.min='0';inp.value=String(q.opts[name]);
          inp.setAttribute('data-skey',k);
          inp.setAttribute('data-qi',String(qi));
          inp.setAttribute('data-opt',name);
          lab.appendChild(inp);
          grid.appendChild(lab);
        });
        wrap.appendChild(grid);
        adminFields.appendChild(wrap);
      });
    });
  }

  function applyAdminFields(){
    Array.prototype.forEach.call(adminFields.querySelectorAll('input[type="number"]'),function(inp){
      var k=inp.getAttribute('data-skey');
      var qi=parseInt(inp.getAttribute('data-qi'),10);
      var name=inp.getAttribute('data-opt');
      if(!DATA[k]||!DATA[k][qi]||!Object.prototype.hasOwnProperty.call(DATA[k][qi].opts,name))return;
      var v=parseInt(inp.value,10);
      if(isNaN(v)||v<0){v=0;}
      DATA[k][qi].opts[name]=v;
    });
    render(current);
    adminMsg.textContent='Статистика обновлена. Нажмите «Экспорт данных», чтобы сохранить её в файл.';
  }

  function unlock(){
    if(passInput.value===ACCESS){
      unlocked=true;
      gate.hidden=true;
      adminBody.hidden=false;
      gateErr.textContent='';
      buildAdminFields();
    }else{
      gateErr.textContent='Неверный код доступа.';
      passInput.value='';
    }
  }

  if(unlockBtn){unlockBtn.addEventListener('click',unlock);}
  if(passInput){
    passInput.addEventListener('keydown',function(e){
      if(e.key==='Enter'){e.preventDefault();unlock();}
    });
  }
  if(adminBtn&&adminDialog&&adminDialog.showModal){
    adminBtn.addEventListener('click',function(){
      adminMsg.textContent='';
      if(!unlocked){passInput.value='';}
      adminDialog.showModal();
    });
  }
  var applyBtn=document.getElementById('vb-t8c-apply');
  if(applyBtn){applyBtn.addEventListener('click',applyAdminFields);}
  var closeBtn=document.getElementById('vb-t8c-admin-close');
  if(closeBtn&&adminDialog&&adminDialog.close){closeBtn.addEventListener('click',function(){adminDialog.close();});}
  var exportBtn=document.getElementById('vb-t8c-export');
  if(exportBtn){
    exportBtn.addEventListener('click',function(){
      var payload={survey:{}};
      ['in','out'].forEach(function(k){
        payload.survey[k]=DATA[k].map(function(q){
          var opts={};
          Object.keys(q.opts).forEach(function(o){opts[o]=q.opts[o];});
          return{title:q.title,opts:opts};
        });
      });
      var blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
      var url=URL.createObjectURL(blob);
      var a=document.createElement('a');
      a.href=url;a.download='oprosy-statistika.json';
      document.body.appendChild(a);a.click();
      document.body.removeChild(a);
      setTimeout(function(){URL.revokeObjectURL(url);},1000);
      adminMsg.textContent='Файл со статистикой опросов сохранён.';
    });
  }
  var importInput=document.getElementById('vb-t8c-import');
  if(importInput){
    importInput.addEventListener('change',function(){
      var file=importInput.files&&importInput.files[0];
      if(!file)return;
      var reader=new FileReader();
      reader.onload=function(){
        try{
          var data=JSON.parse(String(reader.result));
          var s=data&&data.survey;
          var ok=false;
          if(s){
            ['in','out'].forEach(function(k){
              if(!s[k]||!s[k].length)return;
              s[k].forEach(function(q,qi){
                if(!DATA[k][qi]||!q||!q.opts)return;
                ok=true;
                if(typeof q.title==='string'){DATA[k][qi].title=q.title;}
                Object.keys(DATA[k][qi].opts).forEach(function(o){
                  var v=q.opts[o];
                  if(typeof v==='number'&&v>=0){DATA[k][qi].opts[o]=v;}
                });
              });
            });
          }
          if(ok){
            render(current);
            if(unlocked){buildAdminFields();}
            adminMsg.textContent='Данные импортированы и применены.';
          }else{
            adminMsg.textContent='Файл не содержит данных статистики опросов.';
          }
        }catch(err){
          adminMsg.textContent='Не удалось прочитать файл.';
        }
      };
      reader.readAsText(file);
      importInput.value='';
    });
  }

  render('in');
})();

/* ===== vb-f5k — Вопросы и ответы ===== */
(function(){
  var root=document.getElementById('vb-f5k');
  if(!root)return;
  var items=root.querySelectorAll('.vb-f5k__item');
  Array.prototype.forEach.call(items,function(item){
    var btn=item.querySelector('.vb-f5k__btn');
    if(!btn)return;
    btn.addEventListener('click',function(){
      var open=item.classList.toggle('is-open');
      btn.setAttribute('aria-expanded',open?'true':'false');
    });
  });
})();

/* ===== vb-y4v — Заявка на выезд ===== */
(function(){
  var root=document.getElementById('vb-y4v');
  if(!root)return;
  var form=document.getElementById('vb-y4v-form');
  if(!form)return;
  var submitBtn=form.querySelector('[type="submit"]');
  var phone=document.getElementById('vb-y4v-phone');
  var successBox=form.querySelector('.js-successbox');

  if(phone){
    phone.addEventListener('input',function(){
      var d=phone.value.replace(/\D/g,'');
      if(d.indexOf('375')===0){d=d.slice(3);}
      d=d.slice(0,9);
      var out='+375';
      if(d.length>0){out+=' ('+d.slice(0,2);}
      if(d.length>=2){out+=')';}
      if(d.length>2){out+=' '+d.slice(2,5);}
      if(d.length>5){out+='-'+d.slice(5,7);}
      if(d.length>7){out+='-'+d.slice(7,9);}
      phone.value=out;
    });
  }

  function fieldError(el,message){
    var box=el.closest('.vb-y4v__field')||el.closest('.vb-y4v__fieldset');
    if(!box)return;
    var err=box.querySelector('.t-input-error');
    if(err){err.textContent=message||'';}
  }
  function fallbackValidate(){
    var ok=true;
    var required=form.querySelectorAll('[data-req="1"]');
    Array.prototype.forEach.call(required,function(el){
      if(el.type==='radio'){
        var group=form.querySelectorAll('input[name="'+el.name+'"]');
        var checked=Array.prototype.some.call(group,function(r){return r.checked;});
        fieldError(el,checked?'':'Выберите тип учреждения.');
        if(!checked){ok=false;}
        return;
      }
      var val=(el.value||'').trim();
      if(!val){
        fieldError(el,'Обязательное поле.');
        ok=false;
        return;
      }
      if(el.id==='vb-y4v-phone'){
        var digits=val.replace(/\D/g,'');
        if(digits.length<12){fieldError(el,'Введите номер полностью: +375 (XX) XXX-XX-XX.');ok=false;return;}
      }
      if(el.id==='vb-y4v-email'){
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)){fieldError(el,'Проверьте адрес электронной почты.');ok=false;return;}
      }
      fieldError(el,'');
    });
    return ok;
  }

  var ENDPOINT='https://formsubmit.co/ajax/panasyuk_emiliya@mail.ru';
  var statusEl=document.getElementById('vb-y4v-status');
  var busy=false;

  function setStatus(state){
    if(!statusEl)return;
    statusEl.className='vb-y4v__status'+(state==='fail'?' vb-y4v__status--fail':'');
    if(state==='sending'){statusEl.textContent='Отправляем заявку…';return;}
    if(state==='fail'){statusEl.textContent='Не удалось отправить заявку автоматически. Пожалуйста, повторите попытку через несколько минут.';return;}
    statusEl.textContent='';
  }

  function collectPayload(){
    var data={};
    Array.prototype.forEach.call(form.elements,function(el){
      if(!el.name||el.disabled)return;
      if(el.type==='radio'){if(el.checked){data[el.name]=el.value;}return;}
      data[el.name]=el.value;
    });
    data._subject='Заявка на выезд — Мост поколений: 15 минут в будущем';
    return data;
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(busy)return;

    var valid=fallbackValidate();
    if(!valid){
      setStatus('');
      if(successBox){successBox.style.display='none';}
      return;
    }

    busy=true;
    submitBtn.disabled=true;
    setStatus('sending');
    if(successBox){successBox.style.display='none';}

    fetch(ENDPOINT,{
      method:'POST',
      headers:{'Content-Type':'application/json','Accept':'application/json'},
      body:JSON.stringify(collectPayload())
    }).then(function(res){
      if(!res.ok){throw new Error('bad-response');}
      busy=false;
      submitBtn.disabled=false;
      setStatus('ok');
      if(successBox){successBox.style.display='block';}
      form.reset();
    }).catch(function(){
      busy=false;
      submitBtn.disabled=false;
      setStatus('fail');
    });
  });
})();

/* ===== vb-h2p — Политика конфиденциальности ===== */
(function(){
  var dialog=document.getElementById('vb-h2p-dialog');
  if(!dialog||typeof dialog.showModal!=='function')return;
  var closeBtn=document.getElementById('vb-h2p-close');
  document.addEventListener('click',function(e){
    var trigger=(e.target&&e.target.closest)?e.target.closest('[data-privacy-open]'):null;
    if(!trigger)return;
    e.preventDefault();
    if(!dialog.open){dialog.showModal();}
  });
  dialog.addEventListener('click',function(e){
    var link=(e.target&&e.target.closest)?e.target.closest('a[href^="#"]'):null;
    if(link&&dialog.open){dialog.close();}
  });
  if(closeBtn){closeBtn.addEventListener('click',function(){if(dialog.open){dialog.close();}});}
})();

/* ===== vb-f3j — Подвал сайта ===== */
(function(){
  var root=document.getElementById('vb-f3j');
  if(!root)return;
  var reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.addEventListener('click',function(e){
    var link=e.target.closest('a[href^="#"]');
    if(!link)return;
    var id=link.getAttribute('href').slice(1);
    var target=id?document.getElementById(id):null;
    if(!target)return;
    e.preventDefault();
    target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
  });
})();
