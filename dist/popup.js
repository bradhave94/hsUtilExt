import{r as o,j as t,g as a,c as r,R as l}from"./main.js";function u(){const[c,s]=o.useState([]);o.useEffect(()=>{(async()=>{const n=await a();s(n)})()},[]);const e=()=>{chrome.runtime.openOptionsPage()};return t.jsxs("div",{className:"p-4",children:[t.jsx("h1",{className:"text-xl font-bold text-gray-900 mb-4",children:"HubSpot Accounts"}),t.jsx("div",{className:"mb-4",children:t.jsxs("p",{className:"text-gray-600",children:["Connected accounts: ",c.length]})}),t.jsx("button",{onClick:e,className:"w-full px-4 py-2 bg-[color:var(--color-hubspot)] hover:bg-[color:var(--color-hubspot-hover)] text-white rounded-md",children:"Manage Accounts"})]})}r(document.getElementById("root")).render(t.jsx(l.StrictMode,{children:t.jsx(u,{})}));
