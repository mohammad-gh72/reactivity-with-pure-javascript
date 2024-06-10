import { reactiveIt, effect } from "./reactive";
//-------
const parent = document.getElementById("app");
const btninc = document.querySelector(".btninc");
const btndec = document.querySelector(".btndec");
const handleImage = document.querySelector(".handleimage");
const ptag = document.getElementById("paragraph");

// -----------------

const obj = reactiveIt({ count: 0, show: false });
//------
btninc.addEventListener("click", () => {
  obj.count++;
});
//-------
btndec.addEventListener("click", () => {
  if (obj.count <= 0) return;
  obj.count--;
});

//------------

handleImage.addEventListener("click", () => {
  obj.show = !obj.show;
});

//------------------------------------------------------------------------
// Notice that each effect should only perform a single job
// (single responsibility principle) to prevent conflicts between actions.

//this effect for changing p tag's inner text only
effect(() => {
  ptag.innerText = obj.count;
});

// this effect only for controling of showing or hiding the image tag base on (show)
//property of the (proxy) object
effect(() => {
  if (obj.show === true) {
    const img = document.createElement("img");
    img.src = "public/vite.svg";
    img.classList.add("image");
    parent.append(img);
  }
  if (obj.show === false) {
    const img = document.querySelector(".image");
    if (img) {
      img.remove();
    }
  }
});
