/* Queen's Pub Brno — renders events.json into the "What's On" list on the Events page */
(function(){
  "use strict";

  var MONTH_CS = ["ledna","února","března","dubna","května","června","července","srpna","září","října","listopadu","prosince"];
  var MONTH_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  function el(tag, cls){ var e = document.createElement(tag); if(cls) e.className = cls; return e; }
  function span(text, lang){ var s = document.createElement("span"); if(lang) s.setAttribute("data-lang", lang); s.textContent = text; return s; }

  function isPast(dateStr){
    var d = new Date(dateStr + "T23:59:59");
    return d.getTime() < Date.now();
  }

  function renderRow(ev){
    var row = el("div", "event-row");
    if(isPast(ev.date)) row.classList.add("is-past");

    var d = new Date(ev.date + "T00:00:00");
    var dateCol = el("div", "date");
    var num = el("div", "num"); num.textContent = d.getDate() + ".";
    var dow = el("div", "dow");
    dow.appendChild(span(ev.dow.cs, "cs"));
    dow.appendChild(span(ev.dow.en, "en"));
    dateCol.appendChild(num); dateCol.appendChild(dow);

    var info = el("div", "info");
    var nameRow = el("div", "name-row");
    var name = el("span", "name");
    name.appendChild(span(ev.name.cs, "cs"));
    name.appendChild(span(ev.name.en, "en"));
    var time = el("span", "time"); time.textContent = ev.time;
    nameRow.appendChild(name); nameRow.appendChild(time);
    info.appendChild(nameRow);

    if(ev.desc && (ev.desc.cs || ev.desc.en)){
      var desc = el("div", "desc");
      desc.appendChild(span(ev.desc.cs, "cs"));
      desc.appendChild(span(ev.desc.en, "en"));
      info.appendChild(desc);
    }

    row.appendChild(dateCol);
    row.appendChild(info);
    return row;
  }

  function isoDateOfThisWeek(targetDow){
    // targetDow: 5 = Friday, 6 = Saturday (JS getDay())
    var today = new Date();
    var diff = (targetDow - today.getDay() + 7) % 7;
    var target = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff);
    var y = target.getFullYear(), m = String(target.getMonth()+1).padStart(2,"0"), d = String(target.getDate()).padStart(2,"0");
    return y + "-" + m + "-" + d;
  }

  function updateRhythmCell(cellId, targetDow, icon, events){
    var cell = document.getElementById(cellId);
    if(!cell) return;
    var iso = isoDateOfThisWeek(targetDow);
    var match = events.filter(function(e){ return e.date === iso; })[0];
    if(!match) return; // no data for this week yet — keep the generic "rotates" copy
    var enDiv = cell.querySelector(".en");
    var etDiv = cell.querySelector(".et");
    enDiv.innerHTML = "";
    enDiv.appendChild(document.createTextNode(icon + " "));
    enDiv.appendChild(span(match.name.cs, "cs"));
    enDiv.appendChild(span(match.name.en, "en"));
    etDiv.textContent = match.time;
  }

  function init(){
    var root = document.getElementById("events-list");
    var monthLabel = document.getElementById("events-month");
    if(!root) return;

    fetch("data/events.json").then(function(r){ return r.json(); }).then(function(data){
      if(monthLabel){
        monthLabel.appendChild(span(data.month.cs, "cs"));
        monthLabel.appendChild(span(data.month.en, "en"));
      }
      var frag = document.createDocumentFragment();
      data.events.forEach(function(ev){ frag.appendChild(renderRow(ev)); });
      root.appendChild(frag);

      updateRhythmCell("rhythm-fri", 5, "🎧", data.events);
      updateRhythmCell("rhythm-sat", 6, "🎲", data.events);

      document.dispatchEvent(new CustomEvent("events:rendered"));
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
