export function GET() {
  const script = `(function () {
  var script = document.currentScript;
  if (!script) return;
  var agent = script.getAttribute("data-agent");
  if (!agent) return;
  var origin = new URL(script.src).origin;
  var button = document.createElement("button");
  button.type = "button";
  button.textContent = "Chat";
  button.setAttribute("aria-label", "Open chat");
  button.style.cssText = "position:fixed;right:20px;bottom:20px;z-index:2147483000;border:0;border-radius:999px;background:#4f46e5;color:#fff;font:600 14px/1 system-ui,sans-serif;padding:14px 18px;box-shadow:0 10px 30px rgba(16,24,40,.2);cursor:pointer";
  var frame = document.createElement("iframe");
  frame.title = "Chat";
  frame.src = origin + "/embed/" + encodeURIComponent(agent);
  frame.style.cssText = "position:fixed;right:20px;bottom:76px;z-index:2147483000;width:min(380px,calc(100vw - 32px));height:min(560px,calc(100vh - 120px));border:0;border-radius:16px;box-shadow:0 20px 50px rgba(16,24,40,.25);background:#fff;display:none";
  button.addEventListener("click", function () {
    var open = frame.style.display === "none";
    frame.style.display = open ? "block" : "none";
    button.textContent = open ? "Close" : "Chat";
  });
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
