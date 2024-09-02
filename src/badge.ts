const makeBadge = require("badge-maker/lib/make-badge");
const fs = require("fs");
const path = require("path");
const k8sIconURL = fs.readFileSync(path.resolve("./public/k8s.svg"), { encoding: "base64" });

export function renderBadge(label: string, message: string, messageBackgroundColor: string): string {
  return makeBadge({
    logo: `data:image/svg+xml;base64,${k8sIconURL}`,
    label: label,
    labelColor: "gray",
    message: message,
    color: messageBackgroundColor,
    style: "plastic"
  });
}
