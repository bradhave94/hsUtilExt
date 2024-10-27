import{j as s,r,g as p,s as u,c as x,R as b}from"./main.js";import{i as N,g as f}from"./hubspot.js";function v({account:t,onRemove:o}){return s.jsxDEV("div",{className:"p-4 rounded-lg border border-gray-200 shadow-sm",children:s.jsxDEV("div",{className:"flex justify-between items-center",children:[s.jsxDEV("div",{children:[s.jsxDEV("h3",{className:"font-medium text-gray-900",children:t.name},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/components/AccountCard.jsx",lineNumber:6,columnNumber:11},this),s.jsxDEV("p",{className:"text-sm text-gray-500",children:["Portal ID: ",t.hubId]},void 0,!0,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/components/AccountCard.jsx",lineNumber:7,columnNumber:11},this),s.jsxDEV("p",{className:"text-sm text-gray-500",children:["Expires at: ",new Date(t.expiresAt).toLocaleString()]},void 0,!0,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/components/AccountCard.jsx",lineNumber:8,columnNumber:11},this)]},void 0,!0,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/components/AccountCard.jsx",lineNumber:5,columnNumber:9},this),s.jsxDEV("button",{onClick:()=>o(t.id),className:"text-red-600 hover:text-red-700 text-sm font-medium",children:"Remove"},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/components/AccountCard.jsx",lineNumber:11,columnNumber:9},this)]},void 0,!0,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/components/AccountCard.jsx",lineNumber:4,columnNumber:7},this)},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/components/AccountCard.jsx",lineNumber:3,columnNumber:5},this)}function E({children:t,className:o="",...c}){return s.jsxDEV("button",{className:`px-4 py-2 bg-[color:var(--color-hubspot)] hover:bg-[color:var(--color-hubspot-hover)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-md ${o}`,...c,children:t},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/components/Button.jsx",lineNumber:3,columnNumber:5},this)}function D(){const[t,o]=r.useState([]),[c,i]=r.useState(!1);r.useEffect(()=>{m()},[]);const m=async()=>{const e=await p();o(e)},d=async()=>{try{i(!0);const e=await N();console.log("Auth Result:",e);const n=await f(e.access_token);console.log("Account Info:",n);const a={hubId:n.portalId,name:n.accountName,accessToken:e.access_token,refreshToken:e.refresh_token,tokenType:e.token_type||"bearer",expiresAt:Date.now()+e.expires_in*1e3};console.log("New Account to be saved:",a);const l=[...t,a];await u(l),o(l)}catch(e){console.error("Failed to add account:",e)}finally{i(!1)}},h=async e=>{const n=t.filter(a=>a.id!==e);await u(n),o(n)};return s.jsxDEV("div",{className:"p-6 max-w-2xl mx-auto",children:[s.jsxDEV("h1",{className:"text-2xl font-bold text-gray-900 mb-6",children:"HubSpot Account Manager"},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/pages/options/Options.jsx",lineNumber:58,columnNumber:7},this),s.jsxDEV("div",{className:"space-y-4",children:t.map(e=>s.jsxDEV(v,{account:e,onRemove:h},e.hubId,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/pages/options/Options.jsx",lineNumber:64,columnNumber:11},this))},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/pages/options/Options.jsx",lineNumber:62,columnNumber:7},this),s.jsxDEV(E,{onClick:d,disabled:c,className:"mt-6",children:c?"Adding Account...":"Add HubSpot Account"},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/pages/options/Options.jsx",lineNumber:72,columnNumber:7},this)]},void 0,!0,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/pages/options/Options.jsx",lineNumber:57,columnNumber:5},this)}x(document.getElementById("root")).render(s.jsxDEV(b.StrictMode,{children:s.jsxDEV(D,{},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/pages/options/OptionsIndex.jsx",lineNumber:8,columnNumber:5},void 0)},void 0,!1,{fileName:"C:/Users/bradhave/Documents/workspace/hsUtilExt/src/pages/options/OptionsIndex.jsx",lineNumber:7,columnNumber:3},void 0));
