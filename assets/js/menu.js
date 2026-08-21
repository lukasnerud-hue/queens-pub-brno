/* Queen's Pub Brno — renders menu.json into the Menu page */
(function(){
  "use strict";

  function el(tag, cls, html){
    var e = document.createElement(tag);
    if(cls) e.className = cls;
    if(html !== undefined) e.innerHTML = html;
    return e;
  }
  function bilingual(obj, tag, cls){
    // obj = {cs:"...", en:"..."} -> wrapper with two spans
    var wrap = el(tag || "span", cls);
    var cs = el("span", null, obj.cs); cs.setAttribute("data-lang","cs");
    var en = el("span", null, obj.en); en.setAttribute("data-lang","en");
    wrap.appendChild(cs); wrap.appendChild(en);
    return wrap;
  }

  function priceMarkup(item){
    if(item.price){
      var p = el("div","price", item.price);
      return p;
    }
    if(item.small !== undefined && item.large !== undefined){
      var p2 = el("div","price", item.small + " / " + item.large + " Kč");
      return p2;
    }
    return el("div","price","");
  }

  function renderItem(item){
    var row = el("div","menu-item");
    var left = el("div");
    left.appendChild(el("div","name", item.name));
    if(item.desc){
      var d = el("div","desc");
      var cs = el("span", null, item.desc.cs); cs.setAttribute("data-lang","cs");
      var en = el("span", null, item.desc.en); en.setAttribute("data-lang","en");
      d.appendChild(cs); d.appendChild(en);
      left.appendChild(d);
    } else if(item.note){
      var n = el("div","desc");
      var ncs = el("span", null, item.note.cs); ncs.setAttribute("data-lang","cs");
      var nen = el("span", null, item.note.en); nen.setAttribute("data-lang","en");
      n.appendChild(ncs); n.appendChild(nen);
      left.appendChild(n);
    }
    row.appendChild(left);
    row.appendChild(priceMarkup(item));
    return row;
  }

  function addNavLink(nav, id, label){
    var a = document.createElement("a");
    a.href = "#" + id;
    var csS = el("span", null, label.cs); csS.setAttribute("data-lang","cs");
    var enS = el("span", null, label.en); enS.setAttribute("data-lang","en");
    a.appendChild(csS); a.appendChild(enS);
    nav.appendChild(el("li", null)).appendChild(a);
  }

  function renderPromo(promo, root, nav){
    var banner = el("div","menu-promo-banner reveal");
    var textWrap = el("div");
    textWrap.appendChild(bilingual(promo.label, "h3"));
    textWrap.appendChild(bilingual(promo.intro, "p"));
    banner.appendChild(textWrap);
    var cta = el("a","btn btn-solid", '<span data-lang="cs">Kdy běží?</span><span data-lang="en">When is it on?</span>');
    cta.setAttribute("href","events.html");
    banner.appendChild(cta);
    root.appendChild(banner);

    var wrap = el("div","menu-group", "");
    wrap.id = promo.id;
    wrap.style.paddingTop = "10px";
    var head = el("div","menu-group-head");
    head.appendChild(bilingual(promo.label, "h2"));
    wrap.appendChild(head);
    var itemsWrap = el("div");
    promo.groups.forEach(function(g){
      var sub = el("div","menu-subgroup");
      sub.appendChild(bilingual(g.label, "h3"));
      var grid = el("div","menu-items");
      g.items.forEach(function(it){ grid.appendChild(renderItem(it)); });
      sub.appendChild(grid);
      itemsWrap.appendChild(sub);
    });
    wrap.appendChild(itemsWrap);
    root.appendChild(wrap);

    addNavLink(nav, promo.id, promo.label);
  }

  function renderGroup(group, root, nav){
    var wrap = el("div","menu-group reveal");
    wrap.id = group.id;
    var head = el("div","menu-group-head");
    head.appendChild(bilingual(group.label, "h2"));
    if(group.note){
      var noteEl = bilingual(group.note, "span", "unit-note");
      head.appendChild(noteEl);
    }
    wrap.appendChild(head);

    group.subgroups.forEach(function(sg){
      var sub = el("div","menu-subgroup");
      if(sg.label){ sub.appendChild(bilingual(sg.label, "h3")); }
      var grid = el("div","menu-items");
      sg.items.forEach(function(it){ grid.appendChild(renderItem(it)); });
      sub.appendChild(grid);
      wrap.appendChild(sub);
    });
    root.appendChild(wrap);
    addNavLink(nav, group.id, group.label);
  }

  function init(){
    var root = document.getElementById("menu-root");
    var nav = document.getElementById("menu-nav-list");
    if(!root) return;
    fetch("data/menu.json").then(function(r){ return r.json(); }).then(function(data){

      // Order: Top Card, Drink, Turbo Hodina, then the rest of the menu as listed in menu.json
      data.groups.forEach(function(g){
        renderGroup(g, root, nav);
        if(g.id === "drink"){ renderPromo(data.promo, root, nav); }
      });

      // re-init reveal + scrollspy now that content exists
      document.dispatchEvent(new CustomEvent("menu:rendered"));
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
