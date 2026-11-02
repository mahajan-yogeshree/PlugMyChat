export function GET() {
  const script = `(function () {
  var script = document.currentScript;
  if (!script) return;
  var agent = script.getAttribute("data-agent");
  if (!agent) return;
  var origin = new URL(script.src).origin;
  var page = "";
  try { page = window.location.href.slice(0, 500); } catch (e) { page = ""; }
  var button = document.createElement("button");
  button.type = "button";
  button.textContent = "Chat";
  button.setAttribute("aria-label", "Open chat");
  button.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2147483000;border:0;border-radius:999px;background:#1f7a4d;color:#f4fff8;font:500 14px/1 Instrument Sans,system-ui,sans-serif;padding:14px 18px;cursor:pointer";
  var frame = document.createElement("iframe");
  frame.title = "Chat";
  var src = origin + "/embed/" + encodeURIComponent(agent);
  if (/^https?:\\/\\//i.test(page)) src += "?page=" + encodeURIComponent(page);
  frame.src = src;
  frame.style.cssText = "position:fixed;right:20px;bottom:76px;z-index:2147483000;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 120px));border:0;border-radius:16px;background:#fff;display:none";
  button.addEventListener("click", function () {
    var open = frame.style.display === "none";
    frame.style.display = open ? "block" : "none";
    button.setAttribute("aria-expanded", open ? "true" : "false");
  });
  fetch(origin + "/api/public-agent/" + encodeURIComponent(agent))
    .then(function (response) { return response.json(); })
    .then(function (body) {
      var record = body && body.agent;
      if (!record) return;
      if (record.launcherLabel) button.textContent = String(record.launcherLabel).slice(0, 24);
      if (/^#[0-9a-fA-F]{6}$/.test(record.accent || "")) button.style.background = record.accent;
    })
    .catch(function () {});
  document.body.appendChild(frame);
  document.body.appendChild(button);
})();`;
  return new Response(script, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
