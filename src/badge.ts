const makeBadge = require("badge-maker/lib/make-badge");

const k8sIconURL = "./logo.svg";

export function renderBadge(label: string, message: string, messageBackgroundColor: string): string {
  return makeBadge({
    logo: k8sIconURL,
    label: label,
    labelColor: "gray",
    message: message,
    color: messageBackgroundColor,
    style: "plastic"
  });
}