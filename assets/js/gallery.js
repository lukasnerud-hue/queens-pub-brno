/* Queen's Pub Brno — renders gallery-manifest.json into the Gallery page */
(function(){
  "use strict";

  var CAT_LABELS_CS = {
    "bar": "Bar", "beerpong": "Beer Pong", "drinky": "Drinky",
    "koncerty": "Koncerty", "turbo-hodina": "Turbo Hodina", "vecer-na-ginu": "Večer na ginu"
  };
  var CAT_LABELS_EN = {
    "bar": "Bar", "beerpong": "Beer Pong", "drinky": "Drinks",
    "koncerty": "Live Music", "turbo-hodina": "Turbo Hodina", "vecer-na-ginu": "Gin Night"
  };

  function el(tag, cls){ var e = document.createElement(tag); if(cls) e.className = cls; return e; }

  function buildFilters(cats, wrap, activeCat){
    cats.forEach(function(c){
      var b = el("button");
      b.setAttribute("data-filter", c.slug);
      var cs = document.createElement("span"); cs.setAttribute("data-lang","cs"); cs.textContent = c.cs;
      var en = document.createElement("span"); en.setAttribute("data-lang","en"); en.textContent = c.en;
      b.appendChild(cs); b.appendChild(en);
      if(activeCat === c.slug) b.classList.add("is-active");
      wrap.appendChild(b);
    });
  }

  function buildItem(cat, photo, idx){
    var a = el("a", "masonry-item");
    a.setAttribute("data-cat", cat.slug);
    a.setAttribute("data-full", photo.full.jpg);
    a.href = photo.full.jpg;

    var picture = document.createElement("picture");
    var srcWebp = document.createElement("source");
    srcWebp.srcset = photo.thumb.webp; srcWebp.type = "image/webp";
    picture.appendChild(srcWebp);
    var img = document.createElement("img");
    img.src = photo.thumb.jpg;
    img.loading = idx < 9 ? "eager" : "lazy";
    img.alt = cat.cs + " — Queen's Pub Brno";
    picture.appendChild(img);
    a.appendChild(picture);

    var tag = el("span","tag");
    var tcs = document.createElement("span"); tcs.setAttribute("data-lang","cs"); tcs.textContent = cat.cs;
    var ten = document.createElement("span"); ten.setAttribute("data-lang","en"); ten.textContent = cat.en;
    tag.appendChild(tcs); tag.appendChild(ten);
    a.appendChild(tag);
    return a;
  }

  function init(){
    var masonry = document.getElementById("gallery-masonry");
    var filters = document.getElementById("gallery-filters");
    if(!masonry) return;

    var params = new URLSearchParams(location.search);
    var activeCat = params.get("cat");

    fetch("data/gallery-manifest.json").then(function(r){ return r.json(); }).then(function(data){
      var order = ["bar","drinky","koncerty","turbo-hodina","beerpong","vecer-na-ginu"];
      var cats = order.filter(function(s){ return data[s]; }).map(function(s){
        return {slug:s, cs: CAT_LABELS_CS[s] || data[s].label, en: CAT_LABELS_EN[s] || data[s].label};
      });

      buildFilters(cats, filters, activeCat);

      var frag = document.createDocumentFragment();
      var i = 0;
      cats.forEach(function(c){
        data[c.slug].photos.forEach(function(photo){
          var item = buildItem(c, photo, i++);
          if(activeCat && activeCat !== c.slug){ item.style.display = "none"; }
          frag.appendChild(item);
        });
      });
      masonry.appendChild(frag);

      document.dispatchEvent(new CustomEvent("gallery:rendered"));
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
